var md5 = require ( "md5" );
module.exports = function ( express,app, db, ejs, datatypes, crypto )
{
	// section utility =====================================================================
	var alert = {
		success: function ( message ) { return { type: "success", title: "Success!", msg: message }; },
		info: function ( message ) { return { type: "info", title: "Info:", msg: message }; },
		warn: function ( message ) { return { type: "warn", title: "Warning:", msg: message }; },
		danger: function ( message ) { return { type: "danger", title: "Oh Snap!", msg: message }; }
	}

	function length(a){b=0;for(c in a){b++};return b;}

	function error ( req, res, meessage ) {
		res.render ( 'error', {
			user_id: req.session.user_id,
			user: user,
			status: status,
			error: message
		});
	}

	function gravatar ( email ) {
		var email = md5( email.toString().trim() );
		return "http://gravatar.com/avatar/" + email + "?s=200&d=mm";
	}

	var testUser = { name: "null", school: "NRSIN15" };
	function newUser ( username, fullname, email, password, school, access, teacher, valid )
	{
		db.openSync ( "utf8" );
		var message;
			var name = fullname || "John Smith",
					username = username || ( fullname.substring ( 0,1 ) + fullname.substring ( fullname.indexOf( " " ) +1 ) ).toLowerCase(),
					email = email || username + "@school.edu",
					password = password || "password123",
					school = school,
					access = access || 1,
					teacher = teacher,
					valid = valid || false;
		valid = ( valid == false || valid == "false" ) ? false : true;
		if ( !db.checkFieldExists ( "users", username ) )
		{
			if ( school && db.checkFieldExists ( "schools", school ) )
			{
				var user = new datatypes.User ( fullname, username, email, password, school, access, teacher, valid );
				db.createField ( "users", username, user );
				message = alert.success ( "Account created successfully!" );
			} else {
				message = alert.danger ( "School code not recognized. Please confirm with your teacher." );
			}
		} else {
			message = alert.danger ( "Username taken. Already registered?" );
		}
		return message;
	}

	function editUser ( stuff )
	{
		db.openSync ( "utf8" );
		if ( stuff.username == undefined ) { return alert.danger ( "No user specified! Aborting" ); } else { var user = db.getField ( "users", stuff.username ); }
		if ( stuff.fullname !== undefined ) { user.name = stuff.fullname; }
		if ( stuff.email	!== undefined ) { user.email = stuff.email; }
		if ( stuff.password !== undefined ) { user.password = stuff.password; }
		if ( stuff.valid == "true" || stuff.valid == true ) { user.valid = true; } else { user.valid = false; }
		if ( stuff.school !== undefined && db.checkFieldExists ( "schools", stuff.school ) ) { user.school = stuff.school; } else { alert.danger ( "School not found." ); }
		if ( stuff.access !== undefined && !isNaN ( parseInt ( stuff.access ) ) ) { user.access = parseInt ( stuff.access ); } else { return alert.danger ( "Incorrect access level." ); }
		if ( stuff.teacher !== undefined && db.checkFieldExists ( "users", stuff.teacher ) && ( db.getField ( "users", stuff.teacher ).access >= 3 || stuff.access >=3 ) ) { user.teacher = stuff.teacher; } else { return alert.danger ( "User/teacher listing not found." ); }

		if ( db.checkFieldExists ( "users", stuff.username ) )
		{
			var message;
			if ( stuff.school && db.checkFieldExists ( "schools", stuff.school ) )
			{
				message = alert.success ( "User modified successfully"	)
                db.saveAsync("store.db",function(){});
			} else {
				message = alert.danger ( "School not found. Please check again." );
			}
		} else {
			message = alert.danger ( "User not found. Unable to modify." );
		}
		return message;
	}

	function first( obj )
	{
		for ( var key in obj ) return key;
	}

	function verifyPost ( req )
	{
		var post = req.body;
		post.inputFullName	= ( post.inputFullName	== undefined || post.inputFullName.toString().trim() == "" )	? ( undefined ) : ( post.inputFullName );
		post.inputUsername	= ( post.inputUsername	== undefined || post.inputUsername.toString().trim() == "" )	? ( undefined ) : ( post.inputUsername.replace(".","") );
		post.inputPassword	= ( post.inputPassword	== undefined || post.inputPassword.toString().trim() == "" )	? ( undefined ) : ( post.inputPassword );
		post.inputValid		= ( post.inputValid		== undefined )	? ( undefined ) : ( post.inputValid );
		post.inputSchool	= ( post.inputSchool	== undefined || post.inputSchool.toString().trim() == "" )		? ( undefined ) : ( post.inputSchool );
		post.inputAccess	= ( post.inputAccess	== undefined || post.inputAccess.toString().trim() == "" )		? ( undefined ) : ( parseInt ( post.inputAccess ) );
		post.inputTeacher	= ( post.inputTeacher	== undefined || post.inputTeacher.toString().trim() == "" )	? ( undefined ) : ( post.inputTeacher );
	}

	// section auth ========================================================================
	// Prevents page being rendered if user is not signed in, and page requires valid user
	function auth ( req, res, next )
	{
		if ( ( req.session.user_id !== undefined ) && ( db.checkFieldExists ( "users", req.session.user_id ) ) )
		{
			next();
		} else {
			req.session.status = alert.danger ( "This area requires a valid user. Please sign in." );
			res.redirect ( "/" );
		}
	}

	function validUser ( post )
	{
		db.openSync ( "utf8" );
		if ( db.checkFieldExists ( "users", post.username.trim() ) )	// if user exists
		{
			var user = db.getField ( "users", post.username );
			if	( ( user.password === post.passwd ) && ( user.school === post.school ) )
			{
				return true;
			}
		}
		return false; // if conditions are not met, return false
	}

	// section routes =======================================================================
	app.get ( '/', function ( req, res )
	{
		db.openSync ( 'utf8' );
		var status = req.session.status; req.session.status = undefined;
		var user = db.getField ( "users", req.session.user_id ) || testUser;
		var tasks = db.getField ( "schools", user.school ).tasks || [];
		res.render ( 'index', {
			user_id: req.session.user_id,
			user: user,
			status: status,
			tasks: tasks
		}); // render page, passing data to ejs template
	});

	// section sandbox
	app.get ( '/sandbox', function ( req, res )
	{
		var status = req.session.status; req.session.status = undefined;
		db.openSync ( "utf8" );
		if ( req.session.user_id !== undefined && db.checkFieldExists ( "users", req.session.user_id ) )
		{
			var user		= db.getField ( "users", req.session.user_id ) || { name: "Test User", access:0 },
					access	= user.access; //console.log ( access );
		} else { user = {username:"",password:""}, tasks = [] }
		res.render ( 'sandbox', {
			print: {
				name: user.username,
				password: crypto.encrypt( user.password )
			},
			access: access || 0,
			user_id: req.session.user_id,
			user: user,
			status: status
		});
	});

	// section profile
	app.get ( '/profile', auth, function ( req, res )
	{
		var status = req.session.status || undefined; req.session.status = undefined;
		db.openSync( "utf8" );
		var user = db.getField( "users", req.session.user_id );
		user.avatar = gravatar(user.email);
		user = datatypes.userScore(user);
        console.log(datatypes.userScore(user))
		var school = db.getField( "schools", user.school );
		var teacher = db.getField( "users", user.teacher );
		res.render ( 'profile', {
			user_id: req.session.user_id,
			user: user,
			targetUser: user,
			school: school,
			teacher: teacher,
			status: status
		});
	});

	// section tasks
	app.get ( '/tasks/', auth, function ( req, res )
	{
		var status = req.session.status || undefined; req.session.status = undefined;
		db.openSync( "utf8" );
		var user = db.getField ( "users", req.session.user_id );
		var school = db.getField ( "users", req.session.user_id );
		var tasks = [];
		var temp = db.getTable( "tasks" )
		for ( key in temp ){
			if ( temp[key].teacher == user.teacher ) tasks[key] = temp[key]
		}
		var page = user.access >= 3 ? 'teacher' : 'student';
		res.render( 'tasklist/'+page, {
			user_id: req.session.user_id,
			user: user,
			school: school,
			tasks: tasks,
			status: status
		})
	});

	// section view task
	app.get ( '/task/:task_id', auth, function ( req, res )
	{
		var status = req.session.status || undefined; req.session.status = undefined;
		db.openSync( "utf8" );
		var user = db.getField ( "users", req.session.user_id );
		var school = db.getField ( "schools", user.school );
		var task = db.getField ( "tasks", req.params.task_id );

		if ( task !== undefined )
		{
			res.render ( 'tasks',
			{
				user_id: req.session.user_id,
				user: user,
				school: school,
				task: task,
                task_id: req.params.task_id,
				status: status
			});
		} else {
			req.session.status = alert.danger ( "Task " + req.params.task_id + " not found, please try again" );
			res.redirect ( '/' );
			res.writeHead ( "404" );
		}
	});

	// setion submit task
    app.get ( '/task/:task_id/submit/:filename', auth, function( req,res )
	{
		db.openSync( "utf8" );
		var user = db.getField( "users", req.session.user_id );
		var task = db.getField( "tasks", req.params.task_id );
		if ( task !== undefined && task.school == user.school ) {
			if ( /*user.files[ req.params.filename ] !== undefined*/ true ){
				var file = user.files[ req.params.filename ];
				task.submissions = task.submissions || {};
				task.submissions[req.session.user_id] = file;
				( typeof user.tasksDone == "array" ) && ( user.tasksDone = {} )
				user.tasksDone[ req.params.task_id ] = { id: req.params.task_id, comments: [], max: task.value, score: 0 };
				db.set ( "tasks", req.params.task_id, task );
				db.set ( "users", req.session.user_id, user );
				req.session.status = alert.success ( "Submission successful!" );
				res.redirect ( "/tasks" );
			} else {
				req.session.status = alert.danger( "File does not exist!" );
				res.redirect( "/tasks" );
			}
		} else {
			req.session.status = alert.danger ( "Task not found!" );
			res.redirect ( "/tasks" );
		}
	});

    // section import task
	app.get ( '/task/:task_id/:filename/import', auth, function( req, res )
	{
		db.openSync( "utf8" );
		var user = db.getField( "users", req.session.user_id );
		var task = db.getField( "tasks", req.params.task_id );
		var file = task.submissions[req.params.filename];
		if ( file !== undefined ) {
			if ( user.files[ req.params.filename ] !== undefined ) {
				for ( i=0; i<10; i++ ) {
                    if ( user.files[req.params.file] == undefined ) {
                        user.files[req.params.file + i] = file;
                        req.session.status = alert.success ( "Submission from " + req.params.filename + " has been added to your account!" );
                    }
                }
			} else {
				user.files[req.params.filename] = file;
				req.session.status = alert.success ( "Submission from " + req.params.filename + " has been added to your account!" );
            }
		} else {
			req.session.status = alert.danger ( "Submission not found!" );
		}
		res.redirect( "/task/" + req.params.task_id );
	});

    // section feedback submission
    app.post( '/task/:task_id/:filename/feedback', auth, function( req, res )
    {
		db.openSync( "utf8" );
        var post = req.body;
		var user = db.getField( "users", req.session.user_id );
        var targetUser = db.getField( "users", req.params.filename );
		var task = db.getField( "tasks", req.params.task_id );
		var file = task.submissions[req.params.filename];
		if ( file !== undefined ) {
            if ( ( user.access >=3 && user.school == task.school ) ||  user.access >= 7 ) {
	            file.feedback = { "comment": post.inputComment, score: post.inputScore };
                targetUser.tasksDone[req.params.task_id].comment = post.inputComment;
                file.feedback.score = post.inputScore;
                targetUser.tasksDone[req.params.task_id].score = post.inputScore
                db.saveAsync( "store.db", function(){/* */} );
            }
        } else {
			req.session.status = alert.danger ( "Submission not found!" );
            res.redirect( "/task/" + req.params.task_id )
		}
		res.redirect( "/task/" + req.params.task_id );
    });

	// section view school
	app.get( '/school/:school_id', function ( req, res )
	{
		var status = req.session.status; req.session.status = undefined;
		res.send ( JSON.stringify( db.getField( "schools", req.params.school_id ) ) );
	});

	// section view user
	app.get ( '/user/:user_id' , function( req, res ) {
		var status = req.session.status; req.session.status = undefined;
		var status = req.session.status; req.session.status = undefined;
		db.openSync( "utf8" );
		if ( db.checkFieldExists ( "users", req.params.user_id ) )
		{
			var user = db.getField ( "users", req.session.user_id );
			var targetUser = db.getField ( "users", req.params.user_id );
			targetUser.avatar = gravatar( targetUser.email );
			user = datatypes.userScore(targetUser);
			var email = targetUser.email || "";
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
			res.render ( 'error', {
				user_id: req.session.user_id,
				user: user,
				status: status,
				error: "User not found."
			});
		}
	});

	// section admin
	app.get ( '/admin', auth, function ( req, res )
	{
		var status = req.session.status || undefined; req.session.status = undefined;
		db.openSync( "utf8" );
		var user = db.getField ( "users", req.session.user_id );
		var schools = db.getTable ( "schools" );
		var users = db.getTable ( "users" );
		for ( key in users ) {
			users[key].avatar = gravatar ( users[key].email );
		};
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

	// section register
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
		var post = req.body;
		if ( post.inputPassword == post.inputPassword2 )
		{
			req.session.status = newUser ( post.inputUsername, post.inputFullName, post.inputEmail, post.inputPassword, post.inputSchool, 1, false ) || alert.success("");
			if ( req.session.status.type == "success" )
			{
				res.redirect ( "/" );
			} else {
				res.redirect ( "/register" );
			}
		} else {
			req.session.status = alert.danger ( "School ID not recognised, please check with your teacher." );
			res.redirect ( "/register" );
		}
	});

	// section add user
	app.get ( '/admin/add_user', auth, function ( req, res )
	{
		db.openSync ( "utf8" );
		status = req.session.status; req.session.status = undefined;
		var adminUser = db.getField ( "users", req.session.user_id );
		if ( adminUser.access >= 10 )
		{
			var schools = db.getTable ( "schools" );
		} else {
			var schools = {};
			schools [ adminUser.school ] = db.getField ( "schools", adminUser.school );
		}
		res.render ( "adduser.ejs", {
			user_id: req.session.user_id || "none",
			user: adminUser,
			users: db.getTable ( "users" ),
			schools: schools,
			status: status,
		});
	});

	app.post ( '/admin/add_user', auth, function ( req, res )
	{
		db.openSync ( "utf8" );
		var post = req.body;
		var adminUser = db.getField ( "users", req.session.user_id );
		verifyPost ( req );
		req.session.status = newUser (
			post.inputUsername,
			post.inputFullName,
			post.inputEmail,
			post.inputPassword,
			post.inputSchool,
			post.inputAccess,
			post.inputTeacher,
			post.inputValid
		);
		res.redirect ( "/admin/add_user" );
	});

	// section edit user
	app.get ( '/user/:user_id/edit', auth, function ( req, res )
	{
		var status = req.session.status; req.session.status = undefined;
		db.openSync( "utf8" );
		if ( !db.checkFieldExists ( "users", req.params.user_id ) )
		{
			req.session.status = alert.danger ( "The requested user was not found." );
			res.redirect ( "/" );
		}
		var admin = db.getField ( "users", req.session.user_id ), user = db.getField ( "users", req.params.user_id ),
		schools = db.getTable ( "schools" ), users = db.getTable ( "users" ),
		teacher = db.getField ( "users", user.teacher ), school = schools[user.school]
		if ( user.username == admin.username || admin.access >= 10 || ( admin.access >= 7 && admin.school == user.school ) )
		{
			res.render ( "edituser", {
				user_id: req.session.user_id,
				schools: schools,
				users: users,
				user: admin,
				school: school,
				targetUser: user,
				teacher: teacher,
				status: status
			});
		} else {
			req.session.status = alert.danger ( "Not authorised!" );
			res.redirect ( '/' );
		}
	});

	app.post ( '/user/:user_id/edit', auth, function ( req, res )
	{
		db.openSync( "utf8" );
		var post = req.body;
        console.log(post)
		if ( req.session.user_id == req.params.user_id || db.getField("users",req.session.user_id).access >= 3 )
		{
			verifyPost ( req );
			req.session.status = editUser ({
				username: post.inputUsername,
				fullname: post.inputFullName,
				email: post.inputEmail,
				password: post.inputPassword,
				valid: post.inputValid,
				school: post.inputSchool,
				access: post.inputAccess,
				teacher: post.inputTeacher
			});
			if ( req.session.status.type == "success" )
			res.redirect ( "/admin" )
        } else {
            req.session.status = alert.danger ( "No access." );
            res.redirect ( "/" );
        }
	});

	// section delete user
	app.get ( '/delete_user/:user_id', auth, function ( req, res ) {
		db.openSync( "utf8" );
			var user = db.getField ( "users", req.session.user_id ) || { username: null, school: null };
			var user2 = db.getField ( "users", req.params.user_id ) || { username: null, school: null };
			process.stdout.write ( user.username + " tried to delete " + user2.username + ".. " );
			if ( user == undefined )
			{
				req.session.status = alert.danger ( "User mismatch error");
				process.stdout.write ( "failed ( user not signed in )\n" );
			} else {
				if ( !db.checkFieldExists ( "users", req.params.user_id ) ) {
					req.session.status = alert.danger ( "Specified user not found. Already deleted?" );
					process.stdout.write ( "failed ( user not found )\n" )
				} else if ( user.access >= 7 || ( user.access >= 5 && user.school == user2.school ) ) {
					db.delete ( "users", req.params.user_id );
					req.session.status = alert.success ( "User successfully deleted." );
					process.stdout.write ( "success.\n" );
				} else {
					req.session.status = alert.danger ( "You do not have permission to do this." );
					process.stdout.write ( "failed ( not permitted )\n" );
				}
			}
		//}
		res.redirect ( '/admin' );
	});

	// section user settings
	app.get ( '/change_password', auth, function ( req, res )
	{
		var status = req.session.status || undefined; req.session.status = undefined;
		db.openSync ( "utf8" );
		var user = db.getField( "users", req.session.user_id );
		res.render ( 'changepassword', {
			user_id: req.session.user_id,
			user: user,
			status: status
		});
	});

	app.post ( '/change_password', function ( req, res )
	{
		db.openSync ( "utf8" );
		var user = db.getField ( "users", req.session.user_id );
		var post = req.body;
		if ( post.inputCurrentPassword == user.password )
		{
			user.password = post.inputNewPassword;
			user.valid = true;
			console.log ( "User, " + user.username + ", changed their password." );
			req.session.status = alert.success ( "Password successfully changed!" );
			res.redirect ( "/" );
		} else {
			req.session.status = alert.danger ( "Supplied current password incorrect." );
			res.redirect ( "/change_password" );
		}
	});

	// section login
	app.post ( '/login', function ( req, res )
	{
		var post = req.body; // Get POST data
		req.session.user_id = undefined; // Init user_id in session
		var valid = validUser ( post ); // check if user is valid
		if ( valid )
		{
			db.openSync ( "utf8" );
			req.session.user_id = post.username;
			req.session.status = alert.success ( "Successfully authenticated :-)" );
			var user = db.getField ( "users", post.username )
			console.log ( "			 + ",	user.name, "has signed in." );
			if ( user.valid ) // if password not set to be updated
			{
				res.redirect ( "/profile" ); // redirect to profile if valid
			} else {
				req.session.status = alert.info ( "Your password needs to be updated." );
				res.redirect ( "/change_password" ); // else redirect to password change page
			}

		} else {
			req.session.status = alert.danger ( "Couldn't sign you in. Please check credentials." );
			res.redirect ( "/" ); // redirect to home if invalid
		}
	});

	// section logout
	app.get ( '/logout', function ( req, res ) {
		db.openSync ( "utf8" );
		var user = db.getField ( "users", req.session.user_id );
		try { console.log ( "		 - ", ( user.name || null ), "has signed out." ) } catch (e) { }
		req.session.user_id = undefined;
		req.session.status = alert.info ( "Logged out. See you again soon." );
		res.redirect ( "/" );
	});

	// section 404
	app.get('*', function(req, res){
		res.status(404);
		status = req.session.status; req.session.status = undefined;
		db.openSync("utf8");
		res.render( 'error', {
			user_id: req.session.user_id,
			user: db.getField( "users", req.session.user_id ),
			error: "Requested page not found!",
			status: req.session.status
		});
	});
}
