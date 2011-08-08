
var map ;
var editTools;
var selectControl;
var drawControls;
var panel;
var theSelectedControl;

function init() {

// Start Location :
var lat = 40.713;
var lon = -73.998;
var zoom = 13;


map = new OpenLayers.Map("map", { 
	controls: [
		new OpenLayers.Control.Navigation(),
		new OpenLayers.Control.PanZoomBar()
	],
	numZoomLevels: 6 
} );

OpenLayers.Layer.MapQuestOSM = OpenLayers.Class(OpenLayers.Layer.XYZ, {
     name: "MapQuestOSM",
     //attribution: "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>",
     sphericalMercator: true,
     url: ' http://otile1.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png',
     clone: function(obj) {
         if (obj == null) {
             obj = new OpenLayers.Layer.OSM(
             this.name, this.url, this.getOptions());
         }
         obj = OpenLayers.Layer.XYZ.prototype.clone.apply(this, [obj]);
         return obj;
     },
     CLASS_NAME: "OpenLayers.Layer.MapQuestOSM"
 });
 var mapquestosm = new OpenLayers.Layer.MapQuestOSM();




//Add the Google Maps Layer for debug purposes only (don't
//forget to get rid of script src from html file.)
//var gMapLayer = new OpenLayers.Layer.Google( "Google Maps", {numZoomLevels: 20} );

//Add OpenStreetMap Layer for debug purposes as well 
var osmMapLayer = new OpenLayers.Layer.OSM();

var srMapLayer = new OpenLayers.Layer.OSM("SitRep GIS", 
//	"http://SitRepGIS.local:3001/osm_tiles/${z}/${x}/${y}.png",
	"http://SitRepGIS.local:3001/mq_tiles/${z}/${x}/${y}.png",
	{numZoomLevels: 19 }
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


// Add the precinct boundaries as a gml file for now.
var policePcts = new OpenLayers.Layer.GML("Precinct Boundaries", "data_public/PolicePctBoundaries.gml" ,{ isBaseLayer: false, projection: "EPSG:4326", visibility: false, styleMap: pct_styleMap  } );

// Attach the base layer + the data_public layer(s)
map.addLayers( [ srMapLayer,  osmMapLayer, mapquestosm]);
map.addLayers( [   policePcts ]);


var whiteboard = new srd_layer(map); 
whiteboard.loadData("WFST", "Whiteboard", "whiteboard" ,{ isBaseLayer: false, projection: "EPSG:4326", visibility: false} );





// Adding the Control for the Layer select 
map.addControl(new OpenLayers.Control.LayerSwitcher() );
//Adding control for tracking mouse movement 
map.addControl(new OpenLayers.Control.MousePosition( {  
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
map.addControl(selectControl);
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
    map.addControl(panel);



map.setOptions( 
	{ projection :  new OpenLayers.Projection("EPSG:900913") ,
	displayProjection : new OpenLayers.Projection("EPSG:4326") }
);
var lonlat = new OpenLayers.LonLat(lon, lat).transform(map.displayProjection, map.projection);
map.setCenter( lonlat, zoom ); 



editTools = new srd_edit(map, sr_dynamicLayers);
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
                    map.addControl(drawControls[key]);
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
/// END init Function

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










