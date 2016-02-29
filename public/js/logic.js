// Google Chrome version 48 removed support for SVGElement.getTransformToElement, reimplementing
SVGElement.prototype.getTransformToElement = SVGElement.prototype.getTransformToElement || function(elem) {
	return elem.getScreenCTM().inverse().multiply(this.getScreenCTM());
};

// Extend joint logic
joint.shapes.logic.InputOn = joint.shapes.logic.IO.extend({
	defaults: joint.util.deepSupplement({
		type: 'logic.InputOn',
		size: {
			width: 30,
			height: 30
		},
		attrs: {
			'.body': {
				fill: '#FEB662',
				stroke: '#CF9452',
				'stroke-width': 2
			},
			'.wire': {
				'ref-dx': 0,
				d: 'M 0 0 L 23 0'
			},
			circle: {
				ref: '.body',
				'ref-dx': 30,
				'ref-y': 0.5,
				magnet: true,
				'class': 'output',
				port: 'out'
			},
			text: {
				text: '1'
			}
		}
	}, joint.shapes.logic.IO.prototype.defaults),
	operation: function() {
		return true;
	}
});

joint.shapes.logic.InputOff = joint.shapes.logic.IO.extend({
	defaults: joint.util.deepSupplement({
		type: 'logic.InputOff',
		size: {
			width: 30,
			height: 30
		},
		attrs: {
			'.body': {
				fill: '#68DDD5',
				stroke: '#44CCC3',
				'stroke-width': 2
			},
			'.wire': {
				'ref-dx': 0,
				d: 'M 0 0 L 23 0'
			},
			circle: {
				ref: '.body',
				'ref-dx': 30,
				'ref-y': 0.5,
				magnet: true,
				'class': 'output',
				port: 'out'
			},
			text: {
				text: '0'
			}
		}
	}, joint.shapes.logic.IO.prototype.defaults),
	operation: function() {
		return false;
	}
});

// calculate the output signal
var divPaper = $('#paper');
var graph = new joint.dia.Graph();

var paper = new joint.dia.Paper({

	el: divPaper,
	model: graph,
	width: divPaper.width(),
	height: divPaper.width(),
	gridSize: 1,
	snapLinks: true,
	linkPinning: false,
	defaultLink: new joint.shapes.logic.Wire,

	validateConnection: function(vs, ms, vt, mt, e, vl) {

		if (e === 'target') {

			// target requires an input port to connect
			if (!mt || !mt.getAttribute('class') || mt.getAttribute('class').indexOf('input') < 0) return false;

			// check whether the port is being already used
			var portUsed = _.find(this.model.getLinks(), function(link) {

				return (link.id !== vl.model.id &&
					link.get('target').id === vt.model.id &&
					link.get('target').port === mt.getAttribute('port'));
			});

			return !portUsed;

		} else { // e === 'source'

			// source requires an output port to connect
			return ms && ms.getAttribute('class') && ms.getAttribute('class').indexOf('output') >= 0;
		}
	}
});

// zoom the viewport by 50%
paper.scale(1.5, 1.5);

function toggleLive(model, signal) {
	// add 'live' class to the element if there is a positive signal
	V(paper.findViewByModel(model).el).toggleClass('live', signal > 0);
}

function broadcastSignal(gate, signal) {
	// broadcast signal to all output ports
	_.defer(_.invoke, graph.getConnectedLinks(gate, {
		outbound: true
	}), 'set', 'signal', signal);
}

function initializeSignal() {

	var signal = Math.random();
	// > 0 wire with a positive signal is alive
	// < 0 wire with a negative signal means, there is no signal 
	// 0 none of the above - reset value

	// cancel all signals stores in wires
	_.invoke(graph.getLinks(), 'set', 'signal', 0);

	// remove all 'live' classes
	$('.live').each(function() {
		V(this).removeClass('live');
	});

	_.each(graph.getElements(), function(element) {
		// broadcast a new signal from every input in the graph
		element.invert = element.invert || false;

		switch (true) {
			case (element instanceof joint.shapes.logic.InputOn && !element.invert) || (element instanceof joint.shapes.logic.InputOff && element.invert):
				broadcastSignal(element, signal);
				break;
			case (element instanceof joint.shapes.logic.InputOff && !element.invert) || (element instanceof joint.shapes.logic.InputOn && element.invert):
				broadcastSignal(element, signal * -1);
				break;
		}
	});

	return signal;
}

// Every logic gate needs to know how to handle a situation, when a signal comes to their ports.
joint.shapes.logic.Gate.prototype.onSignal = function(signal, handler) {
		handler.call(this, signal);
	}
	// The repeater delays a signal handling by 400ms
joint.shapes.logic.Repeater.prototype.onSignal = function(signal, handler) {
		_.delay(handler, 400, signal);
	}
	// Output element just marks itself as alive.
joint.shapes.logic.Output.prototype.onSignal = function(signal) {
	toggleLive(this, signal);
}

joint.shapes.logic.Xor.prototype.onSignal = function(signal, handler) {
    handler.call(this,signal);
}

