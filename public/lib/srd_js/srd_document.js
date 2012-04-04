
if(dojo.isIE) {
	dojo.require("dojox.form.uploader.plugins.IFrame");
} else if(dojo.isKhtml) {
	dojo.require("dojox.form.uploader.plugins.HTML5");
} else {
	dojo.require("dojox.form.uploader.plugins.Flash");
}

dojo.require("dojox.layout.GridContainer");

dojo.require("dojox.data.QueryReadStore");
dojo.require("dojox.data.JsonRestStore");
dojo.require("dojo.store.DataStore");
dojo.require("dojo.store.JsonRest");
dojo.require("dojo.store.Cache");

dojo.provide("ComboBoxReadStore");
dojo.declare(
	"ComboBoxReadStore",
	dojox.data.QueryReadStore,
	{
		fetch:function(request) {
			request.serverQuery = {q:request.query.name};
			return this.inherited("fetch", arguments);
		}
	}
);


//srd_document CLASS 
function srd_document() {
	//THE UI VARS
	this.srd_container = null;
	this.srd_menuBar = null;
	this.srd_saveMenu = null;

//	this.srd_mapContent = null;
//	this.srd_adminContent = null;
//	this.srd_dataContent = null;

	this.srd_layerEditMenu = null;
	this.srd_layerEditMenuDropDown = null;
	
	this.fileSelDialog = null; 
	this.srd_uploader = null;
	this.oFSubmit = null;
	this.srd_fileList = null;
	this.openFileForm = null;

	//THE OpenLayers VARS
//	this.map = null;
	this.editTools = null;
	this.selectControl = null;
	this.drawControls = null;
	this.srd_panel = null;
	this.theSelectedControl = null;

	this.srd_toolbar = null;
	
	this.selected_wlayout= null;
	this.srd_wlayoutArr = [];
	this.srd_styleArr = [];
	this.srd_layerArr = [];

	this.srd_selLayer = null;
	this.srd_selControl = null;

	// LAYER EDIT CONTROLS
	this.srd_drawControls = {
		point: null,
		line: null,
		polygon: null,
		remove: null,
		select: null
	};


// SETTINGS WE SHOULD GET FROM localStore or srd_settings.xml
	this.srd_localStore = null;
	this.srd_xmlStore = null;
		
	this.srd_doc_id = null;
	this.staticVals = { 
			docCount: null,
			single_user: null,
			runFromServer: null,
//			default_projection: null,
//			start_lat: null,
//			start_lon: null,
//			start_zoom: null,

			view_layout_x: null,
			view_layout_y: null,
			view_data: null,
			
			default_wlayout:null,

			layerCount: null
	};

	// srd_document should have a list of sub-objects - srd_view
	// maps, datagrids (spreadsheets), admin, empty, video, etc all should be 
	// sub-classes of srd_view. srd_view's described in staticVals.view_data.
	this.viewContainer = null; 
	this.viewArr = null; 
	this.selectedView = null; 

	this.viewType =  {
		empty 		: 'srd_view',
		map 			: 'srd_view_map',
		datagrid 	: 'srd_view_datagrid',
		admin			:	'srd_view_admin',
		opstrack	:	'srd_view_opstrack',
		cfssingle	:	'srd_view_cfssingle',
		video			:	'srd_view_video'
	}

	this.viewDefaults = {
		empty : {
			type : 'empty'
		},
		map 	: {
			type : 'map',
			start_lat : 40.713,
			start_lon : -73.996,
			start_zoom : 12
		}
	}

}
// END srd_document CLASS DEF

// SRD_DOCUMENT CONSTRUCTOR
srd_document.prototype.srd_init = function() {
// srd_init : called by SitRepDashboard when we are ready to 
// load initial values and the first 'screen' we will see :
// map, admin, or data.

	if(this.staticVals.runFromServer == null ) {
		// LOCAL STORAGE LOADING
		// LOAD THE VALUES AND CHECK TO SEE THAT WE HAVE EVERYTHING
		// WE NEED.  OTHERWISE, LOAD DEFAULTS FROM XML FILE.
		this.srd_localStore = new dojox.storage.LocalStorageProvider({});
		if( this.srd_localStore.isAvailable() ) {
			this.srd_localStore.initialize();
			if(this.srd_localStore.initialized == false ) {
				console.log("Store is not initialed yet");
				dojo.event.connect(dojox.storage.manager,
 	                    "loaded", this.srd_localStore,
 	                    this.storeIsInitialized);
			} else {
				console.log("Store Is Inited");
				this.loadFromLocalStore();
			}
		}
	} else if(this.staticVals.runFromServer == true) {
//		console.log("this.staticVals.start_lat == "+this.staticVals.start_lat); 
		this.staticVals.docCount = 1;
	}

	/// TESTING UGLY JUST TO MAKE SURE selLayer isn't NULL.	
	for(var key in this.srd_layerArr) {
		this.srd_selLayer = this.srd_layerArr[key];
	}

	// TESTING - TODO: CLEAN UP - STYLES AND LAYERS (Settings) SHOULD be stores!
	var tmpStore = new dojo.store.Memory({data: theLayers, idProperty: "id"}); 
	tmpStore.query().forEach(function(layerOptions) {
		this.srd_layerArr[layerOptions.id] = new srd_layer();
		this.srd_layerArr[layerOptions.id].options = layerOptions;
		this.srd_layerArr[layerOptions.id].srd_styleArr = this.srd_styleArr;
	}.bind(this) );

	this.srd_layerStore = new dojo.store.Cache(
		dojo.store.JsonRest({
			target: "/srdata/layers/"
		} ),
		tmpStore
	);




//	this.srd_container.startup();

	dojo.addOnLoad(function() {
		if(this.srd_container == null) {
			var srd_jsDisabled = dojo.byId("srd_jsDisabled");
			dojo.style(srd_jsDisabled, "display", "none");
			this.srd_container = new dijit.layout.BorderContainer( { 
					gutters: false,
					splitter: "false",
					design: "headline"
				 }, 'theSrdDoc' );
			this.srd_container.startup();
		}
	}.bind(this) );

	dojo.addOnLoad(function() {

	this.srd_displayMenuBar();


	// ASSUME view_layer_x/y have been set and that settings are populated
	// parse and init different views
	this.centerPane = new dijit.layout.ContentPane( { 
		region: 'center',
		id: 'srd_centerPane'
	} );
	this.srd_container.addChild(this.centerPane);

	this.srd_changeWindowLayout(this.staticVals.default_wlayout);


	}.bind(this) );

//	this.srd_displayMenuBar();

}
// END SRD_DOCUMENT CONSTRUCTOR

