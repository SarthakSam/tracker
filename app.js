let express = require('express'),
    methodOverride = require('method-override'),
    app     = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    Label = require('./models/labels.js'),
    Todo = require('./models/Todos.js');

mongoose.connect('mongodb://localhost/tracker_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static("public"));
app.use(methodOverride('_method'))

// Label.create({name: "Select", author: "sarthak"})

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
            // console.log(todos);
            Label.find({}, (err, labels) => {
                if(err)
                    console.log(err);
                res.render("todos", { todos, labels } );
            })
        }
    });
    // res.render('todos', {});
});

app.post('/todos', isAuthenticated, (req, res) => {
    console.log(req.body);
    if(!req.body || !req.body.description){
        res.redirect("/todos");
    }
    else{
        req.body.priority = +req.body.priority;
        Todo.create(req.body, (err, task) => {
            if(err)
                console.log(err);
            else
                console.log(task)
                res.redirect('/todos')
        })        
    }
});

app.get('/todos/:id/edit', (req, res) => {
    Todo.findById({ _id: req.params.id}, (err, todo) => {
        if(err){
            res.redirect("/todos");
            console.log(err);    
        }
        else{
            console.log(todo);
            Label.find({}, (err, labels) => {
                if(err)
                    console.log(err);
                res.render("todosEdit", { todo, labels } );
            })
        }
    });
    // res.render('todos', {});
});

app.put('/todos/:id', (req, res) => {
    console.log(req.body);
    if(!req.body || !req.body.description){
        res.redirect('/todos');
        return;
    }
    let newTodo = req.body;
    Todo.findByIdAndUpdate({ _id : req.params.id}, newTodo, (err, todo) => {
        if(err)
            console.log(err);
        else
            console.log(todo)    
        res.redirect('/todos');
    })
});

app.delete('/todos/:id', isAuthenticated, (req, res) => {
    if(!req.params.id){
        res.redirect('/todos');
        return;
    }
    Todo.findByIdAndDelete({ _id : req.params.id}, (err) => {
        if(err)
            console.log(err);
        res.redirect('/todos');
    })
});

app.get('/labels', (req, res) => {
    Label.find({ "name": { $ne: "Select" }}, (err, labels) =>{
        if(err)
            console.log(err);
        else
            // console.log(labels)
        res.render("labels", { labels });
    });
})

app.post('/labels', isAuthenticated, (req, res) => {
    console.log(req.body);
    if(!req.body || !req.body.name){
        res.redirect("/labels");
        return;
    }
    
    Label.create(req.body, (err, label) => {
        if(err)
            console.log(err);
        else
            console.log(label);
        res.redirect('/labels');
    });
});

// app.get('/labels/:id', (req, res) => {
//     Todo.find({ labels: req.params.id}, (err, todos) => {
//         if(err){
//             // res.render("todos", {todos} );
//             console.log(err);    
//             res.redirect('/labels');
//         }
//         else{
//             // console.log(todos);
//             Label.find({}, (err, labels) => {
//                 if(err)
//                     console.log(err);
//                 res.render("todos", { todos, labels } );
//             })
//         }
//     });
//     res.render("todos.ejs", {"todos": []})
// })

function isAuthenticated(req, res, next){
    console.log("authenticated")
    req.body.author = "sarthak";
    next();
}

app.listen(3000, () => {
    console.log("server started at port 3000");
})