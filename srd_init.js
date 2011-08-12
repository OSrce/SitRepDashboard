

var theSrdDocument = new srd_document;


// srd_init : called by SitRepDashboard when we are ready to 
// load initial values and the first 'screen' we will see :
// map, admin, or data.
function srd_init() {


// NEED TO GET RID OF THIS, values should be read in from srd_settings.xml
runFromServer = false;

// READ the srd_settings.xml file and load it into a dojo.data object.
/*
dojo.xhrGet( {
	url	: "srd_settings.xml",
	handleAs: "xml",
	load: function(result) {
		theSrdDocument.settings_init(result);
	},
	error: function(errorMessage) {
		theSrdDocument.errorOnLoad(errorMessage);
	}
} );
*/
	theSrdDocument.srd_settingsStore = new dojox.data.XmlStore({ 
		url: 'srd_settings.xml',
		label: 'srd_settings' 
	}); 
	

	//Fetch all global settings (except layer stuff).
	theSrdDocument.srd_settingsStore.fetch({
		onComplete: function(items,request) { 
			theSrdDocument.settings_init(items,request);

		},
		onError: function(errScope) {
			theSrdDocument.errorOnLoad(errScope);
		}
	});

	//Fetch all settings for all layers

	theSrdDocument.srd_settingsStore.fetch({
		query: { tagName:"layer" },
		onComplete: function(items, request) {
			theSrdDocument.load_layer_settings(items,request);
		},
		onError: function(errScope) {
			theSrdDocument.errorOnLoad(errScope);
		}
	});



	
}
// END INIT FUNCTION

//srd_document CLASS 
function srd_document() {
	this.map = null;
	this.editTools = null;
	this.selectControl = null;
	this.drawControls = null;
	this.panel = null;
	this.theSelectedControl = null;
	
	this.srd_layerArr = null;

// SETTINGS WE SHOULD GET FROM srd_settings.xml
	this.srd_settingsStore = null;
	this.srd_config = null;
	this.single_user = null;
	this.runFromServer = null;
	this.default_projection = null;
	this.start_lat = null;
	this.start_lon = null;
	this.start_zoom = null;
		

}


srd_document.prototype.load_layer_settings = function(items, request) {
	for(i=0;i<items.length;i++) {
		var itemName = this.srd_settingsStore.getValue( items[i], "tagName" ); 
		var itemValue = this.srd_settingsStore.getValue( items[i], "text()" ); 
		alert( "LayerTest="+itemName+"=");
	}

	
}

srd_document.prototype.errorOnLoad = function(errorMessage) {
	alert("Error Loading srd_setttings.xml : "+errorMessage);
	
}

srd_document.prototype.settings_init = function(items,request) {
	this.srd_items = items;
	for(i=0;i<this.srd_items.length;i++) {
//		var itemName = this.srd_settingsStore.getIdentity( this.srd_items[i] ); 
//		var itemValue = this.srd_settingsStore.getAttributes( this.srd_items[i] ); 
		var itemName = this.srd_settingsStore.getValue( this.srd_items[i], "tagName" ); 
		var itemValue = this.srd_settingsStore.getValue( this.srd_items[i], "text()" ); 
		if( itemName == "layers") {
			console.log("Layers from="+itemName+"==="+itemValue);
			var item = this.srd_items[i];
//			var theLayerItems = this.srd_settingsStore.getValues(itemValue,"tagName");
//			console.log("theLayerItems.length=",theLayerItems.length);

			var theItemAtts = this.srd_settingsStore.getAttributes(item);
			for(var j = 0; j < theItemAtts.length; j++){

			var values = this.srd_settingsStore.getValues(item, theItemAtts[j]);
      for(var k = 0; k < values.length; k++){
        var value = values[k];
	
				if(this.srd_settingsStore.isItem(value)){
					console.log("Located a child item with name: [" + this.srd_settingsStore.getValue(value,"tagName") + "]");
					

				}else{
					console.log("Attribute: [" + theItemAtts[j] + "] has value: [" + value + "]");
				}

//				var childName = this.srd_settingsStore.getAttribute( tmpChild, "id" ); 
//				console.log("LayerTest="+j+":::LayerName"+childName);
			}	
			}


//			alert("Layer="+i+", itemName="+itemName+", itemValue="+itemValue+"===");
				
		} else {
//			alert("Layer="+i+", itemName="+itemName+", itemValue="+itemValue+"===");
			//THIS NIFTY LINE STORES THE VALUES FROM THE XML TO THE srd_document variables.
			this[itemName] = itemValue;

		}
	}

//	this.start_lat = this.srd_settingsStore.getValue(this.srd_items,'start_lat');
//	this.start_lat = this.srd_config.getElementsByTagName('start_lat')[0].childNodes[0].nodeValue;
//	this.start_lon = this.srd_config.getElementsByTagName('start_lon')[0].childNodes[0].nodeValue;


	//THIS FUNCTION CREATES THE MAP AND ALL THE LAYERS.
	theSrdDocument.map_init();
}