// BEGIN: LOAD FROM LOCAL STORE
srd_document.prototype.loadFromLocalStore = function() {
	//BEGIN CLEAR STORE LINE - DEBUG ONLY
	this.srd_localStore.clear("srd");	
	//END CLEAR STORE LINE - DEBUG ONLY
	var tmpStaticVals = this.srd_localStore.get("staticVals","srd"); 
	for(var tmpVal in tmpStaticVals) {
		this.setValue(tmpVal,tmpStaticVals[tmpVal] );
//		console.log("Loading Values: "+tmpVal+", "+tmpStaticVals[tmpVal]);
	}
	for(var i=1;i<this.staticVals.layerCount; i++) {
		this.srd_layerArr[i] = new srd_layer();
		this.srd_layerArr[i].copyValuesFromLayer( this.srd_localStore.get(i,"srdLayer") );
//		console.log("Loading Layer Settings from LocalStorage:"+this.srd_layerArr[i].name);
	}
	return 0;
}

// END: LOAD FROM LOCAL STORE



srd_document.prototype.storePutHandler = function() {
//	console.log("LocalStorage Put called!");
}


srd_document.prototype.loadDefaults = function() {
	if( this.srd_xmlStore == null ) {
		// READ the srd_settings.xml file and load it into a dojo.data object.
		this.srd_xmlStore = new dojox.data.XmlStore({ 
			url: 'srd_settings.xml',
			label: 'tag_name' 
		});
	} 
	//Fetch all global settings (except layer stuff).
	this.srd_xmlStore.fetch({
		onComplete: function(items,request) { 
			this.defaultSettingsLoaded(items,request);

		}.bind(this),
		onError: function(errScope) {
			this.errorOnLoad(errScope);
		}.bind(this)
	});
}


srd_document.prototype.setValue = function(varName, varValue) {
	switch(String(varName) ) {
		case "single_user" :
		case "runFromServer" :
			if(String(varValue).toUpperCase() == "TRUE") {
				this.staticVals[varName] = Boolean(true);
			} else {
				this.staticVals[varName] = Boolean(false);
			}
			break;
		case "docCount" :
		case "layerCount" :
		case "start_lat" :
		case "start_lon" :
		case "start_zoom" :
			this.staticVals[varName] = Number(varValue);
			break;
		default :
			this.staticVals[varName] = String(varValue);
	}
	return 0;
}


srd_document.prototype.errorOnLoad = function(errorMessage) {
	alert("Error Loading srd_setttings.xml : "+errorMessage);
	
}

