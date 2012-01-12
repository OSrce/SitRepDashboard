
if(dojo.isIE) {
	dojo.require("dojox.form.uploader.plugins.IFrame");
} else if(dojo.isKhtml) {
	dojo.require("dojox.form.uploader.plugins.HTML5");
} else {
	dojo.require("dojox.form.uploader.plugins.Flash");
}

dojo.require("dojox.layout.GridContainer");

//srd_document CLASS 
function srd_document() {
	//THE UI VARS
	this.srd_container = null;
	this.srd_menuBar = null;
	this.srd_saveMenu = null;
	this.srd_mapContent = null;
	this.srd_adminContent = null;
	this.srd_dataContent = null;

	this.srd_layerEditMenu = null;
	this.srd_layerEditMenuDropDown = null;
	
	this.fileSelDialog = null; 
	this.srd_uploader = null;
	this.oFSubmit = null;
	this.srd_fileList = null;
	this.openFileForm = null;

	//THE OpenLayers VARS
	this.map = null;
	this.editTools = null;
	this.selectControl = null;
	this.drawControls = null;
	this.srd_panel = null;
	this.theSelectedControl = null;

	this.srd_toolbar = null;
	
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
			layerCount: null
	};

	// srd_document should have a list of sub-objects - srd_view
	// maps, datagrids (spreadsheets), admin, empty, video, etc all should be 
	// sub-classes of srd_view. srd_view's described in staticVals.view_data.
	this.viewContainer = null; 
	this.viewArr = null; 

//	this.srd_init();	
}

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


	this.srd_displayMenuBar();
//	this.srd_container.startup();

	dojo.addOnLoad(function() {

	// ASSUME view_layer_x/y have been set and that settings are populated
	// parse and init different views
	this.centerPane = new dijit.layout.ContentPane( { 
		region: 'center',
		id: 'srd_centerPane'
	} );
	this.srd_container.addChild(this.centerPane);
		this.viewContainer = new srd_gridContainer( {
		nbZones: this.staticVals.view_layout_x,
//		nbColumns: 2,
		isAutoOrganized: true,
		hasResizeableColumns : true
//		style: "background-color:black;margin:0px;border:0px;padding:0px;"
//		style: "width:100%;height:100%;",
	}  );
	dojo.place(this.viewContainer.domNode, this.centerPane.domNode,'first');
//	this.srd_container.addChild(this.viewContainer);
	this.viewContainer.startup();
	this.viewArr = [];
//	for(var xPos in this.staticVals.view_data) {
		for(var xPos=0;xPos<this.staticVals.view_layout_x;xPos++) {
		if( !this.staticVals.view_data[xPos] ) {
			this.staticVals.view_data[xPos] = [];
		}
		var tmpViewYArr = [];
//		for(var yPos in this.staticVals.view_data[xPos] ) {
		for(var yPos=0;yPos<this.staticVals.view_layout_y;yPos++) {
			if( !this.staticVals.view_data[xPos][yPos] ) {
			this.staticVals.view_data[xPos][yPos] = [];
				this.staticVals.view_data[xPos][yPos].type = 'empty';
			}
			this.staticVals.view_data[xPos][yPos].xPos = Number(xPos);
			this.staticVals.view_data[xPos][yPos].yPos = Number(yPos);
			this.staticVals.view_data[xPos][yPos].xDim = this.staticVals.view_layout_x;
			this.staticVals.view_data[xPos][yPos].yDim = this.staticVals.view_layout_y;
			switch( this.staticVals.view_data[xPos][yPos].type ) {
				case 'empty' :
					tmpViewYArr[yPos] = new srd_view(this.staticVals.view_data[xPos][yPos], this);
					break;
				case 'map' :
					tmpViewYArr[yPos] = new srd_view_map(this.staticVals.view_data[xPos][yPos], this);
					break;
			}
			this.viewArr[xPos] = tmpViewYArr;
/*		
			this.staticVals.view_data[xPos][yPos].xPos = 1;
			tmpViewYArr[yPos] = new srd_view_map(this.staticVals.view_data[xPos][yPos], this);

			this.staticVals.view_data[xPos][yPos].yPos = 1;
			tmpViewYArr[yPos] = new srd_view_map(this.staticVals.view_data[xPos][yPos], this);
			this.staticVals.view_data[xPos][yPos].xPos = 2;
			this.staticVals.view_data[xPos][yPos].yPos = 2;
			tmpViewYArr[yPos] = new srd_view_map(this.staticVals.view_data[xPos][yPos], this);
*/
		}
	}
	this.srd_container.resize();	

	}.bind(this) );

