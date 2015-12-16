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

// database init
var db = flat ( "store.db", { persist: true } );

// Init tasks
var tasks = [];

// Enable modules & init
app.set ( 'view engine', 'ejs' ); // view engine; used to render pages, with data passed to html
app.use ( bodyParser.json () ); //  bodyParser allows me to receive data from post body
app.use ( bodyParser.urlencoded ( { extended: true } ) ); // additional config for ^
app.use ( session ( { secret: "isaacnewton", resave: true, saveUninitialized: true } ) ); // manipulate signed session data

// Routes
app.use ( express.static ( __dirname + '/public' ) ); // serve any content from public/
require ( './routes.js' )( express, app, db, ejs );

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
