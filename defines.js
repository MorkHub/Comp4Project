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
			this.avatar = avatar.replace (/ /g, "%20" ) } else { this.avatar = "/media/schools/" + this.school + "/users/" + this.username + "/avatar.png"
			mkdir ( username, school )
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
    this.teacher = teacher || "rsanchez14";
  }.bind(this),
	RemoveUser : function ( username, school )
	{
		if ( school !== undefined )
		{
			rmdir ( username, school )
		}
	}
}

function grade ( score, total )
{
  var points = ( ( total !== 0 ) ? ( score / total ) : 0 ) * 100;
  var index = Math.ceil ( points / 10 )
  if ( index <= 0 ) index = 0;
  if ( index >= 100 ) index = 0;
  var grades = [
    "U",
    "U",
    "F",
    "G",
    "E",
    "D",
    "C",
    "B",
    "A",
    "A*",
  ];
  return grades [ Math.ceil ( points / 10 ) ];
}
