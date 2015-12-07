// Inport modules
var io         = require ( "socket.io" );
var ejs        = require ( "ejs" );
var express    = require ( "express" );
var session    = require ( "express-session" );
var bodyParser = require ( "body-parser" );
var app        = express ();
var port       = 8080 || process.env.port;

// Init schools
var schools = [];
schools[0] = { id: "NRSIN15", name: "Sir Isaac Newton Sixth Form", shortName: "SIN", logo: "/media/schools/NRSIN15/sin.png", tasks: [], users: [] };
schools[0].users[0] = { name: "Mark Cockburn", email: "mcockburn14@sirisaac.net", avatar: "", password: "passwd", school: "NRSIN15", access: 10 };
schools[0].users[1] = { name: "Rick Sanchez", email: "rsanchez@sirisaac.net", avatar: "", password: "Morty12", school: "NRSIN15", access: 3 };
schools[0].users[2] = { name: "Emily Days", email: "edays14@sirisaac.net", avatar: "", password: "kitty43", school: "NRSIN15", access: 1 };
schools[0].tasks = [
  { name: "Easy assignment #1", desc: "Description of easy assignment", level: 1, value: 5, solution: "( a+b )" },
  { name: "Hard assignment #1", desc: "Description of hard assignment", level: 3, value: 20, solution: "( a+NOT( b.c ) )+( NOT( a+( b+c ) ) )" }
]


schools[1] = { id: "IPSCH16", name: "Ipswich School", shortName: "Ipswich", logo: "/media/schools/IP/sin.png", tasks: [], users: [] };
schools[1].users[0] = { name: "John Doe", email: "jdoe16@ipswichschool.edu", avatar: "", password: "ab12cd34", school: "IPSCH16", access: 3 };
schools[1].users[1] = { name: "Luke Hazel", email: "csmith16@ipswichschool.edu", avatar: "", password: "ab12cd34", school: "IPSCH16", access: 1 };
schools[1].users[2] = { name: "Alice Byrnes", email: "byrnesa16@ipswichschool.edu", avatar: "", password: "ab12cd34", school: "IPSCH16", access: 1 };


// Init tasks
var tasks = [];

// Enable modules & init
app.set ( 'view engine', 'ejs' );
app.use ( bodyParser.json () );
app.use ( bodyParser.urlencoded ( { extended: true } ) );
app.use ( session ( { secret: "isaacnewton", resave: true, saveUninitialized: true } ) );

// Routes
app.get ( '/', function ( req, res )
{
  res.render ( 'index', { valid: req.session.valid, user: req.session.user, status: req.session.status } );
  req.session.status = undefined;
});
app.get ( '/profile', auth, function ( req, res )
{
  res.render ( 'profile', { valid: req.session.valid, user: req.session.user, status: req.session.status } );
  req.session.status = undefined;
});
app.get ( '/admin', auth, function ( req, res )
{
  if ( req.session.user.access >= 3 )
  {
    res.render ( 'admin', { valid: req.session.valid, user: req.session.user, users: req.session.school.users, status: req.session.status } );
    req.session.status = undefined;
  } else {
    res.redirect ( '/' );
  }
});
app.post ( '/login', function ( req, res )
{
  var post = req.body; // Get POST data
  req.session.valid = false; // Init validation
  console.log (post) // debug
  schools.forEach ( function ( school )
  {
    if ( school.id == post.school )
    {
      school.users.forEach ( function ( user, index ) // Iterate through valid users and check credentials
      {
        if ( ( user.email == post.email ) && ( user.password == post.passwd ) )
        { req.session.valid = true; req.session.user = user; req.session.school = school; console.log ( user.name + " logged in" ) } // store user data in session
      });
    }
  });
  if ( !req.session.valid )
  {
    req.session.status = { type: "danger", title: "Oh snap!", msg: "Couldn't sign you in. Please check credentials." }
    res.redirect ( "/" ); // redirect to home if invalid
  } else {
    req.session.status = { type: "success", title: "Looks good!", msg: "Successfully authenticated :-)" }
    res.redirect ( "/profile" ); // redirect to profile if valid
  }
});
// Logs out ( deletes session data )
app.get ( '/logout', function ( req, res ) {
  req.session.user = undefined;
  req.session.valid = false;
  req.session.status = { type: "info", title: "Goodbye.", msg: "Logged out. See you again soon." }
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
