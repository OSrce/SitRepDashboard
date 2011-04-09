
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
	"http://SitRepGIS.local:3001/osm_tiles/${z}/${x}/${y}.png",
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


//Testing purposes only, we're going to move this to its own file soon.
/*
stc_chokepoints = new OpenLayers.Layer.Vector("NYPD STC Chokepoints", {
	strategies: [ 
		new OpenLayers.Strategy.Fixed(),
		new OpenLayers.Strategy.Save({auto:true}) 
	],
	protocol: new OpenLayers.Protocol.HTTP( {
		url: "data_sensitive/NYPD_STC_CHOKEPOINTS.gml",
		format: new OpenLayers.Format.GML( {
			extractAttributes: true
		} ) 
	} ),
	isBaseLayer: false,
	projection: "EPSG:4326",
	visibility: true,
	styleMap: stc_styleMap  
} );
*/

var stc_chokepoints = new srd_layer(map); 
stc_chokepoints.loadData("WFST", "NYPD STC Chokepoints", "stc_chokepoints" ,{ isBaseLayer: false, projection: "EPSG:4326", visibility: false} );

var stc_maritime = new srd_layer(map); 
stc_maritime.loadData("WFST", "NYPD STC Maritime", "stc_maritime" ,{ isBaseLayer: false, projection: "EPSG:4326", visibility: false} );

var stc_transit = new srd_layer(map); 
stc_transit.loadData("WFST", "NYPD STC Transit", "stc_transit" ,{ isBaseLayer: false, projection: "EPSG:4326", visibility: false} );


var stc1 = new srd_layer(map); 
stc1.loadData("WFST", "STC Exercise Day 1", "stc1" ,{ isBaseLayer: false, projection: "EPSG:4326", visibility: false} );

var stc2 = new srd_layer(map); 
stc2.loadData("WFST", "STC Exercise Day 2", "stc2" ,{ isBaseLayer: false, projection: "EPSG:4326", visibility: false} );

var stc3 = new srd_layer(map); 
stc3.loadData("WFST", "STC Exercise Day 3", "stc3" ,{ isBaseLayer: false, projection: "EPSG:4326", visibility: false} );

var stc4 = new srd_layer(map); 
stc4.loadData("WFST", "STC Exercise Day 4", "stc4" ,{ isBaseLayer: false, projection: "EPSG:4326", visibility: false} );

var stc5 = new srd_layer(map); 
stc5.loadData("WFST", "STC Exercise Day 5", "stc5" ,{ isBaseLayer: false, projection: "EPSG:4326", visibility: false} );


var nypd_veh_inter_com = new srd_layer(map); 
nypd_veh_inter_com.loadData("WFST", "NYPD Commercial Vehicle Interdiction", "nypd_veh_inter_com" ,{ isBaseLayer: false, projection: "EPSG:4326", visibility: false} );

var nypd_veh_inter_pas = new srd_layer(map);
nypd_veh_inter_pas.loadData("WFST", "NYPD Passenger Vehicle Interdiction", "nypd_veh_inter_pas" ,{ isBaseLayer: false, projection: "EPSG:4326", visibility: false} );

//stc_chokepoints.events.register( "loadend", stc_chokepoints,showLayerData(stc_chokepoints));


// Adding the Control for the Layer select 
map.addControl(new OpenLayers.Control.LayerSwitcher() );
//Adding control for tracking mouse movement 
map.addControl(new OpenLayers.Control.MousePosition( {  
	displayProjection: new OpenLayers.Projection("EPSG:4326")
} ) );



var sr_dynamicLayers = { 
	"NYPD STC Chokepoints": stc_chokepoints,
	"NYPD STC Maritime Locations": stc_maritime,
	"NYPD STC Transit Locations": stc_transit,
	"STC Exercise Day 1": stc1,
	"STC Exercise Day 2": stc2,
	"STC Exercise Day 3": stc3,
	"STC Exercise Day 4": stc4,
	"STC Exercise Day 5": stc5,
	"NYPD Commercial Vehicle Interdiction": nypd_veh_inter_com,	
	"NYPD Passenger  Vehicle Interdiction": nypd_veh_inter_pas
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


var drawLayer = stc5.layer;
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
					
					var editLayerSelect = new dijit.form.FilteringSelect( {
						id: "layerEditSelect",
						name: "layerEditSel",
						value: "NONE SELECTED",
						store: srd_layerStore,
						searchAttr: "name"
						}, "layerEditSelect"
					);


//stc_chokepoints.afterAdd(showLayerData(stc_chokepoints));
//dragControl.activate();

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










