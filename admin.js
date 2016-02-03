var def = require ( "./defines.js" ),
		flat = require ( "flat.js" ),
		crypt = require ( "./crypto.js" ),
		path = "store.db";

var db = flat ( path, { persist: true } );
db.openSync( "utf8" );

var cmd = process.argv[2].toLowerCase();
var key = process.argv[3];
var params = process.argv;
params.shift(); params.shift(); params.shift();

( !db.checkTableExists( "users" )   ) ? db.createTable( "users"   ) : undefined;
( !db.checkTableExists( "schools" ) ) ? db.createTable( "schools" ) : undefined;
( !db.checkTableExists( "tasks" )   ) ? db.createTable( "tasks"   ) : undefined;

function e ( msg ){
	console.error( msg, process.argv[0] );
	process.exit();
}

if ( cmd.length > 1 ){
	switch ( cmd ){
		case "adduser":
			var usage = "USAGE: %s adduser [<name> <username> <password> <school> <access> <teacher> [valid] [avatarURL]]";
			if ( !db.checkFieldExists( "users", params[0] ) ) {
				if ( params.length > 0 ){
					var name = params[0],
							username = params[1] || e(usage),
							password = ( ( params[2] == "auto" ) ? ( undefined ) : ( params[2] ) ),
							school = params[3] || e(usage),
							access = params[4] || e(usage),
							teacher = params[5] || e(usage),
							valid = params[6] || false,
							avatar = params[7] || undefined;
					var user = new def.User ( name, username, password, school, access, teacher, false, avatar );
					db.createField( "users", username, user );
					//db.saveAsync( "store.db", function(){} );
				} else { e(usage); }
			} else { console.log( "User exists") }
		break;
		case "deluser":
			( params[0] ) ? ( ( db.checkFieldExists( "users", params[0] ) ) ? ( db.delete( "users", params[0] ) ) : e("User does not exist!") ) : e(usage);
		break;
		case "showuser":
			( db.checkFieldExists( "users", params[0] ) ) ? ( console.log( db.getField( "users", params[0] ) ) ) : e(usage);
		break;

		case "list":
			( db.checkTableExists( "users" ) ) ? ( console.log ( db.getTable( "users" ) ) ) : ( console.log( "No database" ) );
		break;

		case "addschool":
		break;
		case "delschool":
			( params[0] ) ? ( ( db.checkFieldExists( "schools", params[0] ) ) ? ( db.delete( "schools", params[0] ) ) : e("School does not exist!") ) : e(usage);
		break;
		break;
		case "showschool":
			( db.checkFieldExists( "schools", params[0] ) ) ? ( console.log( db.getField( "schools", params[0] ) ) ) : e(usage);
		break;
		break;

		case "adduser":
		break;
		case "deluser":
		break;
		case "showtask":
			( db.checkFieldExists( "tasks", params[0] ) ) ? ( console.log( db.getField( "tasks", params[0] ) ) ) : e(usage);
		break;
		break;
	}
}
