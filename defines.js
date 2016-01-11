var md5		= require ( "md5" );
var exec	= require ( "child_process" ).exec;
var dir 	= "/home/mork/project/public/media/schools"
function mkdir ( user, school )
{
	if ( school !== undefined )
	{
		exec ( "mkdir " + dir + "/" + school + "/users/" + user + "; cp " + dir + "/default/* " + dir + "/" + school + "/users/" + user + "/", function ( error, stdout, stderr ) { if ( error ) { console.log ( "ERROR: " + error ) } } );
	} else {
		console.log ( "ERROR: Parameters missing ( usage: mkdir ( username, school )" );
	}
}
function rmdir ( user, school )
{
	if ( school !== undefined )
	{
		exec ( "rm " + dir + "/" + school + "/users/" + user + "/* -r; rmdir " + dir + "/" + school + "/users/" + user, function ( error, stdout, stderr ) { if ( error ) { console.log ( "ERROR: " + error ) } } )
	} else {
		console.log ( "ERROR: Parameters missing ( usage: rmdir ( username, school )" );
	}
}

module.exports = {
  User : function ( name, username, password, school, access, teacher, avatar )
  {
    this.id;
    this.name = name || "John Smith";
    // this.email = email || "jsmith@mail.com";
    this.username = username;
    this.password = password || "password123";
    this.school = school || "";
    this.access = parseInt ( access ) || 1;
    if ( avatar )
		{
			this.avatar = avatar.replace (/ /g, "%20" ) } else { this.avatar = "/media/schools/" + this.school + "/users/" + this.username + "/avatar.png";
			mkdir ( username, school );
		};
    this.id = md5 (
      this.name.replace ( / /g, "" ) +
      this.email +
      this.password +
      this.school +
      this.access
    );
    this.tasksDone = [];
    this.score = this.name.length * 6;
    this.grade = grade ( this.score, 100 );
    this.teacher = teacher || "rsanchez";
  }.bind(this),
	RemoveUser : function ( username, school )
	{
		if ( school !== undefined ) 
		{
			rmdir ( username, school )
		}
	},
	grade: grade
}

function grade ( score, max )
{
	score = Math.min ( score, max ); // Prevents score being greater than total
	total = Math.max ( 0, max ); // Prevents Total being less than zero
	var points = Math.min ( Math.max ( 0, score/max ), 100 ) * 100; // Safely calculate percentage
	var index = Math.min ( Math.max ( Math.ceil ( points / 10 ), 0 ), 10 ); // Find bounds in arrow, additionally fixes calc error
	var grades = [
		"U",
		"U",
		"U",
		"U",
		"F",
		"E",
		"D",
		"C",
		"B",
		"A",
		"A*"
	];
	return grades [ index ] || "U"; // Defaults to 'U' if still fails
}
