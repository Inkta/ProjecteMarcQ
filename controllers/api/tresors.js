var router = require("express").Router();
var Tresor = require("../../models/tresor");

router.get("/", function(req, res, next) {
    Tresor.find()
        .populate('autor')
        .exec(function(err, tresors) {
            if (err) {
                return next(err);
            }
            res.json(tresors);
        });
});


router.get("/:id", function(req, res, next) {
    Tresor.findById(req.params.id)
        .populate('autor')
        .exec(function(err, tresor) {
            console.log(tresor);
            if (err) {
                return next(err);
            }
            res.json(tresor);
        });
});



router.put("/:id", function(req, res, next) {
    if (req.auth) {
        Tresor.findByIdAndUpdate(req.params.id, {
            "trobador": req.body.trobador
        }, function(err, tresor) {
            if (err) {
                return next(err);
            }
            res.status(200).json(tresor);
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
        Tresor.remove({
            "_id": req.params.id
        }, function(err, tresor) {
            if (err) {
                return next(err);
            }
            res.status(200).json(tresor);
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
        var tresor = new Tresor({
            "descripcio": req.body.descripcio,
            "lat": req.body.lat,
            "long": req.body.long,
            "autor": req.body.autor,
        });
        tresor.save(function(err, tresor) {
            if (err) {
                return next(err);
            }
            res.status(201).json(tresor);
        });
    }
    else {
        res.status(403).json({
            'error': 'error auth'
        });
    }
});

module.exports = router;