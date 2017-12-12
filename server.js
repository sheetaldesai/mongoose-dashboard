var express     = require("express");
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');


var app = express();

// This sets the location where express will look for the ejs views
app.set('views', __dirname + '/views'); 
// Now lets set the view engine itself so that express knows that we are using ejs as opposed to another templating engine like jade
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/static"));
app.use(bodyParser.urlencoded({extended: true}));

// Use native promises
mongoose.Promise = global.Promise;


// This is how we connect to the mongodb database using mongoose -- "basic_mongoose" is the name of
//   our db in mongodb -- this should match the name of the db you are going to use for your project.
mongoose.connect('mongodb://localhost/DashboardDB');

var DashboardSchema = new mongoose.Schema({
    name: {type: String, required: true},
    weight: String,
    length: String,
    country: String
});

mongoose.model('Mongoose', DashboardSchema); // We are setting this Schema in our Models as 'User'
var Mongoose = mongoose.model('Mongoose') // We are retrieving this Schema from our Models, named 'User'


app.get('/', function(request, response) {
    var promise = Mongoose.find({});
    promise.then(function(results){
        //console.log("Found mongooses ", results)
        response.render('mongooses', {mongooses:results});
    });
});

app.get('/mongooses/new', function(req, res){
    res.render('create');
});

app.post('/mongooses', function(req, res){
    console.log("POST DATA", req.body);
   
    var mongoose = new Mongoose({name: req.body.name, weight:req.body.weight, length:req.body.length, country:req.body.country});
   
    mongoose.save().then(function (doc) {
        console.log('successfully added a mongoose! ', doc);
        res.redirect('/');
    }).catch(function(err){
        errs = err.errors;
        //console.log(err);
        res.redirect('/mongooses/new');
    });
})

app.get('/mongooses/edit/:id', function(req, res){
    var id = req.params.id;
    console.log("id: ", id);
    var promise = Mongoose.findOne({_id: id});
    promise.then(function(results){
        console.log("Found mongooses ", results)
        res.render("edit", {mongoose: results, title: "Edit Mongoose"});
        //res.render('create',{monggose:result});
    });

});

app.post('/mongooses/:id', function(req, res){
    var id = req.params.id;
    console.log(id, req.body);
    Mongoose.findById(id).then(function(result){
        result.name = req.body.name;
        result.weight = req.body.weight;
        result.length = req.body.length;
        result.country = req.body.country;

        result.save().then(function (updatedResult) {
            console.log("Updated mongoose: ", updatedResult);
            res.redirect('/')
        }).catch(function (err){
            console.log("Error while updating mongoose ", err);
            res.redirect('/mongoose/edit/'+id);
        });
    }).catch(function(err){
        console.log("Can not find mongoose by id: ", id);
        res.redirect('/mongoose/edit/'+id);
    });
});

app.post('/mongooses/destroy/:id', function(req, res){
    var id = req.params.id;
    Mongoose.remove({_id: id}, function(err){
        if (!err) {
            res.redirect('/');
        } else {
            console.log("Error while removing mongoose id: ", id, err);
        }
    })
})

app.listen(8000,function(){
    console.log("Listening on port 8000");
});

