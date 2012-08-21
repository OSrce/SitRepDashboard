// srd_view.js
////////////////////////////////
// BASE CLASS FOR srd views 
//
//
//
//
//
/////////////////////////////////

define([ 
	"dojo/_base/declare",
	"dijit/layout/BorderContainer",
	"dijit/Menu",
	"dijit/PopupMenuItem",
	"dojox/grid/EnhancedGrid",
	"dojox/grid/enhanced/plugins/NestedSorting",
	"dojox/grid/enhanced/plugins/Pagination"
], function(declare ) {
		return declare( [], {
		// Pointer to parent srd_document class
		srd_doc : null,
		// type: this can be one of the following:
		// empty, map, datagrid, admin, view (more to come)
		type : 'empty',
		data : {},
		outsideContainer : null,
		insideContainer : null,
		selected : null,
		containerStyle : null,
		loaded : false,
		dataMenu : null,
//		id : null,
//		linkViewArr : null,
		//CONSTUCTOR
		constructor : function( view_data, parent_srd_doc) {
			console.log("srd_view constructor called!");
			this.srd_doc = parent_srd_doc;
			if(view_data) {
				this.data = view_data;
			}
			if(this.data.noContainers) {
				this.data.id = -1;
			}
			if(this.data.id) {
				this.data.id = this.data.id;
			} else {
				var tmpId = 1;
				while( this.srd_doc.getView(tmpId) ) {
					tmpId++;
				}
				this.data.id = tmpId;
				console.log("No View ID was found, created new id:"+tmpId);
			}
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
//			dojo.publish("view_create_finished","test1");
			if(this.type=='empty') {
				this.onLoad();
			}
		},
		destroy : function() {
			console.log("Destroy View called!");
			this.outsideContainer.destroyRecursive();			
//			this.srd_doc.viewContainer.removeChild(this.outsideContainer);
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
		
		srd_select : function(evt) {
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
					return dojo.date.locale.format( dateObj, {selector:'time', timePattern: 'HH:mm'} );
				} else {
					dateObj = dojo.date.locale.parse(data, { selector:'time', timePattern:'HH:mm:ss'} );
					if(dateObj) {
						return dojo.date.locale.format( dateObj, {selector:'time', timePattern: 'HH:mm'} );
					} else {
						return data;
					}
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
		},
		// END formatToSignal FUNCTION
		// BEGIN linkView FUNCTION
		linkView : function(theId) {
			if( !this.data.linkViewArr ) {
					this.data.linkViewArr = [];
			}	
//			if( !this.data.linkViewArr[theId] ) {
				this.data.linkViewArr[theId] = this.srd_doc.getView(this.data.linkViewIdArr[theId]);
//			}
		},
		// END linkView FUNCTION
		// BEGIN updateViewLinks FUNCTION
		updateViewLinks : function() {
			console.log("updateViewLinks called for "+this.data.id);
			for(var theId in this.data.linkViewIdArr) {
				console.log("linkView "+theId+" , "+this.data.linkViewIdArr[theId]);
				this.linkView(theId);
			}
		},	
		// END updateViewLinks FUNCTION
		// BEGIN getLabel FUNCTION
		getLabel : function() {
			if(this.label) {
				return this.label;
			} else {
				return null;
			}
			return;
		},	
		// END getLabel FUNCTION
		// BEGIN loadingComplete FUNCTION
		loadingComplete : function() {
			return;
		},
		// END loadingComplete FUNCTION
		// BEGIN onLoad event
		onLoad : function(data) {
			console.log("View: "+this.type+" onLoad Event Called!");
			this.loaded = true;
			return;
		}	
		// END onLoad FUNCTION




	});
});
// END srd_view






