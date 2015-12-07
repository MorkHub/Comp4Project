// Inport modules
var io         = require ( "socket.io" );
var ejs        = require ( "ejs" );
var express    = require ( "express" );
var session    = require ( "express-session" );
var bodyParser = require ( "body-parser" );
var app        = express ();
var port       = 8080 || process.env.port;

// Init test users
var users = [];
users[0] = { name: "Mark Cockburn", email: "mark@localhost", password: "test", school: "NRSIN15", access: 10 }
users[1] = { name: "Test Student", email: "test@localhost", password: "test", school: "NRSIN15", access: 1 }

// Enable modules & init
app.set ( 'view engine', 'ejs' );
app.use ( bodyParser.json () );
app.use ( bodyParser.urlencoded ( { extended: true } ) );
app.use ( session ( { secret: "isaacnewton", resave: true, saveUninitialized: true } ) );

// Routes
app.get ( '/', function ( req, res )
{
  res.render ( 'index', { valid: req.session.valid, user: req.session.user } )
});
app.get ( '/profile', auth, function ( req, res )
{
  res.render ( 'profile', { valid: req.session.valid, user: req.session.user } );
});
app.get ( '/admin', auth, function ( req, res )
{
  if ( req.session.user.access >= 10 )
  {
    res.render ( 'admin', { valid: req.session.valid, user: req.session.user, users: users } );
  } else {
    res.redirect ( '/' );
  }
});
app.post ( '/login', function ( req, res )
{
  var post = req.body; // Get POST data
  req.session.valid = false; // Init validation
  console.log (post) // debug
  users.forEach ( function ( user, index ) // Iterate through valid users and check credentials
  {
    if ( ( user.email == post.email ) && ( user.password == post.passwd ) && ( user.school == post.school ) )
    { req.session.valid = true; req.session.user = users[index]; console.log ( users[index].name + " logged in" ) } // store user data in session
  });
  if ( !req.session.valid )
  {
    res.redirect ( "/" ); // redirect to home if invalid
  } else {
    res.redirect ( "/profile" ); // redirect to profile if valid
  }
});
// Logs out ( deletes session data )
app.get ( '/logout', function ( req, res ) {
  req.session.user = undefined;
  req.session.valid = false;
  res.redirect ( "/" );
});

// Verify session, if invalid display error
function auth ( req, res, next )
{
  if ( !req.session.valid )
  {
    res.send ( "<h1>Error 401</h1> Please <a href=\"/\">go home</a> and sign in." );
  } else {
    next();
  }
}

// Listen on defined port, and print debug
app.listen ( port, function ()
{
  console.log ( "Running on *:" + port );
})
