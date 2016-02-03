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

( !db.checkTableExists( "users" )		) ? db.createTable( "users"		) : undefined;
( !db.checkTableExists( "schools" ) ) ? db.createTable( "schools" ) : undefined;
( !db.checkTableExists( "tasks" )		) ? db.createTable( "tasks"		) : undefined;

function e ( msg ){
	console.error( msg, "node" );
	process.exit();
}

if ( cmd.length > 1 ){
	switch ( cmd ){
		case "adduser":
			var usage = "USAGE: %s adduser <name> <username> <password> <school> <access> <teacher> [valid] [avatarURL]";
			if ( !db.checkFieldExists( "users", params[0] ) ) {
				if ( params.length > 0 ){
					var name = params[0] || e(usage),
							username = params[1] || e(usage),
							password = ( ( params[2] == "auto" ) ? ( undefined ) : ( params[2] ) ),
							school = params[3] || e(usage),
							access = params[4] || e(usage),
							teacher = params[5] || e(usage),
							valid = params[6] || false,
							avatar = params[7] || undefined;
					var user = new def.User ( name, username, password, school, access, teacher, school, false, avatar );
					db.createField( "users", username, user );
					db.saveAsync( "store.db", function(){} );
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
		case "showschool":
			( db.checkFieldExists( "schools", params[0] ) ) ? ( console.log( db.getField( "schools", params[0] ) ) ) : e(usage);
		break;

		case "addtask":
			var usage = "USAGE: %s addtask <name> <desc|NONE> <summary> <BEGINNER|INTERMEDIATE|ADEPT|ELITE> <maximum points|DEFAULT> <teacher username> [solution] ";
			var l = ["beginner","intermediate","adept","elite"];
			console.log( params );
			if ( !db.checkFieldExists( "tasks", ( params[0] || "" ).toLowerCase().replace(/ /g,"") ) ) {
				var name = params[0] || e(usage),
						desc = ( params[1] || e(usage) ) == "NONE" ? "" : params[1],
						summary = params[2] || e(usage),
						level = params[3] || e(usage), level = ( !isNaN( parseInt( level ) ) ) ? ( parseInt( level ) ) : ( l.indexOf( level ) + 1 ), level = Math.max( 1, Math.min( level, 4 ) ),
						value = params[4] || e(usage), value = ( !isNaN( parseInt( value ) ) ) ? ( parseInt( value ) ) : ( level * 10 ),
						teacher = params[5] || e(usage),
						school = db.getField( "schools", db.getField( "users", teacher ).school ).id,
						solution = params[6] || "ANY";
				( school == undefined ) ? e(usage) : true;
				var task = new def.Task ( name, desc, summary, level, value, teacher, school, solution  );
				console.log( task );
				db.createField( "tasks", name.toLowerCase().replace(/ /g,""), task );
				db.saveAsync( "store.db", function(){} );
			} else { console.log( "Task exists") }	
		break;
		case "deltask":
			if ( db.checkFieldExists( "tasks", params[0] ) ){
				db.delete( "tasks", params[0] );
			} else {
				console.log( "Task does not exist" );
			}
		break;
		case "showtask":
			( db.checkFieldExists( "tasks", params[0] ) ) ? ( console.log( db.getField( "tasks", params[0] ) ) ) : e(usage);
		break;
		break;
	}
}
