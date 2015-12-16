module.exports = function ( express, app, db, ejs )
{
  // Helper Functions ==========================================================
  var alert = {
    success: function ( title, message ) { return { type: "success", title: title, msg: message }; },
    info: function ( title, message ) { return { type: "info", title: title, msg: message }; },
    warn: function ( title, message ) { return { type: "warn", title: title, msg: message }; },
    danger: function ( title, message ) { return { type: "critical", title: title, msg: message }; }
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
  	process.stdout.write ( "Authenticting " + post.username + " ");
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
  	tasks = ( req.session.user !== undefined ) ? ( schools[req.session.user.school].tasks ) : ( [] ) // holds task(s) data
  	var status = req.session.status || undefined; req.session.status = undefined;
    if ( req.session.user_id )
    {
      db.openSync ( "utf8" );
      var user = db.getField ( "users", req.session.user_id );
      var tasks = db.getField ( "schools", user.school ).tasks || [];

    } else {
      user = undefined;
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
  	var status = req.session.status || undefined; req.session.status = undefined;
    db.openSync ( "utf8" );
    if ( req.session.user_id !== undefined )
    {
      var user = db.getField ( "users", req.session.user_id ) || { name: "Test User", },
          tasks = db.getField ( "schools", user.school ).tasks || [];
    } else { user = {}, tasks = {} }
  	res.render ( 'sandbox', { user_id: req.session.user_id, user: req.session.user, status: status, tasks: tasks } );
  });

  app.get ( '/profile', auth, function ( req, res )
  {
    var status = req.session.status || undefined;
    req.session.status = undefined;
    db.openSync( "utf8" )
    var user = db.getField( "users", req.session.user_id );
    var school = db.getField( "schools", user.school );
    var teacher = db.getField( "users", user.teacher );
      res.render ( 'profile', {
        valid: req.session.valid,
        user_id: req.session.user_id,
        user: user,
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
  	req.session.valid = false; // Init validation
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
  	var status = req.session.status || undefined; req.session.status = undefined;
  	res.send ( JSON.stringify( db.getField( "schools", req.params.school_id ) ) );
  });

  app.get ( '/user/:user_id' , function( req, res ) {
    var status = req.session.status || undefined; req.session.status = undefined;
    db.openSync( "utf8" );
    if ( db.checkFieldExists ( "users", req.params.user_id ) )
    {
      var user = db.getField ( "users", req.params.user_id );
      var school = db.getField ( "schools", user.school );
      var teacher = db.getField ( "users", user.teacher );
      res.render ( 'profile', {
        user_id: req.session.user_id,
        user: user,
        school: school,
        teacher: teacher,
        status: status
      });
    }
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