srd_document.prototype.map_init = function() {

	if(this.map == null) {
		this.map = new OpenLayers.Map("map", { 
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


OpenLayers.Layer.MapQuestOSM = OpenLayers.Class(OpenLayers.Layer.XYZ, {
     name: "MapQuestOSM",
     //attribution: "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>",
     sphericalMercator: true,
     url: ' http://otile1.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png',
/*     clone: function(obj) {
         if (obj == null) {
             obj = new OpenLayers.Layer.OSM(
             this.name, this.url, this.getOptions());
         }
         obj = OpenLayers.Layer.XYZ.prototype.clone.apply(this, [obj]);
         return obj;
     },
*/
     CLASS_NAME: "OpenLayers.Layer.MapQuestOSM"
 });
 var mapquestosm = new OpenLayers.Layer.MapQuestOSM();




//Add the Google Maps Layer for debug purposes only (don't
//forget to get rid of script src from html file.)
//var gMapLayer = new OpenLayers.Layer.Google( "Google Maps", {numZoomLevels: 20} );

//Add OpenStreetMap Layer for debug purposes as well 
//var osmMapLayer = new OpenLayers.Layer.OSM();
var osmMapLayer = new OpenLayers.Layer.XYZ(
		"OSM",
		"http://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
		{
			attribution: "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>",
			sphericalMercator: true
 	}

);

var srMapLayer = new OpenLayers.Layer.OSM("SitRep GIS", 
//	"http://SitRepGIS.local:3001/osm_tiles/${z}/${x}/${y}.png",
	"http://SitRepGIS.local:3001/mq_tiles/${z}/${x}/${y}.png",
	{numZoomLevels: 19,
	 attribution: '<img src="img/SitRepLogo_Tiny.png" height="25" width="60">'
	 }
);

//Add style for precincts :
var pct_style_def =  new OpenLayers.Style( { 
	fillColor: "#0000FF",
	fillOpacity: 0.3,
	strokeColor: "#0000FF",
	strokeOpacity: 1,
	pointRadius: 6
} ); 
var pct_style_sel =  new OpenLayers.Style( { 
	fillColor: "#0011FF",
	fillOpacity: 0.3,
	strokeColor: "#0000FF",
	strokeOpacity: 1,
	pointRadius: 6
} ); 
var pct_styleMap = new OpenLayers.StyleMap( {"default":  pct_style_def, "select": pct_style_sel } );


// GET THE FULL DIR if we are running locally.
//var path = document.location.pathname;
//var dir = path.substring(path.indexOf('/', 1), path.lastIndexOf('/'));
//alert("DIR="+dir);

// Add the precinct boundaries as a gml file for now.
var policePcts;


if(runFromServer == false) {
	policePcts  = new OpenLayers.Layer.GML("Precinct Boundaries", "sr_data_public/PolicePctBoundaries.gml" ,{ isBaseLayer: false, projection: "EPSG:4326", visibility: false, styleMap: pct_styleMap  } );
} else {
	policePcts = new OpenLayers.Layer.Vector("Precinct Boundaries", {
		isBaseLayer: false,
		projection: "EPSG:4326",
		visibility: true,
		styleMap: pct_styleMap,
		strategies: [new OpenLayers.Strategy.Fixed()],
		projection: new OpenLayers.Projection("EPSG:4326"),
		protocol: new OpenLayers.Protocol.HTTP ( {
//		 	url: "file://"+dir+"/sr_data_public/PolicePctBoundaries.gml" ,
		 	url: "/Users/jreifer/Desktop/VBOX_SHARED/SitRepDashboard/sr_data_public/PolicePctBoundaries.gml" ,
			format: new OpenLayers.Format.GML()
		} ) 
	});
}

	// Attach the base layer + the sr_data_public layer(s)
	this.map.addLayers( [ srMapLayer,  osmMapLayer, mapquestosm ]);
	this.map.addLayers( [   policePcts ]);


//Dynamic layer creation lets change this to make the
// settings in srd_layer, 
//var whiteboard = new srd_layer(this.map); 
//whiteboard.loadData("WFST", "Whiteboard", "whiteboard" ,{ isBaseLayer: false, projection: "EPSG:4326", visibility: false} );

// whiteboard.attachLayerToMap(this.map);




// Adding the Control for the Layer select 
this.map.addControl(new OpenLayers.Control.LayerSwitcher() );
//Adding control for tracking mouse movement 
this.map.addControl(new OpenLayers.Control.MousePosition( {  
	displayProjection: new OpenLayers.Projection("EPSG:4326")
} ) );



var sr_dynamicLayers = { 
	"Whiteboard": whiteboard
};

var sr_dynamicLayer_layer = new Array();
/*for(var layerName in sr_dynamicLayers ) {
	alert('LayerName :'+layerName);
	sr_dynamicLayer_layer.push( sr_dynamicLayers{layerName} );
}
*/
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


this.map.setOptions( 
	{ projection :  new OpenLayers.Projection("EPSG:900913") ,
	displayProjection : new OpenLayers.Projection("EPSG:4326") }
);
var lonlat = new OpenLayers.LonLat(this.start_lon, this.start_lat).transform(this.map.displayProjection, this.map.projection);
this.map.setCenter( lonlat, this.start_zoom ); 



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

                for(var key in drawControls) {
                    this.map.addControl(drawControls[key]);
                }

								theSelectedControl = selectControl;
                document.getElementById('selectToggle').checked = true;

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










