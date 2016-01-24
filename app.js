// Import modules
var session    = require ( "express-session" ),
	bodyParser = require ( "body-parser" ),
	datatypes  = require ( "./defines.js" ),
	express	   = require ( "express" ),
	flat       = require ( "flat.js" ),
	ejs        = require ( "ejs" ),
	io         = require ( "socket.io" )( 25567 ),
	crypto     = require ( "./crypto.js" ),
	app        = express (),
	host       = "http://themork.co.uk/",
	port       = ( process.env.computername == "ANNE" ) ? ( 80 ) : ( 25564 || process.env.port ),
	args       = process.argv; args.shift(); args.shift();

// database init
var db = flat ( "store.db", { persist: true } );

db.openAsync("utf8", function () {
	var schools = db.getTable("schools");
	console.log(schools)
	for ( key in schools )
	{
		schools[key].tasks = [];
		console.log(schools[key])
		db.set("schools",key,schools[key]);
	}
});

// Enable modules & init
app.set ( 'view engine', 'ejs' ); // view engine; used to render pages, with data passed to html
app.use ( bodyParser.json () ); //  bodyParser allows me to receive data from post body
app.use ( bodyParser.urlencoded ( { extended: true } ) ); // additional config for ^
app.use ( session ( { secret: "isaacnewton", resave: true, saveUninitialized: true } ) ); // manipulate signed session data

// Routes & compartmentalisation
app.use ( express.static ( __dirname + '/public' ) ); // serve any content from public/
require ( './routes.js' )( express, app, db, ejs, datatypes, crypto );
require ( './io.js' )( app, db, io, host, crypto );
app.listen ( port, function () { console.log ( "Running on *:" + port ) });
