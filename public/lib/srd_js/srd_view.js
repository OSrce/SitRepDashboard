// srd_view.js
////////////////////////////////
// BASE CLASS FOR srd views 
//
//
//
//
//
/////////////////////////////////

//srd_view class definition using dojo.declare 
dojo.declare( 
	'srd_view',
	null,
	{
		// Pointer to parent srd_document class
		srd_doc : null,
		// type: this can be one of the following:
		// empty, map, datagrid, admin, view (more to come)
		type : null,
		container : null,
		selected : null,
		containerStyle : null,

		//CONSTUCTOR
		constructor : function( view_data, parent_srd_doc) {
			console.log("srd_view constructor called!");
			this.srd_doc = parent_srd_doc;
			this.xPos = view_data.xPos;
			this.yPos = view_data.yPos;
			this.xDim = view_data.xDim;
			this.yDim = view_data.yDim;
			this.width = 50; //Math.round(100 / this.xDim);
			this.height = Math.round(100 / this.yDim);
			this.containerStyle = 'width:100%; height:'+this.height+'%; background-color:black;';
			this.container = new dijit.layout.BorderContainer({
				style: this.containerStyle
			} );	
			this.srd_doc.viewContainer.addChild(this.container,this.xPos,this.yPos);

		},
		// RESIZE - USED FOR Y DIM SINCE ITS NOT HANDLED AUTOMATICALLY.
		resize : function( view_data) {
			this.xPos = view_data.xPos;
			this.yPos = view_data.yPos;
			this.xDim = view_data.xDim;
			this.yDim = view_data.yDim;
			this.width = 50; //Math.round(100 / this.xDim);
			this.height = Math.round(100 / this.yDim);
			this.containerStyle = 'width:100%; height:'+this.height+'%; background-color:black;';
			this.container.set('style',this.containerStyle);
			console.log('RESIZE CALLED: height: '+this.height);
			this.container.resize();

		}
		
	}
);






