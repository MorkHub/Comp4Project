module.exports = function ( express, app, db, ejs, datatypes, crypto )
{
  // Helper Functions ==========================================================
  var alert = {
    success: function ( title, message ) { return { type: "success", title: title, msg: message }; },
    info: function ( title, message ) { return { type: "info", title: title, msg: message }; },
    warn: function ( title, message ) { return { type: "warn", title: title, msg: message }; },
    danger: function ( title, message ) { return { type: "danger", title: title, msg: message }; }
  }

  testUser = { name: "null", school: "NRSIN15",  }


  // Prevents page being rendered if user is not signed in, and page requires valid user
  function auth ( req, res, next )
  {
  	if ( ( req.session.user_id !== undefined ) && ( db.checkFieldExists ( "users", req.session.user_id ) ) )
  	{
      next(); // calls next function if user is valid
  	} else {
      res.send ( "<h1>Unauthorised!</h1> Please <a href=\"/\">go home</a> and sign in." );
    }
  }

  function validUser ( post )
  {
  	process.stdout.write ( "Authenticting " + post.username + "... ");
    db.openSync ( "utf8" );
    if ( db.checkFieldExists ( "users", post.username.trim() ) )  // if user exists
  	{
      var user = db.getField ( "users", post.username );
      if  ( ( user.password === post.passwd ) && ( user.school === post.school ) )
      {
        process.stdout.write ( "Success! Credentials valid\n" );
        return true;
      }
  	}
  	process.stdout.write ( "Failure! Credentials invalid\n" );
  	return false; // if conditions are not met, return false
  }

  // Routes ====================================================================
  app.get ( '/', function ( req, res )
  {
		db.openSync ( 'utf8' );
  	var status = req.session.status; req.session.status = undefined;
    if ( req.session.user_id )
    {
      var user = db.getField ( "users", req.session.user_id );
      var tasks = db.getField ( "schools", user.school ).tasks || [];

    } else {
      user = undefined;
			tasks = [];
    }
    res.render ( 'index', {
      user_id: req.session.user_id,
      user: user,
      status: status,
      tasks: tasks
    }); // render page, passing data to ejs template
  });

  app.get ( '/sandbox', function ( req, res )
  {
  	var status = req.session.status; req.session.status = undefined;
    db.openSync ( "utf8" );
    if ( req.session.user_id !== undefined && db.checkFieldExists ( "users", req.session.user_id ) )
    {
      var user		= db.getField ( "users", req.session.user_id ) || { name: "Test User", access:0 },
          tasks 	= db.getField ( "schools", user.school ).tasks || [],
					access	= user.access; //console.log ( access );
    } else { user = {username:"",password:""}, tasks = [] }
  	res.render ( 'sandbox', { print: { name: crypto.encrypt( user.username ), password: crypto.encrypt( user.password )}, access: access || 0, user_id: req.session.user_id, user: user, status: status, tasks: tasks } );
  });

  app.get ( '/profile', auth, function ( req, res )
  {
    var status = req.session.status || undefined; req.session.status = undefined;
    db.openSync( "utf8" );
    var user = db.getField( "users", req.session.user_id );
    var school = db.getField( "schools", user.school );
    var teacher = db.getField( "users", user.teacher );
      res.render ( 'profile', {
        valid: req.session.valid,
        user_id: req.session.user_id,
        user: user,
				targetUser: user,
        school: school,
        teacher: teacher,
        status: status
      });
  });

  app.get ( '/admin', auth, function ( req, res )
  {
  	var status = req.session.status || undefined; req.session.status = undefined;
    db.openSync( "utf8" );
    var user = db.getField ( "users", req.session.user_id );
    var schools = db.getTable ( "schools" );
    var users = db.getTable ( "users" );
  	if ( user.access >= 3 )
  	{
      res.render ( 'admin', {
        user_id: req.session.user_id,
        user: user,
        schools: schools,
        users: users,
        status: status
      });
  	} else {
  		res.redirect ( '/' );
  	}
  });

  app.post ( '/login', function ( req, res )
  {
  	var post = req.body; // Get POST data
  	req.session.user_id = undefined; // Init user_id in session
  	var valid = validUser ( post ); // check if user is valid
  	if ( valid )
  	{
      db.openSync ( "utf8" );
      req.session.user_id = post.username;
      req.session.status = alert.success ( "Looks good!", "Successfully authenticated :-)" );
      var user = db.getField ( "users", post.username )
      console.log ( "  +",  user.name, "has signed in." );
      res.redirect ( "/profile" ); // redirect to profile if valid

  	} else {
      req.session.status = alert.danger ( "Oh snap!", "Couldn't sign you in. Please check credentials." );
      res.redirect ( "/" ); // redirect to home if invalid
  	}
  });

  app.get( '/school/:school_id', function ( req, res )
  {
  	var status = req.session.status; req.session.status = undefined;
  	res.send ( JSON.stringify( db.getField( "schools", req.params.school_id ) ) );
  });

  app.get ( '/user/:user_id' , function( req, res ) {
    var status = req.session.status; req.session.status = undefined;
    db.openSync( "utf8" );
    if ( db.checkFieldExists ( "users", req.params.user_id ) )
    {
			var user = db.getField ( "users", req.session.user_id );
      var targetUser = db.getField ( "users", req.params.user_id );
      var school = db.getField ( "schools", targetUser.school );
      var teacher = db.getField ( "users", targetUser.teacher );
      res.render ( 'profile', {
        user_id: req.session.user_id,
        user: user,
				targetUser: targetUser,
        school: school,
        teacher: teacher,
        status: status
      });
    } else {
			res.writeHead ( 404 );
			res.send ( "user not found" );
		}
  });

	app.get ( '/user/:user_id/edit', auth, function ( req, res )
	{
		var status = req.session.status; req.session.status = undefined;
		db.openSync( "utf8" );
		if ( !db.checkFieldExists ( "users", req.params.user_id ) )
		{
			req.session.status = alert.danger ( "Oh snap!", "The requested user was not found." );
			req.redirect ( "/" );
		}
		var admin = db.getField ( "users", req.session.user_id ), user = db.getField ( "users", req.params.user_id ),
		schools = db.getTable ( "schools" ),
		teacher = db.getField ( "users", user.teacher ), school = schools[user.school]
		if ( admin.access >= 7 || ( admin.access >= 5 && admin.school == user.school ) )
		{
			res.render ( "edit", {
				valid: req.session.valid,
				user_id: req.session.user_id,
				schools: schools,
				user: admin,
				school: school,
				targetUser: user,
				teacher: teacher,
				status: status
			} )
		}
	});

	app.get ( '/register', function ( req, res )
	{
		status = req.session.status; req.session.status = undefined;
		if ( !req.session.user_id )
		{
			res.render ( 'register', { user_id: null, user: { access: 0 }, status: status });
		} else {
			res.redirect ( '/' );
		}
	});

	app.post ( '/register', function ( req, res )
	{
		db.openSync ( "utf8" );
		var post = req.body;
		if ( post.inputPassword == post.inputPassword2 )
		{
			if ( db.checkFieldExists ( "schools", post.inputSchool ) )
			{
				console.log("creating user");
				var user = new datatypes.User (
					post.inputFullName,
					post.inputUsername,
					post.inputPassword,
					post.inputSchool
				);
				//console.log(user)
				if ( !db.checkFieldExists ( "users", post.inputUsername ) )
				{
					db.createField ( "users", user.username, user );
					db.saveAsync( "store.db", function(){} );
					req.session.status = alert.success ( "Hooray!", "Account created successfully!" );
					res.redirect ( '/' );
					//res.send ( post.inputFullName + "'s account created!" )
				} else {
					req.session.status = alert.danger ( "Oh snap!", "User already exits. Already signed up?" );
					res.redirect ( '/' );
					//res.send ( "account already exists" )
				}
			} else {
				req.session.status = alert.danger ( "Oh snap!", "School ID not recognised, please check with your teacher." );
				res.redirect ( "/register" );
			}
		} else {
			req.session.status = alert.danger ( "Oh snap!", "Passwords did not match! Please try again." );
			res.redirect ( "/register" );
		}
	});
	
	app.get ( '/delete_user/:user_id', auth, function ( req, res ) {
		db.openSync( "utf8" );
		//if ( !( req.session.user_id !== null && db.checkFieldExists ( "users", req.session.user_id ) ) )
		//{ req.session.status = alert.danger ( "Oh snap!", "You are not logged in." ) } else {
			var user = db.getField ( "users", req.session.user_id ) || { username: null, school: null };
			var user2 = db.getField ( "users", req.params.user_id ) || { username: null, school: null };
			process.stdout.write ( user.username + " tried to delete " + user2.username + ".. " );
			if ( user == undefined )
			{
				req.session.status = alert.danger ( "Uh oh!", "User mismatch error");
				process.stdout.write ( "failed ( user not signed in )\n" );
			} else {
				if ( !db.checkFieldExists ( "users", req.params.user_id ) ) {
					req.session.status = alert.danger ( "Who?", "Specified user not found. Already deleted?" );
					process.stdout.write ( "failed ( user not found )\n" )
				} else if ( user.access >= 7 || ( user.access >= 5 && user.school == user2.school ) ) {
					db.delete ( "users", req.params.user_id );
					datatypes.RemoveUser ( user2.username, user2.school );
					req.session.status = alert.success ( "Hooray!", "User successfully deleted." );
					process.stdout.write ( "success.\n" );
				} else {
					req.session.status = alert.danger ( "Not allowed!", "You do not have permission to do this." );
					process.stdout.write ( "failed ( not permitted )\n" );
				}
			}
		//}
		db.saveAsync( "store.db", function(){} );
		res.redirect ( '/admin' );
		//res.send ( req.params.user_id );
	});

  // Logs out ( deletes session data )
  app.get ( '/logout', function ( req, res ) {
    db.openSync ( "utf8" );
    var user = db.getField ( "users", req.session.user_id );
  	try { console.log ( "  -", ( user.name || null ), "has signed out." ) } catch (e) { }
  	req.session.user_id = undefined;
  	req.session.status = alert.danger ( "Goodbye.", "Logged out. See you again soon." );
  	res.redirect ( "/" );
	});
}