//	this.srd_mapDisplay();
/*
	if(this.staticVals.docCount == null) {
		// Local Storage is empty, need to load from xml (defaults)
		console.log( "LocalStore is empty, loading from xml");
		this.loadDefaults();
	} else {	
		//THIS FUNCTION CREATES THE MAP AND ALL THE LAYERS.
		dojo.addOnLoad(function() {
			this.map_init();
		}.bind(this) );
		//TESTING ONLY
//		this.srd_createWhiteboard();
//		this.srd_toggleEditPanel(null);
	}
*/


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

		this.map_init();
}


srd_document.prototype.map_init = function() {

	if(this.map == null) {
//		this.map = new OpenLayers.Map("srd_docContent", { 
		this.map = new OpenLayers.Map("srd_docContent", { 
			controls: [
				new OpenLayers.Control.Navigation(),
				new OpenLayers.Control.PanZoomBar(),
				new OpenLayers.Control.Attribution(),
				new OpenLayers.Control.KeyboardDefaults()
			],
				projection : "EPSG:900913",
				displayProjection: "EPSG:4326"
//				units : 'degrees'
//			resolutions: [272989.386733,136494.693366,68247.3466832,34123.6733416,17061.8366708,8530.9183354,4265.4591677,2132.72958385,1000,500,250,125   ]
//			maxResolution: 0.175 
		} );
	}
////////////////////////
///// LAYER CREATION ////

/*
this.map.setOptions( 
	{ projection :  new OpenLayers.Projection("EPSG:900913") ,
//	{ projection :  new OpenLayers.Projection("EPSG:4326") ,
	displayProjection : new OpenLayers.Projection("EPSG:4326") }
);
*/


// Iterate through each srd_layer and call loadData and addLayerToMap)

for(var i in this.srd_layerArr ) {
//	console.log("Loading Layer:"+this.srd_layerArr[i].name+":::");
	this.srd_layerArr[i].loadData();
	this.srd_layerArr[i].addLayerToMap(this.map);

	// BEGIN ADD layer to uploadMenu
/*	this.srd_uploadMenu.addChild(new dijit.MenuItem( { 
			label: this.srd_layerArr[i].options.name,
			srd_doc: this,
			tmpId: i,
			onClick: function() { this.srd_doc.srd_layerArr[this.tmpId].uploadLayer() }
	} ) );
*/
	// END ADD LAYER TO uploadMenu

}


var googleProjection = new OpenLayers.Projection("EPSG:900913");
var mapProjection = new OpenLayers.Projection("EPSG:4326");
var lonlat = new OpenLayers.LonLat(this.staticVals.start_lon, this.staticVals.start_lat).transform( mapProjection, googleProjection  );

this.map.setCenter( lonlat, this.staticVals.start_zoom ); 


console.log("Should be displaying Map at this point!");


// Adding the Control for the Layer select 
this.map.addControl(new OpenLayers.Control.LayerSwitcher() );
//Adding control for tracking mouse movement 
/*
this.map.addControl(new OpenLayers.Control.MousePosition( {  
	displayProjection: new OpenLayers.Projection("EPSG:4326")
} ) );
*/
/*

var sr_dynamicLayers = { 
	"Whiteboard": whiteboard
};

var sr_dynamicLayer_layer = new Array();
//for(var layerName in sr_dynamicLayers ) {
//	alert('LayerName :'+layerName);
//	sr_dynamicLayer_layer.push( sr_dynamicLayers{layerName} );
//}

for(var layerName in sr_dynamicLayers) {
		sr_dynamicLayer_layer.push( sr_dynamicLayers[layerName].layer );
}

selectControl = new OpenLayers.Control.SelectFeature( 
	sr_dynamicLayer_layer,
	{
		clickout: true, toggle: false,
		multiple: false, hover: false,
		toggleKey: "ctrlKey", // ctrl key removes from selection
		multipleKey: "shiftKey" // shift key adds to selection
	}
);
this.map.addControl(selectControl);
//selectControl.activate();

for(var layerName in sr_dynamicLayers ) {
	sr_dynamicLayers[layerName].turnOnEvents();
}

//Add the events we wish to register
//map.events.register("mousemove", map, function(e) {
//	var position = this.events.getMousePosition(e);
//	OpenLayers.Util.getElement("coords").innerHTML = position;
//});



var save = new OpenLayers.Control.Button({
        title: "Save Changes",
        trigger: function() {
//            if(edit.feature) {
//                edit.selectControl.unselectAll();
//            }
						for(var layerName in sr_dynamicLayers ) {
							sr_dynamicLayers[layerName].saveStrategy.save();
						}
        },
        displayClass: "olControlSaveFeatures"
    });
    panel.addControls([save  ]);
    this.map.addControl(panel);
*/


/*
editTools = new srd_edit(this.map, sr_dynamicLayers);
editTools.loadEditTools();

var  removeControl = new OpenLayers.Control.SelectFeature(
										sr_dynamicLayer_layer, {
												clickout: true,
												toggle: false,
												hover: false,
												title: "Delete",
												displayClass: "olControlDelete",
												onSelect: function (theFeat) {
													for(var layerName in sr_dynamicLayers ) {
														if( sr_dynamicLayers[layerName].layer.getFeatureByFid(theFeat.fid) ) {
														if (confirm('Are you sure you want to delete this feature from Overlay : '+layerName+'?')) {
															theFeat.state = OpenLayers.State.DELETE;
															if( !theFeat.attributes.gid) {
																sr_dynamicLayers[layerName].layer.removeFeatures([theFeat]);
															}
//													} else {
//														this.unselect(e.layer.feature);
														}
													}	

													}	
											}
										} );


var drawLayer = whiteboard.layer;
   drawControls = {
                    point: new OpenLayers.Control.DrawFeature( drawLayer,
                                OpenLayers.Handler.Point),
                    line: new OpenLayers.Control.DrawFeature( drawLayer,
                                OpenLayers.Handler.Path),
                    polygon: new OpenLayers.Control.DrawFeature( drawLayer,
                                OpenLayers.Handler.Polygon),
										remove: removeControl,
										select: selectControl

                };
*/
/*
  removeControl.events.register("onSelect", function(e, ) {
			if (confirm('Are you sure you want to delete this feature?')) {
				e.layer.feature.state = OpenLayers.State.DELETE;
//				drawLayer.removeFeatures([e.feature]);
//				drawLayer.destroyFeatures([e.feature]);
//				removeControl.deactivate();
			} else {
				removeControl.unselect(e.layer.feature);
			}
		});
*/

/*
                for(var key in drawControls) {
                    this.map.addControl(drawControls[key]);
                }

								theSelectedControl = selectControl;
                document.getElementById('selectToggle').checked = true;

*/

					/// CODE IS A MESS, NEED TO FIX :
					// use dojo.form.FilteringSelect to select which layer you want to have editing enabled on.


//DEV-TESTING  commented out below section since not being used
//right now.					
//					var editLayerSelect = new dijit.form.FilteringSelect( {
//						id: "layerEditSelect",
//						name: "layerEditSel",
//						value: "NONE SELECTED",
//						store: srd_layerStore,
//						searchAttr: "name"
//						}, "layerEditSelect"
//					);


/*	console.log("KeyPress Connected!");
	dojo.connect( dojo.byId("theSrdDoc"),
								"onkeypress",
								function( ) {
										alert("Key Pressed!");
								}
							);
*/

	console.log("END map_init function");
}
/// END map_init Function

