var md5		= require ( "md5" );
var exec	= require ( "child_process" ).exec;
var dir		= "/home/mork/project/public/media/schools"
module.exports = {
	User : function ( name, username, email, password, school, access, teacher, valid, avatar )
	{
		this.id;
		this.name = name || "John Smith";
		this.username = username;
		this.password = password || "password123";
		this.valid = valid || false;
		this.school = school || "SCH1";
		this.email = email || username + "@" + school.toLowerCase().replace(/ /g,"") + ".edu";
		this.access = parseInt ( access ) || 1;
		this.id = md5 (
			this.name.replace ( / /g, "" ) +
			this.email +
			this.password +
			this.school +
			this.access
		);
		this.tasksDone = {};
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
		this.submissions = {};
	}.bind(this),
	School: function ( id, name, shortname, logo )
	{
		this.id = id;
		this.name = name;
		this.shortName = short || name.split(" ").forEach ( function ( part ) { this.shortName += part.substring(0,1).toUpperCase(); } );
		this.logo = "/media/schools/" + this.id + "/logo.png";
	}.bind(this),
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
	user.score = 0;
	var max = 0;
	for ( key in user.tasksDone )
	{
		var task = user.tasksDone[key];
		user.score += task.score; max += task.max;
	}
	if ( length( user.tasksDone ) <1	) { user.score = 0; max = 0; }
	user.grade = grade ( user.score, max );
}

function length (a){b=0;for(c in a){b++};return b;}
