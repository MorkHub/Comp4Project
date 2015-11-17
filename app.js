var express = require("express");
var app = express();
var io = require("socket.io");
var ejs = require("ejs");
var port = 8080 || process.env.port;

//app.use(express.static(__dirname + "/public"));

// set the view engine to ejs
app.set('view engine', 'ejs');

// index page 
app.get('/', function(req, res) {
    res.render('index');
});

// about page 
app.get('/about', function(req, res) {
    res.render('about');
});

app.listen(port, function(){
  console.log("Running on *:" + port);
})

//io.on('connection', function(c){
//  console.log(c);
//})
