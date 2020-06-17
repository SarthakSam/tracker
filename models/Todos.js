const mongoose = require('mongoose');

const todosSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },        
    description: {
            type: String
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
    },
    status: {
        type: Number,
        default: 0
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

const Todo = mongoose.model('Todo', todosSchema);

module.exports = Todo;