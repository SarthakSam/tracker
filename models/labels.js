const mongoose = require('mongoose');

const labelSchema = new mongoose.Schema({
    name: {
        type: String,
        required : true
    },
    todos: []
});

const Label = mongoose.model('labels', labelSchema);

module.exports = Label;