/*
// activate 
function activateDrag() {
	dragControl.activate();
}

  function toggleControl(element) {
                for(key in drawControls) {
                    var control = drawControls[key];
                    if(element.value == key && element.checked) {
                        control.activate();
												theSelectedControl = control;
                    } else {
                        control.deactivate();
                    }
                }
								panel.activate();
//								if(element.value == "noneToggle") {
//									selectControl.activate();
//								}
            }



*/

srd_document.prototype.srd_createWhiteboard = function() {
	var theDate = new Date();
	var theFrmt = "yyyyMMdd_HHmm";
	var name = "WhiteBoard_"+dojo.date.locale.format(theDate,  {
            selector: "date",
            datePattern: theFrmt
        });
	var url ="https://wjoc-sr.nypd.finest/srdata/feature";
	this.srd_createLayer(name,url);
}
	
srd_document.prototype.srd_createLayer = function(theName,theUrl) {
	var tmpLayer = new srd_layer();
	tmpLayer.options.name = theName;
	if(theUrl != "") {
		tmpLayer.options.url = theUrl;
	}
	tmpLayer.options.type = "Vector";
	tmpLayer.options.format = "GeoJSON";
	tmpLayer.options.projection = this.staticVals.default_projection;
	tmpLayer.options.isBaseLayer = false;
	tmpLayer.options.visibility = true;
	tmpLayer.options.editable = true;

	tmpLayer.options.id = this.srd_layerArr.length;
	this.srd_layerArr[tmpLayer.options.id] = tmpLayer;	
	this.staticVals.layerCount++;

	tmpLayer.loadData();
	tmpLayer.addLayerToMap(this.map);
//	this.srd_selLayer = tmpLayer;
	this.srd_saveMenu.addChild(new dijit.MenuItem( { 
			label: tmpLayer.options.name,
			onClick: function() { this.saveLayer(tmpLayer.id) }.bind(this)
	} ) );
	if(this.srd_layerEditMenu != null) {
		this.srd_layerEditMenu.addChild(new dijit.MenuItem( { 
				label: tmpLayer.options.name,
				onClick: function() { this.srd_selectEditLayer( tmpLayer.id );  }.bind(this)
		} ) );
	}


}

