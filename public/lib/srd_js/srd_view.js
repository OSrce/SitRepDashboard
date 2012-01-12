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
		data : null,
		container : null,
		selected : null,
		containerStyle : null,

		//CONSTUCTOR
		constructor : function( view_data, parent_srd_doc) {
			console.log("srd_view constructor called!");
			this.srd_doc = parent_srd_doc;
			this.data = view_data;
//			this.type = view_data.type;
//			this.xPos = view_data.xPos;
//			this.yPos = view_data.yPos;
//			this.xDim = view_data.xDim;
//			this.yDim = view_data.yDim;
//			this.width = 50; //Math.round(100 / this.xDim);
			this.data.height = Math.round(100 / this.data.yDim);
//			this.containerStyle = 'width:100%; height:'+this.height+'%;margin:0px;border:0px;padding:0px; background-color:black;';
			this.containerStyle = 'width:100%; height:'+this.data.height+'%;background-color:black;';
			this.container = new dijit.layout.BorderContainer({
				style: this.containerStyle
			} );	
			this.srd_doc.viewContainer.addChild(this.container,this.data.xPos,this.data.yPos);
			dojo.connect(this.container, 'onClick',this, 'srd_select');
		},
		destroy : function() {
			console.log("Destroy View called!");
			this.srd_doc.viewContainer.removeChild(this.container);
			this.container.destroyRecursive();			

		},
		// RESIZE - USED FOR Y DIM SINCE ITS NOT HANDLED AUTOMATICALLY.
		resize : function( view_data) {
			this.data = view_data;
//			this.xPos = view_data.xPos;
//			this.yPos = view_data.yPos;
//			this.xDim = view_data.xDim;
//			this.yDim = view_data.yDim;
//			this.width = 50; //Math.round(100 / this.xDim);
			this.data.height = Math.round(100 / this.data.yDim);
			this.containerStyle = 'width:100%; height:'+this.data.height+'%; background-color:black;';
			this.container.set('style',this.containerStyle);
			console.log('RESIZE CALLED: height: '+this.data.height);
			this.container.resize();

		},
		
		srd_select : function(event) {
			console.log("Selected view! xPos:"+this.data.xPos+", yPos:"+this.data.yPos);
			if(this.srd_doc.selectedView) {
				this.srd_doc.selectedView.srd_unselect();
			}
			this.srd_doc.selectedView = this;
			this.srd_doc.srd_updateViewMenu();
			this.containerStyle = 'background-color:grey;';
			this.container.set('style',this.containerStyle);
		},
		srd_unselect : function() {
			this.containerStyle = 'background-color:black;';
			this.container.set('style',this.containerStyle);
		}

	}
);






