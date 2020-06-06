const mongoose = require('mongoose');

const labelSchema = new mongoose.Schema({
    name: {
        type: String,
        required : true
    },
    createdAt: {
        type: Date,
        default: Date.now()        
    },
    author: {
        type: String,
        required: true
    }
});

const Label = mongoose.model('labels', labelSchema);

module.exports = Label;

