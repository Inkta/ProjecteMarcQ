var db = require("../db");

var user = db.Schema({
    username: {
        type:String,
        required: true,
        unique:true
    },
    perfil: {
        type:String,
        required:true,
        default: 'perfils/pirata.png'
    },
    password: {
        type:String, 
        select:false
    },//amb select a false ens assegurem que hem de forçar a posar el password quan fem una consulta
    puntuacio: {
        type:Number,
        required:false
    },
    tripulacio: {
        type: db.Schema.Types.ObjectId,
        ref: 'Tripulacio',
        required: false
    },
    tresors: [{
        type: db.Schema.Types.ObjectId,
        ref: 'Tresor',
        required: false
    }],
    solicituds: [{
        type: db.Schema.Types.ObjectId,
        ref: 'Tripulacio',
        required: false
    }]
    
});

module.exports = db.model('User',user);