srd_document.prototype.defaultSettingsLoaded = function(items,request) {
	this.srd_items = items;
	for(var i=0;i<this.srd_items.length;i++) {
//		var itemName = this.srd_xmlStore.getIdentity( this.srd_items[i] ); 
//		var itemValue = this.srd_xmlStore.getAttributes( this.srd_items[i] ); 
		var itemName = this.srd_xmlStore.getValue( this.srd_items[i], "tagName" ); 
		var itemValue = this.srd_xmlStore.getValue( this.srd_items[i], "text()" ); 
		if( itemName == "layers") {
//			console.log("Layers from="+itemName+"==="+itemValue);
			var item = this.srd_items[i];
//			var theLayerItems = this.srd_xmlStore.getValues(itemValue,"tagName");
//			console.log("theLayerItems.length=",theLayerItems.length);
//			var theItemAtts = this.srd_xmlStore.getAttributes(item);
//			for(var j = 0; j < theItemAtts.length; j++){
//				var values = this.srd_xmlStore.getValues(item, theItemAtts[j]);

			// THE LINE BELOW GETS AN ARRAY OF ALL LAYERS FROM XML.
			var theLayerItemArr = this.srd_xmlStore.getValues(item, "layer");
			// FOR EACH <layer> in <layers>
			for(var j = 0; j < theLayerItemArr.length; j++){
				var theLayerItem = theLayerItemArr[j];
				if(this.srd_xmlStore.isItem(theLayerItem)){
//					console.log("Located a child item with name: [" + this.srd_xmlStore.getValue(theLayerItem,"tagName") + "]");
					var tmpLayerAtts = this.srd_xmlStore.getAttributes(theLayerItem);
					var tmpSrdLayer = new srd_layer();
//			 	CODE TO iterate through the layer variables and assign the values.
					// FOR EACH <layer attribute> in <layer>
					for(var k=0;k < tmpLayerAtts.length;k++) {
						if( tmpLayerAtts[k] in tmpSrdLayer.options) {
//							console.log(":::: Atts="+tmpLayerAtts[k]+":::"+this.srd_xmlStore.getValues(theLayerItem,tmpLayerAtts[k])+":::");
								tmpSrdLayer.setValue( [tmpLayerAtts[k]],  this.srd_xmlStore.getValue(theLayerItem,tmpLayerAtts[k] ) );
							//TIME TO IMPORT StyleMap data into srd_layer
						} else if (tmpLayerAtts[k] == "StyleMap") {
//							console.log("STYLEMAP="+tmpLayerAtts[k]+":::"+this.srd_xmlStore.getValues(theLayerItem,tmpLayerAtts[k])+":::");
							var theStyleMap = this.srd_xmlStore.getValue(theLayerItem,"StyleMap");
							var theStyleArr = this.srd_xmlStore.getValues(theStyleMap,"Style");
							// FOR EACH <Style> in <StyleMap>
							for(var l=0; l < theStyleArr.length; l++) {
								var theStyleItem = theStyleArr[l];
//								console.log("StyleItem======="+theStyleItem[l]);
								if(this.srd_xmlStore.isItem(theStyleItem) ) {
									var theStyleAtts = this.srd_xmlStore.getAttributes(theStyleItem);
//									console.log("StyleAtts======="+theStyleAtts);
									var styleName = this.srd_xmlStore.getValues(theStyleItem,"name");
									tmpSrdLayer.createStyle(styleName);
									for(var m=0; m < theStyleAtts.length; m++) {
										tmpSrdLayer.setStyleProperty(styleName,theStyleAtts[m],this.srd_xmlStore.getValue(theStyleItem,theStyleAtts[m]) );
									}
								}
							}
						}										
					}
					this.srd_layerArr[tmpSrdLayer.options.id] = tmpSrdLayer;
					this.srd_localStore.put(tmpSrdLayer.options.id,tmpSrdLayer,this.storePutHandler,"srdLayer");
					tmpSrdLayer = null;
				}
			}	
		} else {
//			alert("Layer="+i+", itemName="+itemName+", itemValue="+itemValue+"===");
			//THIS NIFTY LINE STORES THE VALUES FROM THE XML TO THE srd_document variables.
			this.setValue(itemName, itemValue);

		}
	}

		this.staticVals.layerCount = this.srd_layerArr.length;
	
		// TODO : immplement docCount so that srd can keep track of all
		// windows/pages that are open so that you can view multiple maps/data/prefs pages
		// with uniform presentation.
		if( this.staticVals.docCount == null) {
			this.staticVals.docCount = 1;
		} else {
			this.staticVals.docCount++;
		}		
		console.log("Putting staticVals in localstore!");
		this.srd_localStore.put("staticVals", this.staticVals,this.storePutHandler,"srd");

//		this.map_init();
}

srd_document.prototype.srd_createWhiteboard = function() {
	var theDate = new Date();
	var theFrmt = "yyyyMMdd_HHmm";
	var name = "WhiteBoard_"+dojo.date.locale.format(theDate,  {
            selector: "date",
            datePattern: theFrmt
        });
	var url ="/srdata/features/";
	this.srd_createLayer(name,url);
}
	
