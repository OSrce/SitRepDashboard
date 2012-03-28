// srd_view.js
////////////////////////////////
// BASE CLASS FOR srd views 
//
//
//
//
//
/////////////////////////////////

dojo.require("dojox.grid.EnhancedGrid");
dojo.require("dojox.grid.enhanced.plugins.NestedSorting");

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
		outsideContainer : null,
		insideContainer : null,
		selected : null,
		containerStyle : null,
		dataMenu : null,
		//CONSTUCTOR
		constructor : function( view_data, parent_srd_doc) {
			console.log("srd_view constructor called!");
			this.srd_doc = parent_srd_doc;
			this.data = view_data;
			this.data.height = Math.round(100 / this.data.yDim);
//			this.containerStyle = 'width:100%; height:'+this.height+'%;margin:0px;border:0px;padding:0px; background-color:black;';

			this.outsideContainer = new dijit.layout.BorderContainer({
				"class": "srdViewOutside"
			} );	
			this.srd_doc.viewContainer.addChild(this.outsideContainer,this.data.xPos,this.data.yPos);

			this.insideContainer = new dijit.layout.BorderContainer({
				"class": "srdViewInside",
				"region": "center"
			} );	
			this.outsideContainer.addChild( this.insideContainer );

			dojo.connect(this.insideContainer, 'onClick',this, 'srd_select');
			
			this.dataMenu = new dijit.Menu( {} );
		},
		destroy : function() {
			console.log("Destroy View called!");
			this.srd_doc.viewContainer.removeChild(this.outsideContainer);
			this.outsideContainer.destroyRecursive();			

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
//			this.containerStyle = 'width:100%-10px; height:'+this.data.height+'%-10px; background-color:black;';
//			this.outsideContainer.set('style',this.containerStyle);
			console.log('RESIZE CALLED: height: '+this.data.height);
			this.outsideContainer.resize();
			this.insideContainer.resize();
		},
		
		srd_select : function(event) {
			console.log("Selected view! xPos:"+this.data.xPos+", yPos:"+this.data.yPos);
			if(this.srd_doc.selectedView) {
				this.srd_doc.selectedView.srd_unselect();
			}
			this.srd_doc.selectedView = this;
			this.srd_doc.srd_updateViewMenu();
			this.containerStyle = 'background-color: grey;';
			this.outsideContainer.set('style',this.containerStyle);
			this.srd_doc.srd_dataMenu = this.dataMenu;
		},
		srd_unselect : function() {
			this.containerStyle = 'background-color: black;';
			this.outsideContainer.set('style',this.containerStyle);
		},
		dateToTime : function(data) {
			if(data) { 
				var dateObj = dojo.date.locale.parse(data, { datePattern: 'yyyy-MM-dd', timePattern:'HH:mm:ss'} );
				if(dateObj) {
					var test =dojo.date.locale.format( dateObj, {selector:'time', timePattern: 'HH:mm'} );
					return test;
				} else {
					return data;
				}
			} else { return ''; 
			} 
		},
		// END dateToTime FUNCTION
		// BEG formatSignal FUNCTION
		formatSignal : function(data) {
			if(data) {
				return "10-"+data
			} else {
				return ''; 
			}
		}
	}
);






