// srd_layer.js
////////////////////////////
// Javascript class srd_layer used for srd layers.
//
//
//
//
//////////////////////////////

//OpenLayers.ProxyHost = "/cgi-bin/proxy.cgi?url=";

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
		this.srd_layerGrid = null;

		this.tmpLayer = null;
		this.saveStrategy = null;
}

// srd_layer return the OpenLayer layer class.
srd_layer.prototype.getLayer = function() {
	return this.layer;	
}

// loadData <- bring in the vector data from whatever source is specifed
// right now only GML hopefully wfs-t real fucking soon.
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
		this.layer.loadGML();	
			return 0;
	} else if(type == "GML-WFST" ) {
		this.saveStrategy = new OpenLayers.Strategy.Save( ); //{ auto: true } );
    this.saveStrategy.events.register("success", '', showSuccessMsg);
    this.saveStrategy.events.register("fail", '', showFailureMsg);	


		this.tmpLayer = new OpenLayers.Layer.GML(name, source, settings);
		this.map.addLayer(this.tmpLayer);
		this.tmpLayer.loadGML();
		this.layer = new OpenLayers.Layer.Vector("STC Chokepoints - Load", {
			isBaseLayer: false,
			visibility: false,
			strategies: [ this.saveStrategy],
			projection: new OpenLayers.Projection("EPSG:4326"),
			protocol: new OpenLayers.Protocol.WFS({
				version: "1.1.0",
				srsName: "EPSG:4326",
				url: "https://SitRepGIS.local/cgi-bin/tinyows",
				featureType: "stcChokepoints",
				geometryName: "the_geom",
//				schema: "https://SitRepGIS.local/cgi-bin/tinyows?version=1.1.0&typename=public:stcChokepoints"
				schema: "https://SitRepGIS.local/cgi-bin/tinyows?DescribeFeatureType?version=1.1.0&typename=og:restricted"
        })
    }); 
		
//			this.layer.addFeatures( tmpLayer.features );			
	
			this.map.addLayer(this.layer);	
//			saveStrategy.save();
	
			return 0;
	} else if(type == "WFST" ) {
		this.layer = new OpenLayers.Layer.Vector("STC Chokepoints - Editable", {
			isBaseLayer: false,
			visibility: false,
			strategies: [new OpenLayers.Strategy.BBOX(), saveStrategy],
			projection: new OpenLayers.Projection("EPSG:31467"),
			protocol: new OpenLayers.Protocol.WFS({
				version: "1.1.0",
				srsName: "EPSG:31467",
				url: "https://SitRepGIS.local/cgi-bin/tinyows",
				featureNS :  "https://SitRepGIS.local/",
				featureType: "sr",
				geometryName: "stc_chokepoints",
				schema: "https://SitRepGIS.local/cgi-bin/tinyows?service=wfs&request=DescribeFeatureType&version=1.1.0&typename=tows:stc_chokepoints"
        })
    }); 
		
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
//	this.layer.events.register("loadend", this.layer, this.loadDataGrid() );
	

}; 
//// END srd_loadData  function



srd_layer.prototype.turnOnEvents = function () {
	this.layer.events.on( {
		"featureselected": function(e) { onFeatureSelect(e, this); },
		"featureunselected": function(e) {onFeatureUnselect(e, this); },
		"loadend": function(e) { loadDataGrid(e, this); }, 
		scope: this 
	} );
	if(this.tmpLayer != null) {

	this.tmpLayer.events.on( {
		"loadend": function(e) { loadWFS(e, this); }, 
		scope: this 
	} );
	
	}

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

//srd_layer.prototype.featureSelected(selFeature) {
//	}


onFeatureUnselect = function(evt, the_srd_layer) {
	var feature = evt.feature;
	this.map.removePopup(feature.popup);
	feature.popup.destroy();
	feature.popup = null;
};    

loadWFS = function(evt, the_srd_layer) {
	/// WFS testing :
		someFeatures = new Array();
		var i=0;
		for(i=0;i<the_srd_layer.tmpLayer.features.length;i++) {
				someFeatures[i] = the_srd_layer.tmpLayer.features[i].clone();
				someFeatures[i].state = OpenLayers.State.INSERT;
		}
		the_srd_layer.layer.addFeatures( someFeatures );
	/// END WFS TESTING.
}

	
loadDataGrid = function(evt, the_srd_layer) {
	if(the_srd_layer.saveStrategy != null) {
		the_srd_layer.saveStrategy.save();
	}
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
			if( propName != 'Lat' && propName != 'Lon' && propName != 'Latitude' && propName != 'Longitude') {
				the_srd_layer.srd_data[j][propName] = theFeatArr[j].attributes[propName];
				srd_layout[i] = { field: theFeatPropNames[i], name: theFeatPropNames[i], width: 'auto' };
				i++;
			}
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

	the_srd_layer.srd_layerGrid = new dojox.grid.DataGrid( {
		title: layer.name, 
		clientSort: true,
//		rowSelector: '20px',
		store:srd_LegacyDataStore ,
		structure: srd_tableLayout},
		document.createElement('div') );
	var i=0;
//	var theFeatArr = new Array( "", "", "");
	overlayTabContainer.addChild(the_srd_layer.srd_layerGrid);

//	layerTab.set('content', "TEST"+layer.features[0].attributes['Post_Number']+"END");
//	overlayTabContainer.addChild(layerTab);

	dojo.connect(the_srd_layer.srd_layerGrid, "onRowDblClick", the_srd_layer, the_srd_layer.selectFeature );

};


// this is going to be called by DataGrid -> onRowDblClick.  Event will be passed with 
// ref to the grid, cell and rowIndex
srd_layer.prototype.selectFeature = function(e) {
//	alert(e.rowIndex);
	var item = this.srd_layerGrid.getItem( e.rowIndex );
	this.selectedFeature  = this.layer.getFeatureByFid(item.fid);
	var thePoint = this.selectedFeature.geometry;
	var thelat = thePoint.y;
	var thelon = thePoint.x;
	var lonlat = new OpenLayers.LonLat(thelon, thelat).transform(map.projection, map.projection);
	this.map.panTo(lonlat );

	selectControl.select(this.selectedFeature);		


};


// TO FIX using for wfs-t debugging right now.
function showMsg(szMessage) {
	alert(szMessage);
}

function showSuccessMsg(){
    showMsg("Transaction successfully completed");
};

function showFailureMsg(){
    showMsg("An error occured while operating the transaction");
};










