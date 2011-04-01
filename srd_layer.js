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
		this.srd_data = new Array();
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


}; 
//// END srd_loadData  function



srd_layer.prototype.turnOnEvents = function () {
	this.layer.events.on( {
		"featureselected": function(e) { onFeatureSelect(e, this); },
		"featureunselected": function(e) {onFeatureUnselect(e, this); },
		"loadend": function(e) { loadDataGrid(e, this); }, 
		scope: this 
	} );

};



onFeatureSelect = function(evt, the_srd_layer) {
	this.selFeature = evt.feature;
	var postNum = selFeature.attributes.Post_Number;
	var patrolBoro = selFeature.attributes['Patrol_Boro']; 
	var postDesc = selFeature.attributes['Post_Description'];
	var postLat = selFeature.attributes['Lat'];
	var postLon = selFeature.attributes['Lon'];
	popup = new OpenLayers.Popup.FramedCloud("chicken", 
		selFeature.geometry.getBounds().getCenterLonLat(),
		null,
		"<div style='font-size:.8em'>Post: " + postNum +"<br />Patrol Boro: " + patrolBoro+"<br/> Location: "+postDesc +"<br/> Lat/Lon: "+postLat+"/"+postLon +"</div>",
		null, true );  
	selFeature.popup = popup;
	this.map.addPopup(popup);

	

};


onFeatureUnselect = function(evt, the_srd_layer) {
	var feature = evt.feature;
	this.map.removePopup(feature.popup);
	feature.popup.destroy();
	feature.popup = null;
};    
	
loadDataGrid = function(evt, the_srd_layer) {
	var overlayTabContainer = dijit.byId("overlayTabContainer");
	var layerTab = new dijit.layout.ContentPane();
	layerTab.set('title', 'debugging');

	var layer = the_srd_layer.layer;

/// DESCRIBING HOW THE dojox.data.grid "spreadsheet"  should look.

	
	var theFeatArr = layer.features;
	var theFeatPropNames = {};
	var srd_layout = new Array();
	var srd_tableLayout = new Array();
	srd_tableLayout[0] = { cells: new Array() }; 
	var j=0;
	for(j=0;j<theFeatArr.length;j++) {
		the_srd_layer.srd_data[j] = new Array();
		the_srd_layer.srd_data[j].fid = theFeatArr[j].fid;
		var i=0;
		for(var propName in theFeatArr[j].attributes ) {
			theFeatPropNames[i] = propName;
			the_srd_layer.srd_data[j][propName] = theFeatArr[j].attributes[propName];
			srd_layout[i] = { field: theFeatPropNames[i], name: theFeatPropNames[i], width: 'auto' };
			i++;
		}
	}
	srd_tableLayout[0].cells = srd_layout; 
	var srd_LayerStore = new dojo.store.Memory( { 
		idProperty: 'fid', 
		data: the_srd_layer.srd_data,
		features: { 'dojo.data.api.Read': true,
								'dojo.data.api.Write': true } 
	} );

//alert( "TEST:" + 	srd_LayerStore.get('F1') +":TEST" );
	
	/// Utility Adapter for using dojo.store.Memory objects where dojo.data. objects are needed.
	var srd_LegacyDataStore =  new dojo.data.ObjectStore({ objectStore: srd_LayerStore});

	var layerGrid = new dojox.grid.DataGrid( {
		title: layer.name, 
		clientSort: true,
//		rowSelector: '20px',
		store:srd_LegacyDataStore ,
		structure: srd_tableLayout},
		document.createElement('div') );
	var i=0;
//	var theFeatArr = new Array( "", "", "");
	overlayTabContainer.addChild(layerGrid);

//	layerTab.set('content', "TEST"+layer.features[0].attributes['Post_Number']+"END");
//	overlayTabContainer.addChild(layerTab);

};

/*
srd_LayerStore.prototype.get(theID) {
	
	
}
*/







