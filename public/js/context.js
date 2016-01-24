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

var menu = document.querySelector(".context-menu");
var menuState = 0;
var active = "context-menu--active";
var offsetPos = { x: 0, y: 0 };

var offsetPos = { x:0, y:0  };
/*var el = $( "#paper"  );
while ( !el.is("html") ) {
		console.log(el);
		el = el.parent();
		a = el.position();
		offsetPos.x += a.left;
		offsetPos.y += a.top;
}*/

var menuPosition;
var menuPositionX;
var menuPositionY;
var cellView;

function toggleMenuOn ( c, t ) {
	if ( menuState !== 1 )
	{
		cellView = c;
		menuState = 1;
		menu.classList.add(active);
		switch (t)
		{
			case "paper":
				$("#context-menu__add").addClass("active");
			break;

			case "logic.Wire":
				$("#context-menu__delete").addClass("active");
			break;

			default:
				$("#context-menu__duplicate").addClass("active");
				$("#context-menu__delete").addClass("active");
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

				_.each( graph.getCells(), function ( cell )
				{
					if ( true ) {}
				});
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

			menuPosition = { x: $(cellView.el).position().left, y: $(cellView.el).position().top };
			menuPositionX = menuPosition.x + "px";
			menuPositionY = menuPosition.y + "px";
			menu.style.left = menuPositionX;
			menu.style.top = menuPositionY;
		break;
	}
});

paper.on( "blank:pointerdown", function ( evt, x, y)
{
	if ( evt.button == 2 )
	{
		toggleMenuOn(cellView, "paper");

		menuPosition = { x: x, y: y };
		menuPositionX = offsetPos.x + menuPosition.x + "px";
		menuPositionY = offsetPos.y + menuPosition.y + "px";
		menu.style.left = menuPositionX;
		menu.style.top = menuPositionY;
	} else {
		toggleMenuOff();
	}
});