srd_document.prototype.srd_createLayer = function(theName,theUrl) {
//	var tmpLayer = new srd_layer();
	var tmpOptions = {};
	tmpOptions.name = theName;
	if(theUrl != "") {
		tmpOptions.url = theUrl;
	}
	tmpOptions.type = "Vector";
					tmpOptions.format = "SRJSON";

				//	TODO : FIX THESE!!!
				//	tmpOptions.projection = this.staticVals.default_projection;
				//		tmpOptions.isBaseLayer = false;
						tmpOptions.visibility = true;
						dojo.when( this.srd_layerStore.add(tmpOptions), function( returnId ) {
						console.log("Create Layer Called and New Layeroptions object returned! ID:"+returnId);
						this.id = returnId;
						this.isBaseLayer = false;
						this.layer_update = true;
						this.layer_delete = true;
						this.feature_create = true;
						this.feature_update = true;
						this.feature_delete = true;
						console.log("New Layer Object Returned! Name="+this.name);

						srd.srd_layerArr[this.id] = new srd_layer();
						srd.srd_layerArr[this.id].options = this;
						srd.staticVals.layerCount++;

						srd.srd_layerArr[this.id].loadData();
						srd.srd_layerArr[this.id].addLayerToMap(srd.selectedView.map);

				//	this.srd_selLayer = tmpLayer;
						srd.srd_saveMenu.addChild(new dijit.MenuItem( { 
								label: this.name,
								onClick: function() { srd.saveLayer(returnId) }.bind(srd)
						} ) );
						if(srd.srd_layerEditMenu != null) {
							srd.srd_layerEditMenu.addChild(new dijit.MenuItem( { 
									label: this.name,
									onClick: function() { srd.srd_selectEditLayer( returnId );  }.bind(srd)
							} ) );
						}
					}.bind(tmpOptions)  );

				}

				srd_document.prototype.srd_displayMenuBar = function() {
					dojo.addOnLoad(function() {
						if(this.srd_menuBar == null) {
							this.srd_menuBar = new dijit.MenuBar( { 
								splitter: false,
								'region': 'top',
								style: "margin:0px;padding:0px;"
							} );	
							//// ICON in LEFT CORNER ////
							this.srd_menuBar.addChild(new dijit.MenuBarItem( {
								label: '<img src="lib/img/SR_Icon.png" height="20" width="16">' } ) );
							//// SitRep MENU /////	
							var srd_sitrepMenu = new dijit.Menu({});
							this.srd_menuBar.addChild(new dijit.MenuBarItem({
								label: "SitRep" 
							} ) );

							//// File Menu ////
							var srd_fileMenu = new dijit.Menu({});
							this.srd_menuBar.addChild(new dijit.PopupMenuBarItem({
								label: "File",
								popup: srd_fileMenu
							}) );
							srd_fileMenu.addChild(new dijit.MenuItem({
								label: "New Whiteboard Layer",
								onClick: function() { this.srd_createWhiteboard()  }.bind(this)
							}));
							srd_fileMenu.addChild(new dijit.MenuItem({
								label: "Open",
								onClick: function() { this.openFile() }.bind(this)
							}));
							srd_fileMenu.addChild(new dijit.MenuItem({
								label: "Save Project",
								onClick: function() { alert("Future Function - Save Project") }.bind(this)
							}));
							this.srd_saveMenu = new dijit.Menu( );
				//			this.srd_saveMenu.addChild(new dijit.MenuItem( { 
				//				label: "List of Editable Layers",
				//				disabled: true
				//			} ) );
							for( tmpId in this.srd_layerArr) {
								if(this.srd_layerArr[tmpId].type == "Vector" && this.srd_layerArr[tmpId].feature_update == true) {
									this.srd_saveMenu.addChild(new dijit.MenuItem( { 
										label: this.srd_layerArr[tmpId].name,
										onClick: function() { this.saveLayer(tmpId) }.bind(this)
									} ) );
								}
							}	
							srd_fileMenu.addChild(new dijit.PopupMenuItem({
								label: "Save Layer",
								popup:this.srd_saveMenu
							}));
				//			srd_fileMenu.startup();

							//// Edit Menu ////
							var srd_editMenu = new dijit.Menu({});
							this.srd_menuBar.addChild(new dijit.PopupMenuBarItem({
								label: "Edit",
								popup: srd_editMenu
							}) );
							srd_editMenu.addChild(new dijit.MenuItem({
								label: "TEST1",
								onClick: function() { alert("Place TEST Here") }.bind(this)
				//				onClick: function() { this.srd_layerArr[13].uploadLayer(); }.bind(this)
							}));
							//// View Menu ////
							this.srd_viewMenu = new dijit.Menu({});
							this.srd_menuBar.addChild(new dijit.PopupMenuBarItem({
								label: "View",
								popup: this.srd_viewMenu
							}) );
							var theLabel = "Selected View : ";
							if(this.selectedView) {
								theLabel = theLabel+this.selectedView.data.type+" "+this.selectedView.data.xPos+","+this.selectedView.data.yPos;
							}
							this.srd_viewMenuSelected = new dijit.MenuItem({
								label: theLabel
							})
							this.srd_viewMenu.addChild(this.srd_viewMenuSelected);
							// VIEW TYPE MENU DROP DOWN
							this.srd_viewTypeMenu = new dijit.Menu();
							for(var theType in this.viewType) {
								this.srd_viewTypeMenu.addChild( new dijit.MenuItem( {
									label: theType,
									value: theType,
									srd_doc: this,
									onClick: function() { this.srd_doc.srd_changeViewType(this.value) }
								} ) );
							}
							this.srd_viewMenu.addChild(new dijit.PopupMenuItem({
								label: "Change Type: ",
								popup:this.srd_viewTypeMenu
							}));
							// ROW SIZE MENU DROP DOWN
							this.srd_windowRowMenu = new dijit.Menu();
							for(var y=1;y<5;y++) {
								this.srd_windowRowMenu.addChild( new dijit.MenuItem( {
									label: y,
									value: y,
									srd_doc: this,
									onClick: function() { this.srd_doc.srd_changeViewGridDimensions('y',this.value) }
								} ) );
							}
							this.srd_viewMenu.addChild(new dijit.PopupMenuItem({
								label: "View Rows: "+this.staticVals.view_layout_y,
								popup:this.srd_windowRowMenu	
							}));
							// COLUMN SIZE MENU DROP DOWN
							this.srd_windowColMenu = new dijit.Menu();
							for(var x=1;x<5;x++) {
								this.srd_windowColMenu.addChild( new dijit.MenuItem( {
									label: x,
									value: x,
									srd_doc: this,
									onClick: function() { this.srd_doc.srd_changeViewGridDimensions('x',this.value) }
								} ) );
							}
							this.srd_viewMenu.addChild(new dijit.PopupMenuItem({
								label: "View Columns: "+this.staticVals.view_layout_x,
								popup:this.srd_windowColMenu	
							}));
							///// END View Menu ////	

							//// Data Menu ////
							this.srd_dataMenuPopup = new dijit.PopupMenuBarItem({
								label: "Data",
								popup: this.selectedView.dataMenu
							} );
							this.srd_menuBar.addChild(this.srd_dataMenuPopup);
							/// END Data Menu
							this.srd_dataMenu = this.srd_viewMenu;	

							//// Tools Menu ////
							var srd_toolsMenu = new dijit.Menu({});
							this.srd_menuBar.addChild(new dijit.PopupMenuBarItem({
								label: "Tools",
								popup: srd_toolsMenu
							}) );
							// Toggle for Edit Toolbar
							srd_toolsMenu.addChild(
								new dijit.CheckedMenuItem({
									label: "Edit Toolbar",
									srd_doc: this,
									onClick: function() { this.srd_doc.srd_toggleEditPanel(this); }
								}) 
							);
							// Toggle for Location Tracking
							srd_toolsMenu.addChild(
								new dijit.CheckedMenuItem({
									label: "Display Location",
									srd_doc: this,
									onClick: function() { this.srd_doc.srd_toggleLocationTracking(this); }
								}) 
							);
					
				/*
							// BEGIN UPLOAD LAYER MENU
							this.srd_uploadMenu = new dijit.Menu( );
							for( tmpId in this.srd_layerArr) {
									this.srd_uploadMenu.addChild(new dijit.MenuItem( { 
										label: this.srd_layerArr[tmpId].name,
										onClick: function() { this.srd_layerArr[tmpId].uploadLayer() }.bind(this)
									} ) );
							}	
							srd_toolsMenu.addChild(new dijit.PopupMenuItem({
								label: "Upload Layer to Server",
								popup:this.srd_uploadMenu
							}));
							// END UPLOAD LAYER MENU
				*/

							//// Window Menu ////
							this.srd_windowMenu = new dijit.Menu({});
							this.srd_menuBar.addChild(new dijit.PopupMenuBarItem({
								label: "Window",
								popup: this.srd_windowMenu
							}) );
							// LIST EACH WINDOW LAYOUT IN THE WINDOW MENU
							for( tmpId in this.srd_wlayoutArr) {
								this.srd_windowMenu.addChild( new dijit.MenuItem( {
									label: this.srd_wlayoutArr[tmpId].name,
									value: tmpId,
									srd_doc: this,
									onClick: function() { this.srd_doc.srd_changeWindowLayout(this.value) }
								} ) );
							}


				/*			var theSchema = {
								"type" : "object",
								"properties" : {
									"items" :
									"rating" : { "type": "number"},
									"addy" : { "type": "string"},
									"lat" : { "type": "number"},
									"lon" : { "type": "number"},
								}
							}
				*/

				//			this.srsearch_store = new dojox.data.JsonRestStore ( {
				//				schema : theSchema,
				//				target: "/srsearch/index",
				//				syncMode:true

							this.srsearch_store = new dojox.data.QueryReadStore( {
				// 			this.srsearch_store = new ComboBoxReadStore( {
								url: "/srsearch/index"
							} );

							// LIVE SEARCH IN MENUBAR
							this.srsearch_box = new dijit.form.ComboBox( {
								id: "srsearch",
								placeHolder: "Search for something",
								store: this.srsearch_store,
								searchAttr: "addy",
								srd_doc: this,
								autoComplete: false,
				//				selectOnClick: true,
								searchDelay: 1000,
								queryExpr: "${0}",
								onChange: function() {
				//						this.value = this.displayedValue;
										console.log("Search Text Clicked:"+this.store.getValue(this.item, "lat") );
										var lat = this.store.getValue(this.item, "lat");	
										var lon = this.store.getValue(this.item, "lon");	
										if(this.srd_doc.selectedView == null) {
											this.srd_doc.selectedView = this.viewArr[0][0];
										}
										this.srd_doc.selectedView.goToPoint(lat,lon);
								}
							} );
							this.srd_menuBar.addChild(this.srsearch_box);
							this.srsearch_box.startup();
							//END SEARCH BAR
							
							//BEGIN USERNAME / Logout Options
							this.srd_userMenu = new dijit.Menu({});
							this.srd_menuBar.addChild(new dijit.PopupMenuBarItem({
								label: "Log Out", //this.staticVals.user_title+" "+this.staticVals.user_lastname,
								popup: this.srd_userMenu
							}) );
							this.srd_userMenu.addChild( new dijit.MenuItem( {
								label: "Log Out: "+this.staticVals.user_lastname,
								srd_doc: this,
								onClick: function() { this.srd_doc.logout() }
							} ) );

							//END PLACING MENU ITEMS, LETS FIRE UP THE MENUBAR!				
							this.srd_menuBar.startup();

						}
						
				/*		// GET RID OF ALL WIDGETS ON SCREEN
						var widgetArr = this.srd_container.getChildren();
						for(var i=0;i<widgetArr.length;i++) {
							this.srd_container.removeChild(widgetArr[i]);
						}
				*/
						this.srd_container.addChild(this.srd_menuBar);
					}.bind(this) );
					return;
				}

				srd_document.prototype.srd_toggleLocationTracking = function(menuItem) {
					dojo.addOnLoad( function() {
						if(menuItem.checked == true) {
							console.log("Enabling Location Tracking");
						// ELSE menuItem is NOT CHECKED :
						} else {
							console.log("Disabling Location Tracking");
							

						}
						if(this.selectedView == null) {
							this.selectedView = this.viewArr[0][0];
						}
						this.selectedView.toggleLocationTracking(menuItem.checked);
					return;
					}.bind(this) );
				}



				srd_document.prototype.srd_toggleEditPanel = function(menuItem) {
					dojo.addOnLoad( function() {
						if(menuItem.checked == true) {
							if(this.srd_toolbar == null) {
								this.srd_toolbar = new dijit.layout.BorderContainer({ 
				//					style: "background-color:gray;width:150px;border:3px",
									style: "width:150px;overflow:auto;",
									region: 'right',
									splitter: 'true' 
								}  );		
								this.srd_container.addChild(this.srd_toolbar);
								this.srd_container.resize();

				/*
								var cp_tool_panel = new dijit.layout.ContentPane({
									region: 'bottom',
									style: "height:100px",
									content:"<div id='srd_tool_panel' class='olControlPanel' ></div>" } );

								this.srd_toolbar.addChild(cp_tool_panel);

							this.srd_panel = new OpenLayers.Control.Panel( { div: dojo.byId('srd_tool_panel')  } );
							this.map.addControl(this.srd_panel);
				*/
							this.srd_toolbar.resize();


							// BEGIN LAYER SELECT
							var editPaletteTop = new dijit.layout.BorderContainer( {
				//				style:"height:100px;background-color:yellow",
								style:"height:60px;",
								region: 'top',
								splitter: false
							} );
							

							var activeLayerName = new dijit.layout.ContentPane({
								content:"Editing Palette<br>Layer: ",
								region: 'top',
								style:'margin:0px;padding:0px;border:0px;'
				//				style:'height:30px;
							});
							editPaletteTop.addChild(activeLayerName);
							this.srd_layerEditMenu = new dijit.Menu({ });
							for( tmpId in this.srd_layerArr) {
								if(this.srd_layerArr[tmpId].options.isBaseLayer == false) {
										this.srd_layerEditMenu.addChild(new dijit.MenuItem( { 
										label: this.srd_layerArr[tmpId].options.name,
										srd_doc: this,
										tmpId: tmpId,
										onClick: function() { this.srd_doc.srd_selectEditLayer( this.tmpId );  }
									} ) );
									// CHECK TO SEE IF selected Layer is null, if so,
									// make the selLayer the last editable layer in the arr
									if(this.srd_selLayer == null) {
										this.srd_selLayer = this.srd_layerArr[tmpId];
					
									}
								}
							}
								
							// AT THIS POINT, if there is it least 1 editable layer, selLayer will NOT
							// be null so if it is it means we don't have ANY editable layers to
							// choose from.
							if(this.srd_selLayer == null ) {
								// TODO :
								// MAKE IT SO THAT ALL EDIT CONTROLS ARENT SELECTABLE.
							}

					
							this.srd_layerEditMenuDropDown = new dijit.form.DropDownButton({
								label: this.srd_selLayer.options.name,
								dropDown: this.srd_layerEditMenu,
				//				style: "width:inherit;position:relative",
								id: "srd_activeLayer",
								region:'top'

							});
							editPaletteTop.addChild(this.srd_layerEditMenuDropDown);
							editPaletteTop.startup();
							this.srd_toolbar.addChild(editPaletteTop);
							// END LAYER SELECT

				//			this.srd_toolbar.addChild(this.srd_selLayer.editPalette.layoutContainer)
							this.srd_selLayer.editPalette.addToContainer(this.srd_toolbar);


							this.srd_selectEditLayer(this.srd_selLayer.id);

						} else {
							this.srd_container.addChild(this.srd_toolbar);
							this.srd_container.resize();
						}
						menuItem.checked = true;
				//		this.srd_panel.activate();

				//		this.srd_toolbar.startup();
				//		var theSize = {w:"50%", h:"50%" };
				//		this.srd_mapContent.resize(theSize);
				//		this.map.updateSize();
				//		this.srd_toolbar.placeAt(dojo.body());		
					} else {
						if(this.srd_toolbar != null) {
					//		this.srd_panel.deactivate();
							this.srd_container.removeChild(this.srd_toolbar);
				//			this.srd_toolbar.destroyRecursive();
							this.srd_container.resize();
				//			delete this.srd_toolbar;
				//			this.srd_toolbar = null;

						}
						menuItem.checked = false;
					}
					return;
					}.bind(this) );
				}

				srd_document.prototype.saveLayer = function( layerId ) {
					var formatGml = new OpenLayers.Format.GML( { 
							'internalProjection' : new OpenLayers.Projection("EPSG:900913"),
							'externalProjection' : new OpenLayers.Projection("EPSG:4326")
					});
					var test = formatGml.write(this.srd_layerArr[layerId].layer.features);

					dojo.xhrPost( { 
						url: "lib/srd_php/UploadLayer.php",
						content: {
							fileName: this.srd_layerArr[layerId].name,
							localSave:true,
							layerData: test
						},
						load: function(result) {
							console.log("Sent file: "+this.content.fileName);
							document.location.href = "lib/srd_php/UploadLayer.php?fileName="+this.content.fileName;
						}
					} );
				}

				srd_document.prototype.openFile = function() {
				//	dojo.addOnLoad(function() {
						if(this.fileSelDialog != null) {
							this.fileSelDialog.show();
							return;
						}

					this.fileSelDialog = new dijit.Dialog( {
							style: "width: 400px",
							content:"<div id='test1'></div><div id='test2'></div>"
						} );

					this.openFileForm = new dijit.form.Form( { 
							action:'lib/srd_php/UploadFile.php',
							method: 'post',
							encType:"multipart/form-data"
						} );
					this.openFileForm.placeAt('test1');	

					this.srd_uploader = new dojox.form.Uploader( { 
						id: "uploader",
						type: 'file',
						name: 'uploadedfile',
						label:"Select Layers to Upload",
						multiple:true,
				//		uploadOnSelect:true,
						srd_doc: this,
						onComplete: function(evt) {
				//			alert("Completed file upload!");
							for(var fileArr in evt) {
								if(evt[fileArr].name != null) {
									var theName = evt[fileArr].name;
									var theUrl = "/srd_uploads/"+theName;
				//				console.log("File uploaded! "+theName);	
									theName = theName.replace('.gml','');
									this.srd_doc.srd_createLayer(theName,theUrl);					
								}
							}
						},
						onError: function(evt) {
							alert("File upload error!");
						}

					}  );
					this.srd_fileList = new dojox.form.uploader.FileList({uploader: this.srd_uploader }  );

						var oFSubmit = new dijit.form.Button( {
							label : 'Upload!',
							type  : 'button',
							srd_doc: this,
							onClick: function(evt) {
									console.log("Clicked the Upload Button!");
									this.srd_doc.srd_uploader.upload();					
									this.srd_doc.fileSelDialog.hide();

								}


						});
						
						this.openFileForm.domNode.appendChild(this.srd_fileList.domNode);
						this.openFileForm.domNode.appendChild(this.srd_uploader.domNode);
						this.openFileForm.domNode.appendChild(oFSubmit.domNode);
						this.openFileForm.startup();

					this.fileSelDialog.show();	

				//	} );
					
				}


				srd_document.prototype.srd_selectEditLayer = function( theId ) {
					console.log("srd_selectEditLayer Called:"+theId);
					if(theId == this.srd_selLayer.id) {
						return;
					}
					if(this.srd_selLayer != null) {
						this.srd_selLayer.editPalette.removeFromContainer(this.srd_toolbar);
						this.srd_selLayer.editPalette.deactivateDrawControls();
					}	
					this.srd_selLayer = this.srd_layerArr[theId];
					this.srd_selLayer.editPalette.addToContainer(this.srd_toolbar);
					this.srd_layerEditMenuDropDown.set("label",this.srd_selLayer.options.name);
					this.srd_selLayer.editPalette.activateDrawControl();
				//	console.log("srd_selectEditLayer Finished");
				}
				// END selectEditLayer FUNCTION
				// BEGIN changeWindowLayout FUNCTION
				srd_document.prototype.srd_changeWindowLayout = function(wlayout) {
					if( wlayout != this.selected_wlayout)	{
						console.log("Changing Window Layout from "+this.selected_wlayout+" TO "+wlayout);
						this.selected_wlayout = wlayout;
						if(this.viewContainer) {
							this.viewContainer.destroyRecursive();
						}
						if(this.viewArr) {
							delete this.viewArr;
						}
						this.staticVals.view_layout_x = this.srd_wlayoutArr[this.selected_wlayout].view_x;
						this.staticVals.view_layout_y = this.srd_wlayoutArr[this.selected_wlayout].view_y;
						this.staticVals.view_data = this.srd_wlayoutArr[this.selected_wlayout].view_data;

						this.viewContainer = new srd_gridContainer( {
							nbZones: this.staticVals.view_layout_x,
				//		nbColumns: 2,
							isAutoOrganized: true,
							hasResizeableColumns : true
						}  );
						dojo.place(this.viewContainer.domNode, this.centerPane.domNode,'first');
						this.viewContainer.startup();
						this.viewArr = [];
						for(var xPos=0;xPos<this.staticVals.view_layout_x;xPos++) {
							if( !this.staticVals.view_data[xPos] ) {
								this.staticVals.view_data[xPos] = [];
							}
							var tmpViewYArr = [];
							for(var yPos=0;yPos<this.staticVals.view_layout_y;yPos++) {
								if( !this.staticVals.view_data[xPos][yPos] ) {
									this.staticVals.view_data[xPos][yPos] = [];
									this.staticVals.view_data[xPos][yPos].type = 'empty';
								}
								this.staticVals.view_data[xPos][yPos].xPos = Number(xPos);
								this.staticVals.view_data[xPos][yPos].yPos = Number(yPos);
								this.staticVals.view_data[xPos][yPos].xDim = this.staticVals.view_layout_x;
								this.staticVals.view_data[xPos][yPos].yDim = this.staticVals.view_layout_y;

								tmpViewYArr[yPos] = new window[ this.viewType[this.staticVals.view_data[xPos][yPos].type] ](this.staticVals.view_data[xPos][yPos], this);
								this.selectedView = tmpViewYArr[yPos];
							}
							this.viewArr[xPos] = tmpViewYArr;
						}
						this.srd_container.resize();	
					}
				}
				// END changeWindowLayout FUNCTION

				// BEGIN changeViewGridDimensions FUNCTION
				srd_document.prototype.srd_changeViewGridDimensions = function(theDimType,theDim) {
					console.log("changeViewGridDim called: "+theDimType+", val: "+theDim);
					if(theDimType == 'x') {
						if(theDim > this.staticVals.view_layout_x) {
							this.viewContainer.setColumns(theDim);
							for(var xPos=this.staticVals.view_layout_x;xPos<theDim;xPos++) {
								if( !this.staticVals.view_data[xPos] ) {
									this.staticVals.view_data[xPos] = [];
								}
								var tmpViewYArr = [];
								for(var yPos=0;yPos<this.staticVals.view_layout_y;yPos++) {
									if( !this.staticVals.view_data[xPos][yPos] ) {
										this.staticVals.view_data[xPos][yPos] = [];
										this.staticVals.view_data[xPos][yPos].type = 'empty';
										this.staticVals.view_data[xPos][yPos].xPos = Number(xPos);
										this.staticVals.view_data[xPos][yPos].yPos = Number(yPos);
										this.staticVals.view_data[xPos][yPos].xDim = this.staticVals.view_layout_x;
										this.staticVals.view_data[xPos][yPos].yDim = this.staticVals.view_layout_y;
										tmpViewYArr[yPos] = new srd_view(this.staticVals.view_data[xPos][yPos], this);
									} else {
										tmpViewYArr[yPos] = this.viewArr[xPos][yPos];
										thmpViewYArr[yPos].resize();
									}
								}
								this.viewArr[xPos] = tmpViewYArr;
							}
						} else {
							//PRESENT WARNING ABOUT LOSING VIEWS...
						}
						this.staticVals.view_layout_x = theDim;
					} else if(theDimType == 'y') { 
						if(theDim > this.staticVals.view_layout_y) {
				//			this.viewContainer.setColumns(theDim);
							for(var xPos=0;xPos<this.staticVals.view_layout_x;xPos++) {
								if( !this.staticVals.view_data[xPos] ) {
									this.staticVals.view_data[xPos] = [];
								}
								if( !this.viewArr[xPos] ) {
									this.viewArr[xPos] = [];
								}
								for(var yPos=0;yPos<theDim;yPos++) {
									if( !this.staticVals.view_data[xPos][yPos] ) {
										this.staticVals.view_data[xPos][yPos] = [];
										this.staticVals.view_data[xPos][yPos].type = 'empty';
									}
									this.staticVals.view_data[xPos][yPos].xPos = Number(xPos);
									this.staticVals.view_data[xPos][yPos].yPos = Number(yPos);
									this.staticVals.view_data[xPos][yPos].xDim = this.staticVals.view_layout_x;
									this.staticVals.view_data[xPos][yPos].yDim = theDim;
									if(!this.viewArr[xPos][yPos]) {
										this.viewArr[xPos][yPos] = new srd_view(this.staticVals.view_data[xPos][yPos], this);
									} else {
											this.viewArr[xPos][yPos].resize(this.staticVals.view_data[xPos][yPos]);
									}
								}
							}
						} else {
							//PRESENT WARNING ABOUT LOSING VIEWS...
						}
						this.staticVals.view_layout_x = theDim;
					}
					this.srd_container.resize();
				}

				srd_document.prototype.srd_updateViewMenu = function() {
					var theLabel = "Selected View : ";
					if(this.selectedView) {
						theLabel = theLabel+this.selectedView.data.type+" "+this.selectedView.data.xPos+","+this.selectedView.data.yPos;
					}
					this.srd_viewMenuSelected.set('label', theLabel);
				}


				srd_document.prototype.srd_changeViewType = function(theType) {
					if(this.selectedView && this.selectedView.data.type != theType) {	
						var xPos = this.selectedView.data.xPos;
						var yPos = this.selectedView.data.yPos;
						this.selectedView.destroy();
						delete this.viewArr[xPos][yPos];
						for(var theVar in this.viewDefaults[theType] ) {
							this.staticVals.view_data[xPos][yPos][theVar] = this.viewDefaults[theType][theVar];
						}
							console.log( "NEW VIEW TYPE:"+this.viewType[theType]+"xPos="+xPos+",yPos="+yPos);
							this.viewArr[xPos][yPos] = new window[ this.viewType[theType] ](this.staticVals.view_data[xPos][yPos], this);
						this.selectedView = this.viewArr[xPos][yPos];
						this.viewContainer.resize();
					}
				}
				// BEGIN hasView FUNCTION
				srd_document.prototype.getView = function(theId) {
					for(var xPos=0;xPos<this.staticVals.view_layout_x;xPos++) {
						if( this.staticVals.view_data[xPos] ) {
							for(var yPos=0;yPos<this.staticVals.view_layout_y;yPos++) {
								if( this.staticVals.view_data[xPos][yPos] ) {
									if(this.staticVals.view_data[xPos][yPos].id == theId) {
										return this.staticVals.view_data[xPos][yPos];
									}
								}
							}
						}
					}
					return null;
				}	
				// END hasView FUNCTION
				// FUNCTION TO DO ANY CLEAN UP NEEDED 
				// THEN REDIRECT TO /login/logout
				srd_document.prototype.logout = function() {	
					console.log("Logging Out User : "+this.staticVals.user_lastname);
					window.location.href = "/login/index/logout";	

				}