srd_document.prototype.srd_displayMenuBar = function() {
	dojo.addOnLoad(function() {
		if(this.srd_container == null) {
			var srd_jsDisabled = dojo.byId("srd_jsDisabled");
			dojo.style(srd_jsDisabled, "display", "none");
			this.srd_container = new dijit.layout.BorderContainer( { 
					gutters: false,
					splitter: "false",
					design: "headline"
//					style: "height:100%;width:100%;margin:0px;padding:0px;border:0px;overflow:hidden;",
//				style: "height:100%;width:100%;", 
				 }, 'theSrdDoc' );
//			this.srd_container.placeAt("theSrdDoc");
			this.srd_container.startup();
		}
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
			this.srd_menuBar.addChild(new dijit.PopupMenuBarItem({
				label: "SitRep",
				popup: srd_sitrepMenu
			}) );
			srd_sitrepMenu.addChild(new dijit.MenuItem({
				label: "Map Screen",
				onClick: function() {this.srd_mapDisplay() }.bind(this)
			}));
			srd_sitrepMenu.addChild(new dijit.MenuItem({
				label: "Admin Screen",
				onClick: function() { this.srd_adminDisplay() }.bind(this)
			}));
			srd_sitrepMenu.addChild(new dijit.MenuItem({
				label: "Data Screen",
				onClick: function() { this.srd_dataDisplay() }.bind(this)
			}));
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
				if(this.srd_layerArr[tmpId].editable == true) {
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
			this.srd_viewMenu.addChild(new dijit.MenuItem({
				label: "Selected View: SomeView",
				onClick: function() { alert("Place TEST Here") }.bind(this)
			}));


			
	

			//// Tools Menu ////
			var srd_toolsMenu = new dijit.Menu({});
			this.srd_menuBar.addChild(new dijit.PopupMenuBarItem({
				label: "Tools",
				popup: srd_toolsMenu
			}) );
			var editPanelMenuItem =new dijit.CheckedMenuItem({
				label: "Show Edit Toolbar",
				onClick: function() { this.srd_toggleEditPanel(editPanelMenuItem); }.bind(this)
			});
			srd_toolsMenu.addChild(editPanelMenuItem);
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


			//// Window Menu ////
			this.srd_windowMenu = new dijit.Menu({});
			this.srd_menuBar.addChild(new dijit.PopupMenuBarItem({
				label: "Window",
				popup: this.srd_windowMenu
			}) );
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
			this.srd_windowMenu.addChild(new dijit.PopupMenuItem({
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
			this.srd_windowMenu.addChild(new dijit.PopupMenuItem({
				label: "View Columns: "+this.staticVals.view_layout_x,
				popup:this.srd_windowColMenu	
			}));

				
			this.srd_menuBar.startup();

		}
		
		// GET RID OF ALL WIDGETS ON SCREEN
		var widgetArr = this.srd_container.getChildren();
		for(var i=0;i<widgetArr.length;i++) {
			this.srd_container.removeChild(widgetArr[i]);
		}
		this.srd_container.addChild(this.srd_menuBar);
	}.bind(this) );
	return;
}

srd_document.prototype.srd_mapDisplay = function() {
	this.srd_displayMenuBar();

	dojo.addOnLoad(function() {
		if(this.srd_mapContent == null) {
			this.srd_mapContent = new dijit.layout.ContentPane(
	      {  splitter: 'false', style: "background-color:white;border:0px;margin:0px;padding:0px;", region: 'center', content: '<div id="srd_docContent" class="map"></div>' }, 'srd_center');
		}

		this.srd_container.addChild(this.srd_mapContent);
	}.bind(this) );

	return;
}

srd_document.prototype.srd_adminDisplay = function() {
	this.srd_displayMenuBar();
	
	
	return;
}

srd_document.prototype.srd_dataDisplay = function() {
	this.srd_displayMenuBar();
	

	return;
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

/*
	if(this.openFileForm != null) {
		delete this.openFileForm;
	}

	this.openFileForm = new dijit.form.Form( { 
			action:'UploadLayer.php',
			method: 'post',
			encType:"multipart/form-data"
		} );
//	this.openFileForm.appendTo( dojo.body() );	
		console.log("ok so far");
		dojo.body().appendChild(this.openFileForm.domNode);
		console.log("test2");
		fileNameWidget = dojo.create("input",
											{ type:"hidden",name:"fileName",value:this.srd_layerArr[layerId].name});
		this.openFileForm.domNode.appendChild(fileNameWidget.domNode);
		
		layerDataWidget = dojo.create("input",
											{ type:"hidden",name:"layerData",value:test},
											this.openFileForm);
		console.log("test3");
		this.openFileForm.submit();	
		console.log("test4");
*/

	
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









