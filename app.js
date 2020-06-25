let express = require('express'),
    methodOverride = require('method-override'),
    app     = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    localStratrergy = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose'),
    expressSession = require('express-session'),
    flash = require('connect-flash'),
    User = require('./models/user.js'),
    Label = require('./models/labels.js'),
    Todo = require('./models/Todos.js');
    

//   mongoose.connect('mongodb://sarthak:Mypassword123!@ds151533.mlab.com:51533/task_tracker', {
mongoose.connect(process.env.databaseURL || 'mongodb://localhost/tracker_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(flash());
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

app.use( (req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.message = req.flash('message');
    res.locals.error = req.flash('error');
    // console.log(res.locals);
    next();
})

app.get('/',(req, res) => {
    res.redirect('/home');
});

app.get('/home',(req, res) => {
    res.render('home', { page: 'home'});
});


app.get('/signup', (req, res) => {
    res.render("signup", { page: 'signup' });
})

app.post('/signup', (req, res) => {
    // console.log(req.body)
    if(!req.body.username || !req.body.password )
        return res.redirect('/signup');
    User.register( new User({ username: req.body.username, email: req.body.email}), req.body.password, (err, user) => {
        if(err){
            console.log(err)
            return res.redirect('/signup');
            }
        passport.authenticate("local")(req, res, function(){
            Label.create({ name: "Select", author: req.user._id}, (err, label) => {
                if(err)
                    console.log(err);
                else
                    console.log(label);
            });    
            res.redirect("/todos");
        })
    } )
});

app.get('/signin', (req, res) => {

    res.render("signin", { currentUser: req.user, page: 'signin'});
})

app.post('/signin', passport.authenticate("local",{ failureRedirect: '/signin'}) ,
    (req, res) => {
    // console.log(req.session)    
    req.flash("message", " Welcome " + req.user.username);
    res.redirect(req.session.enteredUrl || '/home');
})

app.get('/signout', (req, res) => {
    req.logOut();
    req.flash("message", "User logged out succesfully");
    res.redirect('/');
})

app.get('/todos', isAuthenticated, (req, res) => {
    let searchObj = { "author": req.user._id, "status": { $ne: 2 } };
    if(req.query.priority){
        searchObj.priority = +req.query.priority;
    }
    if(req.query.search){
        searchObj.title =  { "$regex": req.query.search, "$options": "i" };
    }
    // console.log(searchObj);
    Todo.find(searchObj, (err, todos) => {
        if(err){
            console.log(err);    
            res.redirect("home");
        }
        else{
            // console.log(todos)
            Label.find({ author: req.user._id }, (err, labels) => {
                if(err){
                    console.log(err);
                    labels = [];
                }
                res.render("todos", { todos, labels, isLabelSelected: false,  priority: +req.query.priority, page: 'todos' } );
            })
        }
    })
});

app.post('/todos', isAuthenticated, (req, res) => {
    if(!req.body || !req.body.title){
        req.flash("error", "Todo title is required");
        res.redirect("/todos");
    }
    else{
        req.body.priority = +req.body.priority;
        req.body.author = req.user._id;
        if(!req.body.priority){
            req.flash("error", "Priority is not correct");
            console.log("Incorrect priority")
            res.redirect('/todos')    
        }
        Todo.create(req.body, (err, newTodo) => {
            if(err){
                req.flash("error", "Unable to create new todo");
                console.log(err);
            }
            else{
                req.flash("message", "Todo created successfully");
            }
            res.redirect('/todos')
            })        
    }
});

app.get('/todos/:id/edit', isAuthenticated, (req, res) => {
    // console.log(req.params.id, req.user);
    Todo.findOne({ _id: req.params.id, author: req.user._id}, (err, todo) => {
        if(err){
            req.flash("error", "Given todo doesnot belong to" + req.user.username);
            console.log(err);    
            res.redirect("/todos");
        }
        else{
            if(!todo){
                req.flash("error", " Unable to find todo.");
                return res.redirect("/todos");
            }
            // console.log(todo);
            Label.find({ author: req.user._id }, (err, labels) => {
                if(err)
                    console.log(err);
                res.render("todosEdit", { todo, labels, page: 'todos' } );
            })
        }
    });
    // res.render('todos', {});
});

app.put('/todos/:id', isAuthenticated, (req, res) => {
    // console.log(req.body);
    if(!req.body || !req.body.title){
        req.flash("error", " Updated todo is not valid.");
        res.redirect('/todos');
        return;
    }
    if(!req.user._id.equals(req.body.author)){
        req.flash("error", "Given todo doesnot belong to" + req.user.username);
        res.redirect('/todos');
        return;
    }
    let newTodo = req.body;
    Todo.findByIdAndUpdate({ _id : req.params.id, author: req.user._id}, newTodo, (err, todo) => {
        if(err){
            req.flash("error", "Something went wrong. UNable to update Todo");
            console.log(err);
        }
        else
            req.flash("message", "Todo updated successfully");
            // console.log(todo)    
        res.redirect('/todos');
    })
});

app.delete('/todos/:id', isAuthenticated, (req, res) => {
    if(!req.params.id){
        req.flash("error", "No todo with such ID exist");
        res.redirect('/todos');
        return;
    }
    Todo.findByIdAndDelete({ _id : req.params.id, author: req.user._id}, (err) => {
        if(err){
            console.log(err);
            req.flash("error", "Unable to delete todo");
        }
        else
            req.flash("message", "Todo deleted successfully!");
        res.redirect('/todos');
    })
});


app.get('/labels', isAuthenticated,(req, res) => {
    let searchObj = { "author": req.user._id, "name": { $ne: "Select" } };
    if(req.query.search){
        searchObj.name =  { "$regex": req.query.search, "$options": "i" };
    }
    Label.find( searchObj ).lean().exec( (err, labels) => {
        if(err){
            req.flash("error", "Something went wrong");
            console.log(err);            
        }
        labels.forEach( label => label.backgroundColor = getRandomColor());
        res.render("labels", { labels, page: 'labels' });
    });
})

app.post('/labels', isAuthenticated, (req, res) => {
    // console.log(req.body);
    if(!req.body || !req.body.name){
        req.flash("error", "Label data not valid");
        res.redirect("/labels");
        return;
    }
    req.body.author = req.user._id;
    Label.create(req.body, (err, label) => {
        if(err){
        req.flash("error", "Unable to create Label");
        console.log(err);            
        }
        else
            console.log("message", "Label created succesfully");
        res.redirect('/labels');
    });
});

app.get('/labels/:id', isAuthenticated, (req, res) => {
    let searchObj = { "author": req.user._id, "status": { $ne: 2 },  label: req.params.id };
    if(req.query.priority){
        searchObj.priority = +req.query.priority;
    }
    if(req.query.search){
        searchObj.title =  { "$regex": req.query.search, "$options": "i" };
    }
    // console.log(searchObj);
    Todo.find(searchObj, (err, todos) => {
        if(err){
            // res.render("todos", {todos} );
            req.flash("error", "Unable to find todos corresponding to selected label");
            console.log(err);    
            res.redirect('/labels');
        }
        else{
            // console.log(todos);
            Label.find({_id: req.params.id, author: req.user._id }, (err, labels) => {
                if(err)
                    console.log(err);
                //    console.log(labels) 
                res.render("todos", { todos, labels, isLabelSelected: true, priority: +req.query.priority, page: 'labels'} );
            })
        }
    });
    // res.render("todos.ejs", {"todos": []})
});

app.delete('/labels/:id', (req, res) => {
    Todo.deleteMany({ label: req.params.id }, (err, todos) => {
        if(err){
            req.flash("error", "Something went wrong");
            console.log(err);
            res.redirect('/labels/' + req.params.id)
        }
        else{
            Label.findByIdAndDelete(req.params.id, (err, label) => {
                if(err){
                    req.flash("error", "Something went wrong");
                    console.log(err);
                    res.redirect('/labels');
                }       
                else{
                    req.flash("message", "Label deleted sucesfully");
                    res.redirect('/labels');
                }
            })
        }
    })
});

app.get('/inProgress', isAuthenticated, (req, res) => {
    let searchObj = { "author": req.user._id, "status": 1};
    if(req.query.search){
        searchObj.title =  { "$regex": req.query.search, "$options": "i" };
    }
    Todo.find(searchObj , (err, todos) => {
        if(err){
            console.log(err);
            req.flash("error", "Unable to fetch todos in progress");
            res.redirect('/todos');
        }
        else{
            // console.log(todos)
            res.render("inProgress", { todos, inProgress: true, page: 'inProgress'});            
        }
    })
})

app.post('/inProgress', isAuthenticated, (req,res) => {
    Todo.findById(req.body.todoId, (err, todo) => {
            if(err){
                console.log(err);
                req.flash("error", "Unable to find todo");
                res.redirect('/todos');
            }
            else{
                if(todo.status == +req.body.status){
                    if(todo.status == 0){
                        req.flash("error", "Todo is not in progress already");
                        console.log("Todo is already not in progress ");
                        res.redirect('/todos');    
                    }
                    else{
                        req.flash("error", "Todo is already in progress");
                        console.log("Todo is already in progress ");
                        res.redirect('/inProgress');    
                    }    
                }
                else{
                    todo.status = +req.body.status;
                    todo.save((err, savedTodo) => {
                        if(err){
                            req.flash("error", "Something went wrong");
                            console.log(err);
                            res.redirect('/todos');            
                        }
                        else{
                            if(savedTodo.status == 1)
                                res.redirect('/inProgress')
                            else
                                res.redirect('/todos')
                        }
                    })
                }
            }
    });
});

app.get('/completed', isAuthenticated, (req, res) => {  
    let searchObj = { "author": req.user._id, "status": 2};
    if(req.query.search){
        searchObj.title =  { "$regex": req.query.search, "$options": "i" };
    }
    Todo.find(searchObj, (err, todos) => {
        if(err){
            req.flash("error", "Unable to find todo");
            console.log(err);
            res.redirect('/todos');
        }
        else{
            // console.log(todos)
            res.render("inProgress", { todos, inProgress: false, page: 'completed'});            
        }
    })
})


app.post('/completed/:id', (req, res) => {
    Todo.findById(req.params.id, (err, todo) => {
        if(err){
            console.log(err);
            req.flash("error", "Unable to move todo to completed state");
            res.redirect('/inProgress');
        }
        else{
            todo.status = 2;
            todo.save( (err, savedTodo) => {
                if(err){
                    req.flash("error", "Unable to move todo to completed state");
                    console.log(err);
                }
                else
                    req.flash("message", "Todo completed succesfully");
                res.redirect('/completed');
            } )
        }
})
})

app.delete('/completed/:id', (req, res) => {
    Todo.findById(req.params.id, (err, todo) => {
        if(err){
            console.log(err);
            res.redirect('/inProgress');
        }
        else{
            todo.status = 0;
            todo.save( (err, savedTodo) => {
                if(err){
                    console.log(err);
                }
                res.redirect('/todos');
            } )
        }
    })
});


function isAuthenticated(req, res, next){
    if(req.isAuthenticated())
        next();
    else{
        req.session.enteredUrl = req.originalUrl;
        req.flash("error", "You need to be logged in first.")
        res.redirect('/signin');
    }
}

function getRandomColor(){
    let a = Math.random()*256, b = Math.random()*256, c = Math.random()*256;
    return `rgba( ${ Math.floor(a) }, ${ Math.floor(b) }, ${ Math.floor(c) }, 0.85)`
}

app.listen(process.env.PORT || 3000, () => {
    console.log("server started at port 3000");
})