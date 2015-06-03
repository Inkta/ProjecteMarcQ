var db = require("../db");

var tripulacio = db.Schema({
    nom: {
        type:String,
        required: true,
        unique:true
    },
    puntuacio: {
        type:Number,
        required:true
    },
    membres: [{
        type: db.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    
});

module.exports = db.model('Tripulacio',tripulacio);