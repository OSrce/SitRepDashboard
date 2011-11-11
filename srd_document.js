
//dojo.require("dojo.store.Memory");
//dojo.require("dojo.store.LocalStorage");
dojo.require("dojox.storage.LocalStorageProvider");
dojo.require("dojo.date.locale");
//dojo.require("dojox.encoding.base64");
//dojo.require("dojox.form.uploader.plugins.Flash");
dojo.require("dojox.form.Uploader");
dojo.require("dojox.form.uploader.FileList");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Textarea");



srd_document.prototype.loadFromLocalStore = function() {
	//BEGIN CLEAR STORE LINE - DEBUG ONLY
	this.srd_localStore.clear("srd");	
	//END CLEAR STORE LINE - DEBUG ONLY
	var tmpStaticVals = this.srd_localStore.get("staticVals","srd"); 
	for(var tmpVal in tmpStaticVals) {
		this.setValue(tmpVal,tmpStaticVals[tmpVal] );
		console.log("Loading Values: "+tmpVal+", "+tmpStaticVals[tmpVal]);
	}
	for(var i=1;i<this.staticVals.layerCount; i++) {
		this.srd_layerArr[i] = new srd_layer();
		this.srd_layerArr[i].copyValuesFromLayer( this.srd_localStore.get(i,"srdLayer") );
	}
	return 0;
}

//srd_document CLASS 
function srd_document() {
	//THE UI VARS
	this.srd_container = null;
	this.srd_menuBar = null;
	this.srd_saveMenu = null;
	this.srd_mapContent = null;
	this.srd_adminContent = null;
	this.srd_dataContent = null;

	//THE OpenLayers VARS
	this.map = null;
	this.editTools = null;
	this.selectControl = null;
	this.drawControls = null;
	this.srd_panel = null;
	this.theSelectedControl = null;

	this.srd_toolbar = null;
	
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
			default_projection: null,
			start_lat: null,
			start_lon: null,
			start_zoom: null,
			layerCount: null
	};

//	this.srd_init();	
}

// SRD_DOCUMENT CONSTRUCTOR
srd_document.prototype.srd_init = function() {
// srd_init : called by SitRepDashboard when we are ready to 
// load initial values and the first 'screen' we will see :
// map, admin, or data.


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
	this.srd_mapDisplay();
	if(this.staticVals.docCount == null) {
		// Local Storage is empty, need to load from xml (defaults)
		console.log( "LocalStore is empty, loading from xml");
		this.loadDefaults();
	} else {	
		//THIS FUNCTION CREATES THE MAP AND ALL THE LAYERS.
		this.map_init();
		//TESTING ONLY
//		this.srd_createWhiteboard();
//		this.srd_toggleEditPanel(null);


	}
}
// END SRD_DOCUMENT CONSTRUCTOR

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
						if( tmpLayerAtts[k] in tmpSrdLayer) {
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
					this.srd_layerArr[tmpSrdLayer.id] = tmpSrdLayer;
					this.srd_localStore.put(tmpSrdLayer.id,tmpSrdLayer,this.storePutHandler,"srdLayer");
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
				new OpenLayers.Control.Attribution()
			],
			numZoomLevels: 6 
		} );
	}
////////////////////////
///// LAYER CREATION ////

// Iterate through each srd_layer and call loadData and addLayerToMap)

for(var i in this.srd_layerArr ) {
	console.log("Loading Layer:"+i+":::");
	this.srd_layerArr[i].loadData();
	this.srd_layerArr[i].addLayerToMap(this.map);
}

this.map.setOptions( 
	{ projection :  new OpenLayers.Projection("EPSG:900913") ,
	displayProjection : new OpenLayers.Projection("EPSG:4326") }
);
var lonlat = new OpenLayers.LonLat(this.staticVals.start_lon, this.staticVals.start_lat).transform(this.map.displayProjection, this.map.projection);
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
	
	var wbLayer = new srd_layer();
	wbLayer.name = "WhiteBoard_"+dojo.date.locale.format(theDate,  {
            selector: "date",
            datePattern: theFrmt
        });
	wbLayer.layertype = "Vector";
	wbLayer.format = "GML";
	
	wbLayer.isBaseLayer = false;
	wbLayer.visibility = true;
	wbLayer.editable = true;

	wbLayer.id = this.srd_layerArr.length;
	this.srd_layerArr[wbLayer.id] = wbLayer;	

	wbLayer.loadData();
	wbLayer.addLayerToMap(this.map);
	this.srd_selLayer = wbLayer;
	this.srd_saveMenu.addChild(new dijit.MenuItem( { 
			label: wbLayer.name,
			onClick: function() { this.saveLayer(wbLayer.id) }.bind(this)
	} ) );


}


