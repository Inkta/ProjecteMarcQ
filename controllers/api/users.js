var router = require("express").Router();
var jwt = require('jwt-simple');
var bcrypt = require("bcrypt");
var User = require("../../models/user");
var config = require("../../config");
var path = require('path');
var compressor = path.resolve(__dirname, '../../compressor.js');
//--------compresor


function compressAndResize (imageUrl) {
    
  // Creem un "child process" d'aquesta manera no 
  // fem un bloqueig del EventLoop amb un ús intens de la CPU
  // al processar les imatges
  var childProcess = require('child_process').fork(compressor);
  
  
  childProcess.on('message', function(message) {
    console.log(message);
  });
  childProcess.on('error', function(error) {   // Si el procés rep un missatge l'escriurà a la consola
    console.error(error.stack);
  });
  childProcess.on('exit', function() {  //Quan el procés rep l'event exit mostra un missatge a la consola
    console.log('process exited');
  });
  childProcess.send(imageUrl);
}


//---------------> Part de administracio de login

router.post('/session', function(req, res, next) {
    User.findOne({
            username: req.body.username
        })
        .select('username password')
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) return res.status(401).json({
                "missatge": "Usuari o contrasenya incorrectes!"
            });
            bcrypt.compare(req.body.password, user.password, function(err, valid) {
                if (err) return next(err);
                if (!valid) return res.status(401).json({
                    "missatge": "Usuari o contrasenya incorrectes!"
                });
                var token = jwt.encode({
                    username: user.username
                }, config.secret);
                res.cookie('_GlG', token, {
                    maxAge: 251200000
                });
                res.status(200).json(token);
            });
        });
});


router.get('/user', function(req, res, next) {
    var token = req.headers['x-auth'];
    if (token) {

        var auth = jwt.decode(token, config.secret);
        User.findOne({
                username: auth.username
            }).populate('tresors')
            .populate('tripulacio').exec(function(err, user) {
                if (err) return next(err);
                res.status(200).json(user);
            });
    }
    else {
        res.status(401).json({
            "missatge": "bad token"
        });
    }
});

router.post('/user', function(req, res, next) {
    User.findOne({
        "username": req.body.username
    }, function(err, user) {
        if (err) return next(err);
        if (user) return res.status(409).json({
            "missatge": "User exists"
        });

        bcrypt.hash(req.body.password, 11, function(err, hash) {
            var user = new User({
                username: req.body.username,
                puntuacio: 0
            });
            user.password = hash;
            user.save(function(erro, user) {
                if (err) return next(err);
                res.status(201).json({
                    "missatge": "User Created"
                });
            });
        });
    });
});

router.post('/pujarimatge', function(req, res, next) {
    if (req.auth) {
        User.findByIdAndUpdate(req.body.usuari, {
            "perfil": "perfils/reduced/" + req.files.imatge.name
        }, function(err, user) {
            if (err) {
                return next(err);
            }
            compressAndResize(__dirname+"/../../assets/perfils/" + req.files.imatge.name);
            res.status(200).json(user);
        });
    } else {
        res.status(403).json({'error': 'error auth'});
    }
    
});


//--------> Part per usuaris de l'aplicacio com a jugadors

router.put("/tripulacio/:id", function(req, res, next) {
    User.findByIdAndUpdate(req.params.id, {
        "tripulacio": req.body.tripulacio
    }, function(err, user) {
        if (err) {
            return next(err);
        }
        res.status(200).json(user);
    });
});

router.put("/aceptasol/:id", function(req, res, next) {

    User.findById(req.params.id)
        .exec(function(err, user) {
            if (err) {
                return next(err);
            }
            user.solicituds.splice(user.solicituds.indexOf(req.body.solicitud), 1);
            if (req.body.missatge == "reclutam") {
                User.findByIdAndUpdate(req.params.id, {
                    "solicituds": user.solicituds,
                    "tripulacio": req.body.solicitud._id
                }, function(err, user) {
                    if (err) {
                        return next(err);
                    }
                    res.status(200).json(user);
                });
            }
            else if (req.body.missatge == "denega") {
                User.findByIdAndUpdate(req.params.id, {
                    "solicituds": user.solicituds
                }, function(err, user) {
                    if (err) {
                        return next(err);
                    }
                    res.status(200).json(user);
                });
            }

        });
});

router.put("/:id", function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
        if (err) return next(err);
        user.tresors.push(req.body.tresor['_id']);
        User.findByIdAndUpdate(req.params.id, {
            "puntuacio": (user.puntuacio + 10),
            "tresors": user.tresors
        }).populate('tripulacio').exec(function(err, user) {
            if (err) {
                return next(err);
            }
            res.status(200).json(user);
        });
    });
});


router.put("/solicituds/:id", function(req, res, next) {
    User.findById(req.params.id)
        .exec(function(err, user) {
            if (err) {
                return next(err);
            }
            user.solicituds.push(req.body.solicituds['_id']);
            User.findByIdAndUpdate(req.params.id, {
                "solicituds": user.solicituds
            }, function(err, user) {
                if (err) {
                    return next(err);
                }
                res.status(200).json(user);
            });

        });
});




router.get('/cerca', function(req, res, next) {
    User.find({
            "username": new RegExp(req.query.id)
        })
        .populate('tresors')
        .populate('tripulacio')
        .exec(function(err, user) {
            if (err) {
                return next(err);
            }
            var usuaris = {
                "users": user

            }
            res.json(usuaris);
        });
});

router.get('/', function(req, res, next) {
    User.find()
        .sort('-puntuacio')
        .populate('tresors')
        .populate('tripulacio')
        .exec(function(err, users) {
            if (err) {
                return next(err);
            }
            res.json(users);
        });
});



router.get('/highscores', function(req, res, next) {
    User.find()
        .sort('-puntuacio')
        .exec(function(err, users) {
            if (err) {
                return next(err);
            }

            var usuaris = {
                "users": users
            }
            res.json(usuaris);
        });
})


router.get("/:id", function(req, res, next) {
    User.find({
            "username": req.params.id
        })
        .populate('tresors')
        .populate('tripulacio')
        .populate('solicituds')
        .exec(function(err, user) {
            if (err) {
                return next(err);
            }
            res.json(user);
        });
});


router.get("/buscador/:nom", function(req, res, next) {
    User.find({
            "username": req.params.nom
        })
        .exec(function(err, user) {

            if (err) {
                return next(err);
            }
            console.log(user[0]);
            res.json(user[0]);
        });
});

module.exports = router;