let express = require('express'),
    methodOverride = require('method-override'),
    app     = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    localStratrergy = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose'),
    expressSession = require('express-session'),
    Label = require('./models/labels.js'),
    Todo = require('./models/Todos.js');
    User = require('./models/user');

mongoose.connect('mongodb://localhost/tracker_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static("public"));
app.use(methodOverride('_method'))
app.use(expressSession({
    secret: "To manage my todos I made this",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new localStratrergy(User.authenticate()));

// Label.create({name: "Select", author: "sarthak"})

app.get('/',(req, res) => {
    res.render('home', { currentUser: req.user});
});

app.get('/home',(req, res) => {
    res.render('home', { currentUser: req.user});
});


app.get('/signup', (req, res) => {
    res.render("signup", { currentUser: req.user });
})

app.post('/signup', (req, res) => {
    console.log(req.body)
    if(!req.body.username || !req.body.password )
        return res.redirect('/signup');
    User.register( new User({ username: req.body.username, email: req.body.email}), req.body.password, (err, user) => {
        if(err){
            console.log(err)
            return res.redirect('/signup');
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/todos");
        })
    } )
});

app.get('/signin', (req, res) => {
    res.render("signin", { currentUser: req.user });
})

app.post('/signin', passport.authenticate("local",{
    successRedirect: '/todos',
    failureRedirect: '/signin'
}) ,(req, res) => {
    // res.render("signin");
})

app.get('/signout', (req, res) => {
    req.logOut();
    res.redirect('/');
})

app.get('/todos', isAuthenticated, (req, res) => {
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
                res.render("todos", { todos, labels, isLabelSelected: false, currentUser: req.user } );
            })
        }
    });
    // res.render('todos', {});
});

app.post('/todos', isAuthenticated, (req, res) => {
    if(!req.body || !req.body.description){
        res.redirect("/todos");
    }
    else{
        req.body.priority = +req.body.priority;
        if(!req.body.priority)
            res.redirect('/todos')
        Todo.create(req.body, (err, task) => {
            if(err)
                console.log(err);
            else
                console.log(task)
                res.redirect('/todos')
        })        
    }
});

app.get('/todos/:id/edit', isAuthenticated, (req, res) => {
    Todo.findById({ _id: req.params.id}, (err, todo) => {
        if(err){
            res.redirect("/todos");
            console.log(err);    
        }
        else{
            // console.log(todo);
            Label.find({}, (err, labels) => {
                if(err)
                    console.log(err);
                res.render("todosEdit", { todo, labels, currentUser: req.user } );
            })
        }
    });
    // res.render('todos', {});
});

app.put('/todos/:id', isAuthenticated, (req, res) => {
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

app.get('/labels', isAuthenticated,(req, res) => {
    Label.find({ "name": { $ne: "Select" }}, (err, labels) =>{
        if(err)
            console.log(err);
        else
            // console.log(labels)
        res.render("labels", { labels, currentUser: req.user });
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

app.get('/labels/:id', isAuthenticated, (req, res) => {
    Todo.find({ label: req.params.id}, (err, todos) => {
        if(err){
            // res.render("todos", {todos} );
            console.log(err);    
            res.redirect('/labels');
        }
        else{
            console.log(todos);
            Label.find({_id: req.params.id}, (err, labels) => {
                if(err)
                    console.log(err);
                   console.log(labels) 
                res.render("todos", { todos, labels, isLabelSelected: true, currentUser: req.user} );
            })
        }
    });
    // res.render("todos.ejs", {"todos": []})
})

// app.get('/inProgress', (req, res) => {
//     // curTask.find({}, (err, todos) => {
//     //     if(err)
//     //         console.log(err);
//     //     res.render("inProgress", { todos })            
//     // })
// })

function isAuthenticated(req, res, next){
    console.log(req.user);
    if(req.isAuthenticated())
        next();
    else
    res.redirect('/signin');
}

app.listen(3000, () => {
    console.log("server started at port 3000");
})