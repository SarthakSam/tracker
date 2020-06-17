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
        type: mongoose.Schema.Types.ObjectId,
        model: "User",
        required: true
    }
});

const Label = mongoose.model('Label', labelSchema);

module.exports = Label;

