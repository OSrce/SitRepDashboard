// srd_view_map.js
////////////////////////////////
// MAP VIEW CLASS
//
//
//
//
//
/////////////////////////////////

//srd_view_map class definition using dojo.declare 
dojo.declare( 
	'srd_view_map',
	srd_view,
	{
		// MAP VARIABLES 
		map : null,
		srd_layerArr : null,
		//CONSTUCTOR
		constructor : function( view_data, parent_srd_doc) {
			console.log("srd_view_map constructor called!");
			this.srd_doc = parent_srd_doc;
			this.map = this.srd_doc.map;
			this.srd_layerArr = this.srd_doc.srd_layerArr;
			if(view_data.type == "map") {
				this.containerStyle = 'height:100%;width:100%;background-color:blue;';
			}
			this.container = new dijit.layout.BorderContainer({
				style: this.containerStyle,
				region: 'center',
			} ); 

			this.srd_mapContent = new dijit.layout.ContentPane(
	     {  splitter: 'false', style: "background-color:white;border:0px;margin:0px;padding:0px;", region: 'center', content: '<div id="srd_docContent" class="map"></div>' }, 'srd_center');
			this.container.addChild(this.srd_mapContent);

			this.srd_doc.viewContainer.addChild(this.container);
			this.map_init();
		},
		map_init : function() {
			if(this.map == null) {
				this.map = new OpenLayers.Map("srd_docContent", { 
					controls: [
						new OpenLayers.Control.Navigation(),
						new OpenLayers.Control.PanZoomBar(),
						new OpenLayers.Control.Attribution(),
						new OpenLayers.Control.KeyboardDefaults()
					],
					projection : "EPSG:900913",
					displayProjection: "EPSG:4326"
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

	console.log("END map_init function");

		

		}

	}
);






