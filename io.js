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
		socket.on ( 'gate_data', function ( data ) {
			socket.emit ( 'broadcast', "Thanks for the data!" );
		});
	
		socket.on ( 'login', function ( data )
		{
			db.openSync ( "utf8" );
			var usr = crypto.decrypt ( data.usr );
			var pwd = crypto.decrypt ( data.pwd );
			if ( db.checkFieldExists ( "users", usr ) )
			{
				var user = db.getField ( "users", usr );
				if ( user.password === pwd )
				{
					console.log ( "      + " + user.name + " has signed in (sandbox)" ); 
					socket.emit ( "login_response", { name: user.name, username: user.username } )
				}
			}
		});
		socket.on ( 'save_data', function ( data )
		{
			db.openAsync( "utf8", function()
			{
				if ( db.checkFieldExists ( "users", data.user.username ) )
				{
					var user = db.getField ( "users", data.user.username );
					user.files = user.files || {};
					user.files [ data.saveData.project.name ] = data.saveData;
					console.log(data.saveData);
					console.log ( "User, " + user.username + ", uploaded " + data.saveData.project.name + " \"" +  data.saveData.project.desc + "\" by " + data.saveData.project.author + "." );
					db.set ( "users", data.user.username, user );
				}
			});
		});
		
		socket.on ( 'load_data', function ( data )
		{
			var user = data.user,
					target = data.target;
			user.username = crypto.decrypt ( user.username );
			user.password = crypto.decrypt ( user.password );
			db.openAsync ( "utf8", function()
			{
				if ( db.checkFieldExists ( "users", user.username ) )
				{
					var userObj = db.getField ( "users", user.username );
					var saveData = userObj.files[target] || { gates: {}, wires: {}, project: { name: "", desc: "",author: "" } };
					if ( user.password = userObj.password && saveData.project.name.trim() !== "" )
					{
						console.log ( "User, " + user.username + ", loaded project " + saveData.project.name + " \"" + saveData.project.desc + "\" by " + saveData.project.author + "." );
						socket.emit ( "load_data", saveData);
					} else { socket.emit ( 'delete_error', { type: "danger", title: "Delete error", msg: "Password incorrect." } ); }
				} else { socket.emit ( 'load_error', { type: "danger", title: "Load error", msg: "User not found." } ); }
			});
		});

		socket.on ( 'delete_data', function ( data )
    {
      var user = data.user,
          target = data.target;
      user.username = crypto.decrypt ( user.username );
      user.password = crypto.decrypt ( user.password );
      db.openAsync ( "utf8", function()
      {
        if ( db.checkFieldExists ( "users", user.username ) )
        {
          var userObj = db.getField ( "users", user.username );
          if ( user.password = userObj.password )
          {
						userObj.files = userObj.files || {};
						delete userObj.files[target];
						db.set ( "users", user.username, userObj );
            console.log ( "User, " + user.username + ", deleted project " + target + "." );
          } else { socket.emit ( 'delete_error', { type: "danger", title: "Delete error", msg: "Password incorrect." } ); }
        } else { socket.emit ( 'load_error', { type: "danger", title: "Load error", msg: "User not found." } ); }
      });
    })

	});
}
