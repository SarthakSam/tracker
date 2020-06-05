let express = require('express'),
    methodOverride = require('method-override'),
    app     = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    Label = require('./models/labels.js');

mongoose.connect('mongodb://localhost/tracker_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static("public"));
app.use(methodOverride('_method'))

const todosSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true
            },
    task: {
        type: String,
        required: true
            },
    date: {
        type: Date,
        default: Date.now()        
    }
});

const Todo = mongoose.model('todos', todosSchema);

app.get('/',(req, res) => {
    res.render('home');
});

app.get('/todos', (req, res) => {
    Todo.find({}, (err, todos) => {
        if(err){
            res.render("todos", {todos} );
            console.log(err);    
        }
        else{
            console.log(todos);
            res.render("todos", {todos} );
        }
    });
    // res.render('todos', {});
});

app.post('/todos', isAuthenticated, (req, res) => {
    console.log(req.body);
    if(!req.body || !req.body.task){
        res.redirect("/todos");
    }
    else{
        Todo.create(req.body, (err, task) => {
            if(err)
                console.log(err);
            else
                console.log(task)
                res.redirect('/todos')
        })        
    }
});

app.put('/todos/:id', isAuthenticated, (req, res) => {
    console.log(req.body);

    // if(!req.body || !req.body.task){
        res.redirect("/todos");
    // }
    // else{
    //     Todo.update(req.body, (err, task) => {
    //         if(err)
    //             console.log(err);
    //         else
    //             console.log(task)
    //             res.redirect('/todos')
    //     })        
    // }
});

app.get('/labels', (req, res) => {
    Label.find({}, (err, labels) =>{
        if(err)
            console.log(err);
        else
            console.log(labels)
        res.render("labels", { labels });
    });
})

app.post('/labels', isAuthenticated, (req, res) => {
    console.log(req.body);
    if(!req.body || !req.body.label){
        res.redirect("/labels");
        return;
    }
    
    let obj = {
        name : req.body.label
    }
    Label.create(obj, (err, label) => {
        if(err)
            console.log(err);
        else
            console.log(label);
        res.redirect('/labels');
    });
});

function isAuthenticated(req, res, next){
    console.log("authenticated")
    req.body.author = "sarthak";
    next();
}

app.listen(3000, () => {
    console.log("server started at port 3000");
})