// diagramm setup
var right = Math.floor(paper.svg.clientWidth / 1.5) - 100;
var count = 0;

function stack() {
	count++;
	return 15 + 50 * (count - 1);
}
var gates = gates || {
	repeater: new joint.shapes.logic.Repeater({
		position: {
			x: right,
			y: stack()
		}
	}),
	or: new joint.shapes.logic.Or({
		position: {
			x: right,
			y: stack()
		}
	}),
	and: new joint.shapes.logic.And({
		position: {
			x: right,
			y: stack()
		}
	}),
	not: new joint.shapes.logic.Not({
		position: {
			x: right,
			y: stack()
		}
	}),
	nand: new joint.shapes.logic.Nand({
		position: {
			x: right,
			y: stack()
		}
	}),
	nor: new joint.shapes.logic.Nor({
		position: {
			x: right,
			y: stack()
		}
	}),
	xor: new joint.shapes.logic.Xor({
		position: {
			x: right,
			y: stack()
		}
	}),
	xnor: new joint.shapes.logic.Xnor({
		position: {
			x: right,
			y: stack()
		}
	}),
	on: new joint.shapes.logic.InputOn({
		position: {
			x: right,
			y: stack()
		}
	}),
	off: new joint.shapes.logic.InputOff({
		position: {
			x: right,
			y: stack()
		}
	}),
	output: new joint.shapes.logic.Output({
		position: {
			x: right,
			y: stack()
		}
	})
};


var wires = wires || [];

// add gates and wires to the graph
graph.addCells(_.toArray(gates));
_.each(wires, function(attributes) {
	graph.addCell(paper.getDefaultLink().set(attributes));
});

graph.on('change:source change:target', function(model, end) {

	var e = 'target' in model.changed ? 'target' : 'source';

	if ((model.previous(e).id && !model.get(e).id) || (!model.previous(e).id && model.get(e).id)) {
		// if source/target has been connected to a port or disconnected from a port reinitialize signals
		current = initializeSignal();
	}
});

graph.on('change:signal', function(wire, signal) {

	toggleLive(wire, signal);

	var magnitude = Math.abs(signal);

	// if a new signal has been generated stop transmitting the old one
	if (magnitude !== current) return;

	var gate = graph.getCell(wire.get('target').id);

	if (gate) {

		gate.onSignal(signal, function() {

			// get an array of signals on all input ports
			var inputs = _.chain(graph.getConnectedLinks(gate, {
					inbound: true
				}))
				.groupBy(function(wire) {
					return wire.get('target').port;
				})
				.map(function(wires) {
					return Math.max.apply(this, _.invoke(wires, 'get', 'signal')) > 0;
				})
				.value();

			// calculate the output signal
			var output = magnitude * (gate.operation.apply(gate, inputs) ? 1 : -1);

			broadcastSignal(gate, output);
		});
	}
});

// initialize signal and keep its value
var current = initializeSignal();

var current = current || undefined;

function addGate(type) {
	graph.addCell(new joint.shapes.logic[type]({
		position: { x: 0,	y: 0 }
	}));
	current = initializeSignal();
}

var files = true;
$("#toggle-files").click(function() {
	$(".files .panel-body").slideToggle(500, "swing", function() {
		files = !files;
		if (files) {
			$("#toggle-files").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
		} else {
			$("#toggle-files").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
		}
	});
});

socket.on("connected", function() {
	if (usr !== null && pwd !== null) {
		socket.emit("login", {
			usr: usr,
			pwd: pwd
		})
	}
});
socket.on('dev_broadcast', function(data) {
	console[data.type](data);
});
socket.on('rel_broadcast', function(data) {
	showAlert(data.type, data.body);
});

socket.on('login_response', function(data) {
	user = data;
	files = data.files;
	showAlert("success", "Successfully logged in! :-)")
});

var uri;
function setUri(u){ uri = u; }
function thumbnail() {
    temp = "";
    svgAsDataUri(document.getElementById("paper").children[0], {scale:0.1}, function(uri){ setUri(uri); });
}

function saveToServer(filename, desc, author) {
	if (user !== undefined && user.username.toString().trim() !== "") {
        svgAsDataUri(document.getElementById("paper").children[0], {scale:0.1}, function(uri){
            findRoutes(false);
		    var saveData = {
		        project: {
		            name: filename,
		            desc: desc,
		            author: author,
		            user_id: usr,
                    user_name: usr,
                    thumbnail: uri,
                    routes: routes
		    	},
		    	graph: graph.toJSON()
		    };
            console.log(saveData);
	        socket.emit("save_data", {
	            user: user,
	            saveData: saveData
	        });
	    	return true;
	    })
    };
	return false;
}

socket.on('save_response', function(data) {
	if (data == true) {
		$('#saveModal').modal('hide');
		showAlert("success", "Diagram saved to account! :-)");
	} else {
		$('#saveModal').modal('hide');
		showAlert("danger", "Error: " + data);
	}
});

