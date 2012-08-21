define(["dojo/_base/declare", 
					"dojox/layout/GridContainer"
], function(declare,GridContainer) {

	return declare( [ GridContainer], 
	{
		hasResizeableRows : true,	
		liveResizeableRows : false,	
		// Minimum row width in percentage
		minRowHeight: 20,
		// Minimum child height in pixels
		minChildHeight: 150
	} );

} );

