
// Start Location :
var lat = 40.713;
var lon = -73.998;
var zoom = 13;


var map = new OpenLayers.Map("map");
/*
var ol_wms = new OpenLayers.Layer.WMS(
	"SitRepGIS Base Greater NYC - NEED TO FIX",
	"http://vmap0.tiles.osgeo.org/wms/vmap0",
	{layers: "basic"} 
);
var dm_wms = new OpenLayers.Layer.WMS(
	"Precinct Boundaries",
	"http://www2.dmsolutions.ca/cgi-bin/mswms_gmap",
	{
		layers: "bathymetry,land_fn,park,drain_fn,drainage," +
			"prov_bound,fedlimit,rail,road,popplace",
		transparent: "true",
		format: "image/png"
   },
   {isBaseLayer: false, visibility: false}
);
*/
//Add the Google Maps Layer for debug purposes only (don't
//forget to get rid of script src from html file.)

var gmap = new OpenLayers.Layer.Google( "Google Maps", {numZoomLevels: 20} );

// Add the precinct boundaries as a gml file for now.
var policePcts = new OpenLayers.Layer.GML("Precinct Boundaries", "data_public/PolicePctBoundaries.gml" ,{ isBaseLayer: false, projection: "EPSG:4326", visibility: false} );


//Add style for precincts :



map.addLayers( [  gmap  ]);

map.addLayers( [   policePcts ]);

map.addControl(new OpenLayers.Control.LayerSwitcher() );
//map.zoomToMaxExtent();

map.setOptions( 
	{ projection :  new OpenLayers.Projection("EPSG:900913") ,
	displayProjection : new OpenLayers.Projection("EPSG:4326") }
);
var lonlat = new OpenLayers.LonLat(lon, lat).transform(map.displayProjection, map.projection);
map.setCenter(lonlat , zoom ); 










