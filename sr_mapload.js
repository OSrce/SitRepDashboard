
var map ;
var selectControl;

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


//Add the Google Maps Layer for debug purposes only (don't
//forget to get rid of script src from html file.)
var gMapLayer = new OpenLayers.Layer.Google( "Google Maps", {numZoomLevels: 20} );

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
map.addLayers( [ srMapLayer,  gMapLayer, osmMapLayer]);
map.addLayers( [   policePcts ]);


//TESTING Add style for chokepoints:
var stc_style_def =  new OpenLayers.Style( { 
	fillColor: "#FF0000",
	fillOpacity: 0.6,
	strokeColor: "#FF0000",
	strokeOpacity: 1,
	pointRadius: 6
} ); 
var stc_styleMap = new OpenLayers.StyleMap( {'default':  stc_style_def } );


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
stc_chokepoints.loadData("WFST", "NYPD STC Chokepoints", "data_sensitive/NYPD_STC_CHOKEPOINTS.gml" ,{ isBaseLayer: false, projection: "EPSG:4326", visibility: false, styleMap: stc_styleMap} );

var nypd_veh_inter_com = new srd_layer(map); 
nypd_veh_inter_com.loadData("GML", "NYPD Commercial Vehicle Interdiction", "data_sensitive/NYPD_VEH_INTERDICTION_COMMERCIAL.gml" ,{ isBaseLayer: false, projection: "EPSG:4326", visibility: false} );

var nypd_veh_inter_pas = new srd_layer(map);
nypd_veh_inter_pas.loadData( "GML", "NYPD Passenger Vehicle Interdiction", "data_sensitive/NYPD_VEH_INTERDICTION_PASSENGER.gml" ,{ isBaseLayer: false, projection: "EPSG:4326", visibility: false} ); 

//stc_chokepoints.events.register( "loadend", stc_chokepoints,showLayerData(stc_chokepoints));


// Adding the Control for the Layer select 
map.addControl(new OpenLayers.Control.LayerSwitcher() );
//Adding control for tracking mouse movement 
map.addControl(new OpenLayers.Control.MousePosition( {  
	displayProjection: new OpenLayers.Projection("EPSG:4326")
} ) );



var dynamicLayers = { 
	"NYPD STC Chokepoints": stc_chokepoints,
	"NYPD Commercial Vehicle Interdiction": nypd_veh_inter_com,	
	"NYPD Passenger  Vehicle Interdiction": nypd_veh_inter_pas	
};


selectControl = new OpenLayers.Control.SelectFeature( 
	[ stc_chokepoints.getLayer(), nypd_veh_inter_com.getLayer(), nypd_veh_inter_pas.getLayer() ],
	{
		clickout: true, toggle: false,
		multiple: false, hover: false,
		toggleKey: "ctrlKey", // ctrl key removes from selection
		multipleKey: "shiftKey" // shift key adds to selection
	}
);
map.addControl(selectControl);
//selectControl.activate();


stc_chokepoints.turnOnEvents();
nypd_veh_inter_com.turnOnEvents();
nypd_veh_inter_pas.turnOnEvents();

//Add the events we wish to register
//map.events.register("mousemove", map, function(e) {
//	var position = this.events.getMousePosition(e);
//	OpenLayers.Util.getElement("coords").innerHTML = position;
//});

var panel = new OpenLayers.Control.Panel( {
        'displayClass': 'customEditingToolbar',
				div: document.getElementById('editToolsPanel') 
}
    );



var save = new OpenLayers.Control.Button({
        title: "Save Changes",
        trigger: function() {
            if(edit.feature) {
                edit.selectControl.unselectAll();
            }
            stc_chokepoints.saveStrategy.save();
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


//stc_chokepoints.afterAdd(showLayerData(stc_chokepoints));
//dragControl.activate();

}
/// END init Function

// activate 
function activateDrag() {
	dragControl.activate();
}









