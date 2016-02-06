var md5		= require ( "md5" );
var exec	= require ( "child_process" ).exec;
var dir		= "/home/mork/project/public/media/schools"
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
	User : function ( name, username, password, school, access, teacher, valid, avatar )
	{
		this.id;
		this.name = name || "John Smith";
		// this.email = email || "jsmith@mail.com";
		this.username = username;
		this.password = password || "password123";
		this.valid = valid || false;
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
		this.score = 0;
		this.grade = "U";
		this.teacher = teacher || "rsanchez";
	}.bind(this),
	userScore: Score,
	Task: function ( name, desc, summary, level, value, teacher, school, solution )
	{
		this.name = name || "A Task";
		this.desc = desc || "Description of a task";
		this.summary = summary || "Task summary";
		this.level = level || 1;
		this.value = value || "0";
		this.solution = solution || "none";
		this.teacher = teacher || "all";
		this.school = school;
	}.bind(this),
	School: function ( id, name, shortname, logo )
	{
		this.id = id;
		this.name = name;
		this.shortName = short || name.split(" ").forEach ( function ( part ) { this.shortName += part.substring(0,1).toUpperCase(); } );
		this.logo = "/media/schools/" + this.id + "/logo.png";
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
function Score ( user )
{
	var temp = { score: 0, max: 0  };
	for ( key in this.tasksDone )
	{
		var task = this.tasksDone[key];
		temp.score += task.score; temp.max += task.value;
	}
	if ( tasksDone.length <1	) { temp.score = 0; temp.max = 0; }
	this.grade = grade ( temp.score, temp.max );
	return temp;
}