function loadFromServer(filename) {
	if (user !== undefined && user.username.toString().trim() !== "") {
		socket.emit('load_data', {
			user: {
				username: usr,
				password: pwd
			},
			target: filename
		});
	}
}

function deleteFromServer(filename) {
	if (user !== undefined && user.username.toString().trim() !== "") {
		socket.emit('delete_data', {
			user: {
				username: usr,
				password: pwd
			},
			target: filename
		});
	}
}

socket.on('load_data', function(data) {
	project = data.project;
	graph.fromJSON(data.graph);
	current = initializeSignal();
	$("#fileDesc").val(project.desc);
	$("#fileAuthor").val(project.author);
	$("#filename").val(project.name);
});

$("#resetButton").click(function() {
	graph.resetCells();
    project = {}; project.author = usr;
    $("#fileDesc").val(project.desc);
    $("#fileAuthor").val(project.author);
    $("#filename").val(project.name);
	refresh();
	current = initializeSignal();
});

$( '#saveModal' ).on( 'shown.bs.modal', function () {
	$( '#fileAuthor' ).val( project.author || "" );
});

paper.on('cell:pointerclick', function(c, e, x, y) {
	var e;
	_.each(graph.getElements(), function(element) {
		if (element.id == c.model.id) {
			element.invert = !element.invert;
			current = initializeSignal();
		}
	})
});

$('#paper').mousedown(function(e) {
	if (e.button == 1) return false
});
$('#paper').bind('contextmenu', function(e) {
	return false;
});

$("#saveButton").click(function() {
	saveToServer($("#filename").val(), $("#fileDesc ").val(), $("#fileAuthor").val());
});
$(".loadButton").click(function() {
	var file = $(this).attr("mork-data");
	loadFromServer(file);
});
$(".deleteButton").click(function() {
	var file = $(this).attr("mork-data");
	deleteFromServer(file);
});
var alert = '<div class="alert alert-$type fade in out" id="$id" role="alert">$msg</div>';

function showAlert(type, msg) {
	var id = Date.now();
	$("#messageArea").append(alert.replace("$type", type).replace("$id", id).replace("$msg", msg));
	setTimeout(function() {
		$("#" + id).alert('close')
	}, 2000);
}

/**********************************************
*********  Assemble circuit notation **********
**********************************************/
// Collect Output nodes
function getOutputs() {
  cells = graph.getCells();
  outputs = {};
  _.each( cells, function ( cell, index ) {
    if ( cell.attributes.type == "logic.Output" ) outputs[cell.attributes.attrs["text"]["text"]] = cell;
  });
}

// Locate node connected to input node's input(s)
function getSource( start ) {
  var end = [];
  _.each( cells, function( cell ){
    if ( cell.attributes.type=="logic.Wire" && cell.attributes.target.id == start.id ) {
      end.push( graph.getCell(cell.attributes.source.id) );
    }
  });
  return end;
}

// Recursively run through circuit and log each input in circuit notation
function search( start ) {
  routes[ routeID ] = routes[ routeID ] || "";
  var sources = [];
  var me = start.id;
  if ( start.attributes.type == "logic.Output" ) routes[ routeID ] += start.attributes.attrs.text.text + " = ";
  if ( start.attributes.type.indexOf ( "input" ) < 0 ) {
    sources = getSource ( start );
  }
  if ( sources == [] ) { console.log( "Error! Output not connected!" ); throw "Error. Disconnected cell" }
  _.each( sources, function ( cell, i ) {
    var name = (cell.attributes.attrs.text) ? cell.attributes.attrs.text.text : cell.attributes.type.replace( /logic\./g, "" ).toLowerCase();
    routes[ routeID ] += name;
    if ( cell.attributes.type.indexOf("put") < 0 ) {
      routes[ routeID ] += "( ";
      search ( cell );
      routes[ routeID ] += " )";
    }
    routes[ routeID ] += ( i < sources.length - 1 ? ", " : "" );
  });
}

// Initialise routes
var routes = [];
var routeID = 0;

// Trigger recursion for each output node
function findRoutes(output){
  output = output == undefined ? true : output;
  routes = [];
  routeID = 0;
  getOutputs();
  _.each( _.toArray(outputs), function ( output ) {
    try { search(output); routeID++; } catch (e) { if ( e.name == "RangeError" ) { showAlert( "danger", "Trace timed out. Is there a loop?" ); routes.splice(routeID,1); } }
  });
  if (output) { ( routes.length > 0 ) && showAlert ( "success", "Routes found:<br>" + routes.join("<br>") ) }
	if (output ) { try{prompt( "",routes.join("\n") )}catch(e){showAlert("warn",e)} }
}
$("body > main > div > div.col-md-9 > div > div.panel-heading").append('<div class="badge" id="output">0</div>');
joint.shapes.logic.Xor.prototype.operation = function(a,b){
      $("#output").text( (b ? "1" : "0") + (a ? "1" : "0") + " == " + parseInt( (b ? "1" : "0") + (a ? "1" : "0") , 2  )  );
        return (!a || !b) && (a || b);

}
