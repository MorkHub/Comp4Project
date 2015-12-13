var port       = ( process.env.computername == "ANNE" ) ? ( 80 ) : ( 25564 || process.env.port );
// Inport modules
var io         = require ( "socket.io" )( app ),
    session    = require ( "express-session" ),
    bodyParser = require ( "body-parser" ),
		data       = require ( "./defines.js" ),
		express    = require ( "express" ),
    flat       = require ( "flat.js" ),
		ejs        = require ( "ejs" ),
    app        = express ();

// database initialisation
var db = flat ( "store.db", { persist: true } );

// Init schools
var schools = {};
var users = {}
//schools['NRSIN15'] = {}
//schools['NRJAC15'] = {}
//for ( key in schools ) { users [ key ] = []; }
//users['NRSIN15'] = {}
//users['NRJAC15'] = {}
//schools [ 'NRSIN15' ] = { id: "NRSIN15", name: "Sir Isaac Newton Sixth Form", shortName: "SIN", logo: "/media/schools/NRSIN15/sin.png", tasks: [] };
//schools [ 'NRJAC15' ] = { id: "NRJAC16", name: "Jane Austen College", shortName: "JAC", logo: "/media/schools/NRJAC15/jac.png", tasks: [] };

update();



// Init users


/*
users['NRSIN15'][0] = new data.User ( "Mark Cockburn", "mcockburn14", "mcockburn14@sirisaac.net", "passwd", "NRSIN15", 10, "http://www.gravatar.com/avatar/	f1585bee481d52a577afb56de9e2dcc7?rating=PG&size=50", 1 );
users['NRSIN15'][1] = new data.User ( "Rick Sanchez", "rsanchez", "rsanchez@sirisaac.net", "Morty12", "NRSIN15", 3, undefined, 1 );
users['NRSIN15'][2] = new data.User ( "Emily Days", "edays14", "edays14@sirisaac.net", "sirisaac1", "NRSIN15", 1, undefined, 0 );
users['NRSIN15'][3] = new data.User ( "Oliver Barnwell", "lyathon", "obarnwell14@jacsin.org.uk", "toady53", "NRSIN15", 1, undefined, 1 );
schools[ 'NRSIN15' ].tasks = [
	{ name: "Easy assignment #1", desc: "Description of easy assignment", level: 1, value: 5, solution: "( a+b )" },
	{ name: "Hard assignment #1", desc: "Description of hard assignment", level: 3, value: 20, solution: "( a+NOT( b.c ) )+( NOT( a+( b+c ) ) )" }
];
users['NRJAC15'][0] = new data.User ( "John Doe", "jdoe15", "jdoe15@janeausten.net", "janeausten1", "NRJAC15", 3, undefined, 0 )
users['NRJAC15'][1] = new data.User ( "Luke Hazel", "lhazel15", "lhazel15@janeausten.net", "janeausten1", "NRJAC15", 1, undefined, 0 );
users['NRJAC15'][2] = new data.User ( "Alice Byrnes", "abyrnes15", "abyrnes15@janeausten.net", "janeausten1", "NRJAC15", 1, undefined, 0 );
*/

// Lookup functions
function lookupUser ( schoolID, email )
{
	var temp = db.getTable ( "users" );
	for ( key in temp )
	{
		if ( temp[key].school == schoolID )
		{
			if ( temp[key].email == email )
			{
				return temp[key];
			}
		}
	}
}

function login ( post )
{
	process.stdout.write ( "Authenticting " + post.email + " ");
  update();
	var u = lookupUser ( post.school, post.email ); // check if user exists and if so retrieve user
	if ( u !== undefined ) // if user exists
	{
		// if valid password return user object, else return false for error handling
		process.stdout.write ( "Success! Credentials valid\n" );
		return ( u.password === post.passwd ) ? u : false;
	}
	process.stdout.write ( "Failure! Credentials invalid\n" );
	return false; // if conditions are not met, return false
}

function update()
{
  db.openSync("utf8");
  users = db.getTable("users");
  schools = db.getTable("schools");
}

// Init tasks
var tasks = [];

// Enable modules & init
app.set ( 'view engine', 'ejs' ); // view engine; used to render pages, with data passed to html
app.use ( bodyParser.json () ); //  bodyParser allows me to receive data from post body
app.use ( bodyParser.urlencoded ( { extended: true } ) ); // additional config for ^
app.use ( session ( { secret: "isaacnewton", resave: true, saveUninitialized: true } ) ); // manipulate signed session data

// Routes
app.use ( express.static ( __dirname + '/public' ) ); // serve any content from public/
require('./routes')(app, db, ejs);

app.get ( '/', function ( req, res )
{
	tasks = ( req.session.user !== undefined ) ? ( schools[req.session.user.school].tasks ) : ( [] ) // holds task(s) data
	var status = req.session.status || undefined; req.session.status = undefined;
	res.render ( 'index', { valid: req.session.valid, user: req.session.user, status: status, tasks: tasks } ); // render page, passing data to ejs template
	; // initialise session data
});

app.get ( '/sandbox', function ( req, res )
{
	var status = req.session.status || undefined; req.session.status = undefined;
	tasks = ( req.session.user !== undefined ) ? ( schools[req.session.user.school].tasks ) : ( [] )
	res.render ( 'sandbox', { valid: req.session.valid, user: req.session.user, status: status, tasks: tasks } );
});

app.get ( '/profile', auth, function ( req, res )
{
  var status = req.session.status || undefined;
  req.session.status = undefined;
  update();
  console.log(schools[req.session.user.school])
	res.render ( 'profile', {
    valid: req.session.valid,
    user: users[req.session.user.username],
    school: schools[req.session.user.school],
    teacher: users[req.session.user.teacher],
    status: status
  });
});

app.get ( '/admin', auth, function ( req, res )
{
	var status = req.session.status || undefined;
  req.session.status = undefined;
  update();
	if ( req.session.user.access >= 3 )
	{
	   res.render ( 'admin', {
       valid: req.session.valid,
       user: req.session.user,
       schools: schools,
       users: users,
       status: status } );
	} else {
		res.redirect ( '/' );
	}
});

app.post ( '/login', function ( req, res )
{
	var post = req.body; // Get POST data
	req.session.valid = false; // Init validation
	var user = login ( post ); // pass post data to login script
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
	var status = req.session.status || undefined; req.session.status = undefined;
	res.send ( ( schools[req.params.school] !== undefined ) ? ( JSON.stringify( schools[req.params.school] ) ) : ( "null" ) )
});

// Logs out ( deletes session data )
app.get ( '/logout', function ( req, res ) {
	try { console.log ( "  -",  req.session.user.name, "has signed out." ) } catch (e) { }
	req.session.user = undefined;
	req.session.valid = false;
	req.session.status = { type: "info", title: "Goodbye.", msg: "Logged out. See you again soon." };
	res.redirect ( "/" );
});

function auth ( req, res, next )
{
	if ( !req.session.valid )
	{
		res.send ( "<h1>Unauthorised!</h1> Please <a href=\"/\">go home</a> and sign in." );
		//error ( "", "" )
	} else {
		next();
	}
}

// client-server communication
io.on('connection', function (socket)
{
	socket.emit ( 'request', { data: "hello" });
	socket.on ( 'response', function ( data ) {
		console.log ( "data:", data.data );
		console.log ( "user:", data.user );
	});
});

// Listen on defined port, and print debug
app.listen ( port, function ()
{
	console.log ( "Running on *:" + port );
})
