module.exports = function ( app, db, io, host, crypto )
{
	db.openAsync ( "utf8", function ()
	{
		db.createTable ( "circuits" );
	});
	// client-server communication
	io.on('connection', function ( socket )
	{
		socket.emit ( 'broadcast', "Connected! :-)");
		socket.emit ( 'connected' );
		//console.log ( socket )
		socket.on ( 'gate_data', function ( data ) {
			//var gates = data.gates;
			//var user  = data.user;
			//console.log ( data );
			socket.emit ( 'broadcast', "Thanks for the data!" );
		});
	});
	io.on ( 'login', function ( data )
	{
		db.openSync ( "utf8"  );
		process.stdout.write ( "usr: " + data.usr + "\npwd: " + data.pwd + "\n");
		var usr = crypto.decrypt ( data.usr );
		var pwd = crypto.decrypt ( data.pwd );
		process.stdout.write ( "usr: " + usr + "\npwd: " + pwd );
		if ( db.checkFieldExists ( "users", usr ) )
		{
			var user = db.getField ( "users", usr );
			if ( user.password === pwd )
			{
				console.log ( "  + " + user.name + " has signed in (sandbox)" ); 
				socket.emit ( "login_response", { name: user.name, id: data.user_id, } )
			}
		}
	});
	io.on ( 'save_data', function ( data )
	{
		db.Async( "utf8", function()
		{
			if ( db.checkFieldExists ( "users", data.user.username ) )
			{
				var user = db.getField ( "users", data.user );
				user.files = user.files || [];
				user.files [ data.saveData.project.name ] = data.saveData;
				db.set ( "users", data.user.username, user );
			}
		});
	});
}
