// srd_layer.js
////////////////////////////
// Javascript class srd_layer used for srd layers.
//
//
//
//
//////////////////////////////

//srd_layer constructor 
function srd_layer( map ) {
		this.map = 	map;
		this.layer = null;
		this.settings = { isBaseLayer: false, projection: "EPSG:4326", visibility: false };
		this.source = null;
		this.name = "Unnamed Layer";
		this.selectControl = null;
		this.selectedFeatures = null;
		this.dragControl = null;
		this.selectedFeature = null;
}

// srd_layer return the OpenLayer layer class.
srd_layer.prototype.getLayer = function() {
	return this.layer;	
}


srd_layer.prototype.loadData = function(type, name, source, settings ) { 
	if( settings ) {
		this.settings = settings;
	}
	if (name) {
		this.name = name;
	}
	if( !source ) {
		return -1;
	}		
	

	if(type == "GML" ) {
		this.layer = new OpenLayers.Layer.GML(name, source, settings);
//		this.layer = new OpenLayers.Layer.GML("NYPD Passenger Vehicle Interdiction", "data_sensitive/NYPD_VEH_INTERDICTION_PASSENGER.gml" ,{ isBaseLayer: false, projection: "EPSG:4326", visibility: false} );
		this.map.addLayer( this.layer );
			return 0;
	}

	//Adding the Control to allow for points to be selected and moved 
//	this.dragControl = new OpenLayers.Control.DragFeature( this.layer ); 
//	this.map.addControl(dragControl);
/*
	// Adding select control for layer
	this.selectControl = new OpenLayers.Control.SelectFeature(this.layer,
                {onSelect: this.onFeatureSelect, onUnselect: this.onFeatureUnselect});
	this.map.addControl(this.selectControl);
	this.selectControl.activate();

//	this.modifyControl = new OpenLayers.Control.ModifyFeature(this.layer,
//								{ mode: OpenLayers.Control.ModifyFeature.DRAG,
//									standalone: true } );
//	this.map.addControl(this.modifyControl);
//	this.modifyControl.activate();

*/
	this.layer.events.register("loadend", this.layer, this.loadDataGrid() );

	this.layer.events.on( {
		"featureselected": function(e) {
			this.onFeatureSelect(e);
		},
		"featureunselected": function(e) {
			this.onFeatureUnselect(e);
		} 
	} );


}; 
//// END srd_loadData  function



srd_layer.prototype.onPopupClose = function(evt) {
	this.selectControl.unselect(selectedFeature);
};

srd_layer.prototype.onFeatureSelect = function(feature) {
	this.selectedFeature = feature;
	var postNum = feature.attributes['Post_Number'];
	alert("PostNum:"+postNum+" = Selected");
	var patrolBoro = feature.attributes['Patrol_Boro']; 
	var postDesc = feature.attributes['Post_Description'];
	var postLat = feature.attributes['Lat'];
	var postLon = feature.attributes['Lon'];
	popup = new OpenLayers.Popup.FramedCloud("chicken", 
		feature.geometry.getBounds().getCenterLonLat(),
		null,
		"<div style='font-size:.8em'>Post: " + postNum +"<br />Patrol Boro: " + patrolBoro+"<br/> Location: "+postDesc +"<br/> Lat/Lon: "+postLat+"/"+postLon +"</div>",
		null, true, onPopupClose);
	feature.popup = popup;
	this.map.addPopup(popup);
};

srd_layer.prototype.onFeatureUnselect = function(feature) {
	this.map.removePopup(feature.popup);
	feature.popup.destroy();
	feature.popup = null;
};    
	
srd_layer.prototype.loadDataGrid = function() {
	var overlayTabContainer = dijit.byId("overlayTabContainer");
	var layerTab = new dijit.layout.ContentPane();
	layerTab.set('title', 'debugging');

/// DESCRIBING HOW THE dojox.data.grid "spreadsheet"  should look.
	var srd_tableLayout = [{
		field: 'PostNum',
		name: 'Post Number',
		width: '100px'
	}, {
		field: 'PatrolBoro',
		name: 'Patrol Boro',
		width: '100px'
	}, { 
		field: 'Location',
		name: 'Location',
		width: '100px'
	}, { 
		field: 'Latitude',
		name: 'Latitude',
		width: '100px'
	}, { 
		field: 'Longitude',
		name: 'Longitude',
		width: '100px'
	} ];

	var layerGrid = new dojox.grid.DataGrid( {
		title: layer.name, 
		clientSort: true,
		rowSelector: '20px',
		structure: srd_tableLayout},
		document.createElement('div') );
	var i=0;
	var theFeatArr = layer.features;
//	var theFeatArr = new Array( "", "", "");
	for(i=0;i<theFeatArr.length;i++) {
		var tmpFeat = layer.features[i];
		layerGrid.addRow( tmpFeat.attributes );	
	}
	overlayTabContainer.addChild(layerGrid);

	layerTab.set('content', "TEST"+this.layer.features+"END");
	overlayTabContainer.addChild(layerTab);

};










