var db = require("../db");
var Tresor = db.model('Tresor', {
    descripcio: {
        type: String,
        required: false
    },
    autor: {
        type: db.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    trobador: {
        type: db.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    lat: {
        type: Number,
        required: true
    },
    long: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = Tresor;