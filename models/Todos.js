const mongoose = require('mongoose');

const todosSchema = new mongoose.Schema({
    author: {
            type: String,
            required: true
            },
    description: {
            type: String,
            required: true
            },
    createdAt: {
        type: Date,
        default: Date.now()        
    },
    completedAt: {
        type: Date,
    },
    priority: {
        type: Number,
        default: 1
    },
    label: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Label"
    }
});

const Todo = mongoose.model('todos', todosSchema);

module.exports = Todo;