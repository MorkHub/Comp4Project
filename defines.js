var md5 = require ( "md5" );
module.exports = {
  User : function ( name, username, email, password, school, access, avatar, teacher )
  {
    this.id;
    this.name = name || "John Smith";
    this.email = email || "jsmith@mail.com";
    this.username = username || this.email.substring ( 0, this.email.indexOf("@") );
    this.password = password || "password123";
    this.school = school || "";
    this.access = parseInt ( access ) || 1;
    if ( avatar ) { this.avatar = avatar.replace (/ /g, "%20" ) } else { this.avatar = "/media/schools/" + this.school + "/users/" + this.username + "/profile.png" };
    this.id = md5 (
      this.name.replace ( / /g, "" ) +
      this.email +
      this.password +
      this.school +
      this.access +
      this.avatar
    );
    this.tasksDone = [];
    this.score = this.name.length * 6;
    this.grade = grade ( this.score, 100 );
    this.teacher = teacher;
  }.bind(this)
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
