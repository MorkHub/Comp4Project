function add()
{
	console.log ( "add\n" + JSON.stringify( cellView ) );
	toggleMenuOff();
}
function dup()
{
	var type = cellView.model.attributes.type.split ( "." ) || [ "none", "none" ];
	var pos = cellView.model.attributes.position || { x:0, y:0 };
	var id = Date.now();
	if ( type [0].toLowerCase() == "logic" && type [1] !== "Wire" )
	{
		gates [ id ] = new joint.shapes.logic [ type[1] ] ( { position: pos } );
		graph.addCell ( gates [ id ] );
	}
	toggleMenuOff();
}
function del()
{
	if ( cellView !== undefined )
	{
		switch ( cellView.attributes.type )
		{
			case "logic.Wire":
				graph.getCell(cellView.model.id).remove();
			break;
			default:
				cells = graph.getCells();
			_.each ( cells, function( cell )
			{
				if ( cell.attributes.type == "logic.Wire" )
				{
					if ( cell.attributes.target.id == cellView.model.id || cell.attributes.source.id == cellView.model.id )
					{
						graph.getCell( cell.id  ).remove()
					}
				}
			});
			graph.getCell ( cellView.model.id ).remove();
		}
	}
	toggleMenuOff();
}

function rename()
{
	if ( cellView !== undefined )
	{
		if ( cellView.attributes.type !== "logic.wire" )
		{
			var type = cellView.model.attributes.type;
			if ( type.indexOf ( "put" ) !== -1 )
			{
				var text = ( prompt ( "Enter name to assign to the node", cellView.model.attr("text").text ) || cellView.model.attr("text").text ).toLowerCase();
				cellView.model.attr("text",{text:text});
				toggleMenuOff();
			}
		}
	}
}

var menu = document.querySelector(".context-menu");
var menuState = 0;
var active = "context-menu--active";

var cellView;

function toggleMenuOn ( c, t ) {
	if ( menuState !== 1 )
	{
		cellView = c;
		menuState = 1;
		menu.classList.add(active);
		switch (t)
		{
			case "logic.Wire":
				$("#context-menu__delete").addClass("active");
			break;

			default:
				$("#context-menu__duplicate").addClass("active");
				$("#context-menu__delete").addClass("active");
				( t.indexOf("put") !== -1 ) ? $("#context-menu__rename").addClass("active") : true;
		}
	} else { toggleMenuOff(); toggleMenuOn ( c, t ); }
}
function toggleMenuOff () {
	if ( menuState !== 0 ) {
		cellView = undefined;
		menuState = 0;
		menu.classList.remove(active);
		$("#context-menu__add").removeClass("active");
		$("#context-menu__duplicate").removeClass("active");
		$("#context-menu__delete").removeClass("active");
	}
}

paper.on('cell:pointerdown', function( cellView, evt, x, y )
{
	switch ( evt.button )
	{
		case 0:
			if ( cellView.model.attributes.type.substring( "logic.Input" ) !== -1 )
			{
				var id = cellView.model.id;
			}
			toggleMenuOff();
		break;
		case 1:
			var type = cellView.model.attributes.type.split ( "." ) || [ "none", "none" ];
			var pos = cellView.model.attributes.position || { x:0, y:0 };
			var id = Date.now();
			if ( type [0].toLowerCase() == "logic" && type [1] !== "Wire" )
			{
				gates [ id ] = new joint.shapes.logic [ type[1] ] ( { position: pos } );
				graph.addCell ( gates [ id ] );
			}
			toggleMenuOff();
		break;
		case 2:
			var type = cellView.model.attributes.type || "none";
			toggleMenuOn(cellView, type);
			menu.style.left = $(".row").position().left + x*1.5 + "px";
			menu.style.top = $(".row").position().top + ( $("#messageArea").height() + parseInt($("#messageArea").css("margin-bottom") ) || 0 ) + ( $(".files").height() + parseInt($(".files").css("margin-bottom") ) || 0 ) + 60 + y*1.5 + "px";
			( $( ".files" ).position() !== undefined ) ? menu.style.top += $( ".sandbox" ).position().top : 0
		break;
	}
});
paper.on( "blank:pointerdown", function ( evt, x, y)
{
	toggleMenuOff();
});
document.addEventListener( "contextmenu", function(e) { if ( menuState == 1 ) { e.preventDefault() } } )