srd_document.prototype.srd_displayMenuBar = function() {
	dojo.addOnLoad(function() {
		if(this.srd_container == null) {
			var srd_jsDisabled = dojo.byId("srd_jsDisabled");
			dojo.style(srd_jsDisabled, "display", "none");
			this.srd_container = new dijit.layout.BorderContainer( { 
					liveSplitters: "true",
					design: "headline",
					style: "height:100%;width:100%;margin:0px;padding:0px;border:0px;",
//				style: "height:100%;width:100%;", 
				id: 'srd_container' }, 'srd_container' );
			this.srd_container.placeAt("theSrdDoc");
			this.srd_container.startup();
		}
		if(this.srd_menuBar == null) {
			this.srd_menuBar = new dijit.MenuBar({splitter: false, region: 'top' } );	
			//// ICON in LEFT CORNER ////
			this.srd_menuBar.addChild(new dijit.MenuBarItem( {
				label: '<img src="img/SR_Icon.png" height="20" width="16">' } ) );
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
	      {  splitter: 'false', style: "background-color:white;border:0;margin:0;padding:0;", region: 'center', content: '<div id="srd_docContent" class="map"></div>' }, 'srd_center');
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
					style: "background-color:gray;width:150px;",
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
				style:"height:100px;background-color:yellow",
				region: 'top',
				splitter: false
			} );
			

			var activeLayerName = new dijit.layout.ContentPane({
				content:"Editing Palette<br>Layer: ",
				region: 'top'
//				style:'height:30px;
			});
			editPaletteTop.addChild(activeLayerName);
			var layerMenu = new dijit.Menu({ });
			for( tmpId in this.srd_layerArr) {
				if(this.srd_layerArr[tmpId].editable == true) {
						layerMenu.addChild(new dijit.MenuItem( { 
						label: this.srd_layerArr[tmpId].name,
						onClick: function() { this.selLayer = this.srd_layerArr[tmpId]  }.bind(this)
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

	
			var activeLayer = new dijit.form.DropDownButton({
				label: this.srd_selLayer.name,
				dropDown: layerMenu,
				style: "position:relative",
				id: "srd_activeLayer",
				region:'top'

			});
			editPaletteTop.addChild(activeLayer);
			editPaletteTop.startup();
			this.srd_toolbar.addChild(editPaletteTop);
			// END LAYER SELECT

			this.srd_toolbar.addChild(this.srd_selLayer.editPalette.layoutContainer)

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
		if(this.srd_panel != null) {
	//		this.srd_panel.deactivate();
//			this.srd_container.removeChild(this.srd_toolbar);
			this.srd_toolbar.destroyRecursive();
			this.srd_container.resize();
			this.srd_toolbar = null;

		}
		menuItem.checked = false;
	}
	return;
	}.bind(this) );
}

srd_document.prototype.saveLayer = function( layerId ) {
	var formatGml = new OpenLayers.Format.GML();
	var test = formatGml.write(this.srd_layerArr[layerId].layer.features);
	console.log("TEST="+test);
//	var theHead = "data:application/gml+xml;charset=utf-8;base64,";
	var theHead = "data:application/gml+xml,";
	document.location.href = theHead + test;
	
	
}

srd_document.prototype.openFile = function() {
	var fileSelDialog = new dijit.Dialog( {
			style: "width: 300px"
//			content: '<input name="uploadedfile" multiple="true" type="file" id="uploader" dojoType="dojox.form.Uploader" label="Select Which Files you wish to load" />WhichFilesYouWant<div id="files" dojoType="dojox.form.uploader.FileList"  uploaderId="uploader"></div>'
		} );

	dijit.byId(fileSelDialog).appendChild(myUploader);
var myUploader = new dojox.form.Uploader({label:"Programmatic Uploader", multiple:true, uploadOnSelect:true });

var list = new dojox.form.uploader.FileList({uploader:uploader});

//	fileSelDialog.addChild( new dojox.form.Uploader() );
//	fileSelDialog.addChild( new dojox.form.uploader.FileList()  );

//	fileSelDialog.startup();	
	fileSelDialog.show();	
	
}


srd_document.prototype.createColorSelect = function(theName,theColorType) {
	var colorNameCP = new dijit.layout.ContentPane({
		content: theName+": "
	});
	this.srd_toolbar.addChild(colorNameCP);
	var colorBox = new dijit.form.TextBox( {
		style : "background-color:"+this.srd_selLayer.srd_featureAttributes[theColorType]+";width:1.5em;"
		}, "colorBox");

	var colorMenu = new dijit.Menu({});
	var colorButton = new dijit.form.DropDownButton({
		label: "<div id='srd_colorBox'></div>",
		dropDown: colorMenu,
		style: "position:relative;",
		id: "srd_"+theName
		});
	var picker = new dijit.ColorPalette({
		onChange: function(val,colorButton,colorBox) { 
			this.srd_selLayer.srd_featureAttributes[theColorType] = val; 
			colorButton.closeDropDown();
			colorBox.attr("style", "background-color:"+val );
		}.bind(this)
	}, "somePicker" );
	colorMenu.addChild(picker);
	this.srd_toolbar.addChild( colorButton );
	colorBox.placeAt("srd_"+theName);
}
//END createColorSelect
	

