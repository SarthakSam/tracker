let mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose');

let userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    todosInProgress: [{
        type: mongoose.Schema.Types.ObjectId,
        model: "Todo"
    }]
});

userSchema.plugin(passportLocalMongoose);

let User = mongoose.model("user", userSchema);
module.exports = User;