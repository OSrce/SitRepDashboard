dojo.require("dojox.layout.GridContainer");

dojo.declare(
	"srd_gridContainer", 
	dojox.layout.GridContainer, 
	{
		hasResizeableRows : true,	
		liveResizeableRows : false,	
		// Minimum row width in percentage
		minRowHeight: 20,
		// Minimum child height in pixels
		minChildHeight: 150
		


} );



