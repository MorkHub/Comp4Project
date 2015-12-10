// Inport modules
var io         = require ( "socket.io" );
var ejs        = require ( "ejs" );
var express    = require ( "express" );
var session    = require ( "express-session" );
var bodyParser = require ( "body-parser" );
var app        = express ();
var port       = 8080 || process.env.port;

// Init schools
var schools = {};
schools [ 'NRSIN15' ] = { id: "NRSIN15", name: "Sir Isaac Newton Sixth Form", shortName: "SIN", logo: "/media/schools/NRSIN15/sin.png", tasks: []  };
schools [ 'NRJAC15' ] = { id: "NRJAC16", name: "Jane Austen College", shortName: "JAC", logo: "/media/schools/NRJAC15/jac.png", tasks: []  };

// Init users
var users = {}
for ( key in schools ) { users [ key ] = []; }

users['NRSIN15'][0] = { name: "Mark Cockburn", email: "mcockburn14@sirisaac.net", avatar: "http://www.gravatar.com/avatar/f1585bee481d52a577afb56de9e2dcc7?rating=PG&size=50", password: "passwd", school: "NRSIN15", access: 10 }
users['NRSIN15'][1] = { name: "Rick Sanchez", email: "rsanchez@sirisaac.net", avatar: "", password: "Morty12", school: "NRSIN15", access: 3 }
users['NRSIN15'][2] = { name: "Emily Days", email: "edays14@sirisaac.net", avatar: "", password: "sirisaac1", school: "NRSIN15", access: 1 }
schools[ 'NRSIN15' ].tasks = [
  { name: "Easy assignment #1", desc: "Description of easy assignment", level: 1, value: 5, solution: "( a+b )" },
  { name: "Hard assignment #1", desc: "Description of hard assignment", level: 3, value: 20, solution: "( a+NOT( b.c ) )+( NOT( a+( b+c ) ) )" }
];

users['NRJAC15'][0] = { name: "John Doe", email: "jdoe15@janeausten.net", avatar: "", password: "janeausten1", school: "NRJAC15", access: 3 };
users['NRJAC15'][1] = { name: "Luke Hazel", email: "lhazel15@janeausten.net", avatar: "", password: "janeausten1", school: "NRJAC15", access: 1 };
users['NRJAC15'][2] = { name: "Alice Byrnes", email: "abyrnes15@janeausten.net", avatar: "", password: "janeausten1", school: "NRJAC15", access: 1 };

// Lookup functions
function lookupUser ( schoolID, email )
{
	//console.log( "Looking up", email + "@" + schoolID )
	if ( users [ schoolID ] !== undefined )
	{
		for ( i = 0; i < users [ schoolID ].length; i++  )
		{
			if ( users [ schoolID ][i].email == email ) return i;
		}
	}
	return undefined;
}

function login ( post )
{
	console.log ( "Authenticting", post.email )
	var index = lookupUser ( post.school, post.email )
	if ( index !== undefined )
	{
		return ( users [ post.school ][ index ].password === post.passwd ) ? users [ post.school ][ index ] : false;
	}
	return false;
}

// Init tasks
var tasks = [];

// Enable modules & init
app.set ( 'view engine', 'ejs' );
app.use ( bodyParser.json () );
app.use ( bodyParser.urlencoded ( { extended: true } ) );
app.use ( session ( { secret: "isaacnewton", resave: true, saveUninitialized: true } ) );

// Routes
app.use ( express.static ( __dirname + '/public' ) );

app.get ( '/', function ( req, res )
{
  tasks = ( req.session.user !== undefined ) ? ( schools[req.session.user.school].tasks ) : ( [] )
  res.render ( 'index', { valid: req.session.valid, user: req.session.user, status: req.session.status, tasks: tasks } );
  req.session.status = undefined;
});

app.get ( '/sandbox', function ( req, res )
{
  tasks = ( req.session.user !== undefined ) ? ( schools[req.session.user.school].tasks ) : ( [] )
  res.render ( 'sandbox', { valid: req.session.valid, user: req.session.user, status: req.session.status, tasks: tasks } );
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
		var sentUsers = [], sentSchools = [];
		if ( req.session.user.access >=7 )
		{
			for ( key in schools )
			{
				sentUsers.push ( users [ key ] );
				sentSchools.push ( schools [ key ].name );
			}
		} else  {
			sentUsers = [ users [ req.session.user.school ] ];
			sentSchools = [ schools [ req.session.user.school ].name ];
		}    
		res.render ( 'admin', { valid: req.session.valid, user: req.session.user, schools: sentSchools, users: sentUsers, status: req.session.status } );
    req.session.status = undefined;
  } else {
    res.redirect ( '/' );
  }
});

app.post ( '/login', function ( req, res )
{
  var post = req.body; // Get POST data
  req.session.valid = false; // Init validation
  // console.log ( post ) // debug
	var user = login ( post );
	// console.log ( user )
	if ( user !== false )
	{
		req.session.valid = true;
		req.session.user = user;
		console.log ( "  +",  user.name, "has signed in." );
	}
  if ( !req.session.valid )
  {
    req.session.status = { type: "danger", title: "Oh snap!", msg: "Couldn't sign you in. Please check credentials." }
    res.redirect ( "/" ); // redirect to home if invalid
  } else {
    req.session.status = { type: "success", title: "Looks good!", msg: "Successfully authenticated :-)" }
    res.redirect ( "/profile" ); // redirect to profile if valid
  }
});

app.get( '/school/:school', function ( req, res )
{  
  res.send ( ( schools[req.params.school] !== undefined ) ? ( JSON.stringify( schools[req.params.school] ) ) : ( "null" ) )
});

// Logs out ( deletes session data )
app.get ( '/logout', function ( req, res ) {
	console.log ( "  -",  req.session.user.name, "has signed out." );
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
    res.send ( "<h1>Unauthorised!</h1> Please <a href=\"/\">go home</a> and sign in." );
  } else {
    next();
  }
}

// Listen on defined port, and print debug
app.listen ( port, function ()
{
  console.log ( "Running on *:" + port );
})
