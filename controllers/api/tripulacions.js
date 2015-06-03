var router = require("express").Router();
var Tripulacio = require("../../models/tripulacio");

router.get("/", function(req, res, next) {
    Tripulacio.find()
        .sort('-puntuacio')
        .populate('membres')
        .exec(function(err, trip) {
            if (err) {
                return next(err);
            }
            res.json(trip);
        });
});


router.get("/:id", function(req, res, next) {
    Tripulacio.findById(req.params.id)
        .populate('membres')
        .exec(function(err, trip) {
            if (err) {
                return next(err);
            }
            res.json(trip);
        });
});

router.put("/puntuacio/:id", function(req, res, next) {
    if (req.auth) {
        Tripulacio.findById(req.params.id)
            .exec(function(err, trip) {
                if (err) {
                    return next(err);
                }
                trip.membres.push(req.body.user._id);
                Tripulacio.findByIdAndUpdate(req.params.id, {
                    "puntuacio": trip.puntuacio + req.body.puntuacio,
                    "membres": trip.membres,
                }, function(err, trip) {
                    if (err) {
                        return next(err);
                    }
                    res.status(200).json(trip);
                });
            });
    }
    else {
        res.status(403).json({
            'error': 'error auth'
        });
    }
});

router.put("/:id", function(req, res, next) {
    if (req.auth) {
        Tripulacio.findByIdAndUpdate(req.params.id, {
            "membres": req.body.membres
        }, function(err, trip) {
            if (err) {
                return next(err);
            }
            res.status(200).json(trip);
        });
    }
    else {
        res.status(403).json({
            'error': 'error auth'
        });
    }
});





router.delete("/:id", function(req, res, next) {
    if (req.auth) {
        Tripulacio.remove({
            "_id": req.params.id
        }, function(err) {
            if (err) {
                return next(err);
            }
            res.status(200).json({
                "misatge": "Tripulacio Borrada"
            });
        });
    }
    else {
        res.status(403).json({
            'error': 'error auth'
        });
    }
});

router.post("/", function(req, res, next) {
    if (req.auth) {
        var trip = new Tripulacio({
            "nom": req.body.nom,
            "puntuacio": req.body.puntuacio,
            "membres": req.body.membres
        });
        trip.save(function(err, trip) {
            if (err) {
                return next(err);
            }
            res.status(201).json(trip);
        });
    }
    else {
        res.status(403).json({
            'error': 'error auth'
        });
    }
});

module.exports = router;