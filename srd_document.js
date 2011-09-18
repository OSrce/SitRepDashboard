
/*
Function.prototype.bind = function(scope) {
  var _function = this;
  
  return function() {
    return _function.apply(scope, arguments);
  }
}
*/
//dojo.require("dojo.store.Memory");
//dojo.require("dojo.store.LocalStorage");
dojo.require("dojox.storage.LocalStorageProvider");

function srd_newWindow() {
	window.open("SitRepDashboard.html");
	return 0;
}

srd_document.prototype.loadFromLocalStore = function() {
//	this.srd_localStore.clear("srd");	
	var tmpStaticVals = this.srd_localStore.get("staticVals","srd"); 
	for(var tmpVal in tmpStaticVals) {
		this.setValue(tmpVal,tmpStaticVals[tmpVal] );
//		console.log("Loading Values: "+tmpVal+", "+tmpStaticVals[tmpVal]);
	}
	for(var i=1;i<this.staticVals.layerCount; i++) {
		this.srd_layerArr[i] = new srd_layer();
		this.srd_layerArr[i].copyValuesFromLayer( this.srd_localStore.get(i,"srdLayer") );
	}
	return 0;
}

//srd_document CLASS 
function srd_document() {
	this.map = null;
	this.editTools = null;
	this.selectControl = null;
	this.drawControls = null;
	this.panel = null;
	this.theSelectedControl = null;
	
	this.srd_layerArr = [];

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
	if(this.staticVals.docCount == null) {
		// Local Storage is empty, need to load from xml (defaults)
		console.log( "LocalStore is empty, loading from xml");
		this.loadDefaults();

	} else {	
		//THIS FUNCTION CREATES THE MAP AND ALL THE LAYERS.
		this.map_init();
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


/*
		//Dynamic layer creation lets change this to make the
		// settings in srd_layer, 
		var whiteboard = new srd_layer();
		whiteboard.name = "Whiteboard";
		whiteboard.id = this.srd_layerArr.length;
		whiteboard.layertype="Vector";
		whiteboard.format="WFST";
		whiteboard.isBaseLayer = false;
		whiteboard.projection = "EPSG:4326";
		whiteboard.visibility = true;
		whiteboard.loadData();
		whiteboard.addLayerToMap(this.map);
*/



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

panel = new OpenLayers.Control.Panel( {
        'displayClass': 'customEditingToolbar',
				div: document.getElementById('editToolsPanel') 
			}
    );



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






