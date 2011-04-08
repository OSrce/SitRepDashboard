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
		this.modifyControl = null;
		this.selectedFeature = null;
		this.srd_data = new Array();
		this.srd_LayerStore = null;
		this.srd_layerGrid = null;

		this.tmpLayer = null;
		this.saveStrategy = null;

		this.srd_mapDefault = new OpenLayers.Style( { 
			fillColor: "#FF0000",
			fillOpacity: 0.6,
			strokeColor: "#FF0000",
			strokeOpacity: 1,
			pointRadius: 6
		} ); 

		this.srd_mapGreen = new OpenLayers.Style( { 
			fillColor: "#00FF00",
			fillOpacity: 0.6,
			strokeColor: "#00FF00",
			strokeOpacity: 1,
			pointRadius: 6
		} ); 

		this.srd_mapBlue = new OpenLayers.Style( { 
			fillColor: "#0000FF",
			fillOpacity: 0.6,
			strokeColor: "#0000FF",
			strokeOpacity: 1,
			pointRadius: 6
		} ); 

		this.srd_styleMap =  new OpenLayers.StyleMap( { 
			'default': this.srd_mapDefault, 
			'mapGreen': this.srd_mapGreen,
			'mapBlue': this.srd_mapBlue } );

		
		this.lookupStatus = {
				null : {
					fillColor: "#FF0F00",
					fillOpacity: 0.6,
					strokeColor: "#FF0000",
					strokeOpacity: 1,
					pointRadius: 6
				},
				'Default' : {	
					fillColor: "#FF0000",
					fillOpacity: 0.6,
					strokeColor: "#FF0000",
					strokeOpacity: 1,
					pointRadius: 6
				},
				'Clear' : {
					fillColor: "#00FF00",
					fillOpacity: 0.6,
					strokeColor: "#00FF00",
					strokeOpacity: 1,
					pointRadius: 6
				},
				'Pending' : {  
					fillColor: "#0000FF",
					fillOpacity: 0.6,
					strokeColor: "#0000FF",
					strokeOpacity: 1,
					pointRadius: 6
				}
	};


		this.srd_styleMap.addUniqueValueRules("default", "srd_status", this.lookupStatus);



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


//TESTING Add style for chokepoints:
var stc_style_def =  new OpenLayers.Style( { 
	fillColor: "#FF0000",
	fillOpacity: 0.6,
	strokeColor: "#FF0000",
	strokeOpacity: 1,
	pointRadius: 6
} ); 
var stc_styleMap = new OpenLayers.StyleMap( {'default':  stc_style_def } );


	if(type == "GML" ) {
		this.layer = new OpenLayers.Layer.GML(name, source, settings);
//		this.layer = new OpenLayers.Layer.GML("NYPD Passenger Vehicle Interdiction", "data_sensitive/NYPD_VEH_INTERDICTION_PASSENGER.gml" ,{ isBaseLayer: false, projection: "EPSG:4326", visibility: false} );
		this.map.addLayer( this.layer );
		this.layer.loadGML();	
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
	
	} else if(type == "WFST" ) {

		this.saveStrategy = new OpenLayers.Strategy.Save( ); //{ auto: true } );
    this.saveStrategy.events.register("success", '', showSuccessMsg);
    this.saveStrategy.events.register("fail", '', showFailureMsg);	

		this.layer = new OpenLayers.Layer.Vector(name, {
			isBaseLayer: false,
			visibility: false,
			styleMap: this.srd_styleMap,
			strategies: [ new OpenLayers.Strategy.BBOX(), this.saveStrategy ],
			projection: new OpenLayers.Projection("EPSG:4326"),
			protocol: new OpenLayers.Protocol.WFS({
				version: "1.0.0",
				srsName: "EPSG:4326",
//				srsName: "http://www.opengis.net/gml/srs/epsg.xml#4326",
				url: "http://SitRepGIS.local/geoserver/wfs",
				featureNS :  "http://SitRepGIS.local/",
				featureType: source,
//				geometryName: "the_geom",
//				extractAttributes: true,
				schema: "http://SitRepGIS.local/geoserver/wfs/DescribeFeatureType?typename=sr_data:stc3"
        })
    }); 





			this.map.addLayer(this.layer);	
	
	}

	this.modifyControl = new OpenLayers.Control.ModifyFeature(this.layer,
								{ mode: OpenLayers.Control.ModifyFeature.DRAG } );
	this.map.addControl(this.modifyControl);
	this.modifyControl.activate();



	//Adding the Control to allow for points to be selected and moved 
//	this.dragControl = new OpenLayers.Control.DragFeature( this.layer ); 
//	this.map.addControl(dragControl);
/*
	// Adding select control for layer
	this.selectControl = new OpenLayers.Control.SelectFeature(this.layer,
                {onSelect: this.onFeatureSelect, onUnselect: this.onFeatureUnselect});
	this.map.addControl(this.selectControl);
	this.selectControl.activate();

*/
//	this.layer.events.register("loadend", this.layer, this.loadDataGrid() );
	
	return 0;
}; 
//// END srd_loadData  function



srd_layer.prototype.turnOnEvents = function () {
	this.layer.events.on( {
		"featureselected": function(e) { onFeatureSelect(e, this); },
		"featureunselected": function(e) {onFeatureUnselect(e, this); },
		"loadend": function(e) { loadDataGrid(e, this); }, 
		"featureadded": function(e) { featureAdded(e,this); },
		"featureadded": function(e) { featureAdded(e,this); },
		scope: this 
	} );
	if(this.tmpLayer != null) {

	this.tmpLayer.events.on( {
		"loadend": function(e) { loadWFS(e, this); }, 
		scope: this 
	} );
	
	}

};


// BEGIN GLOBAL FUNC onFeatureSelect
onFeatureSelect = function(evt, the_srd_layer) {
	this.selFeature = evt.feature;
/*	var postNum = selFeature.attributes.Post_Number;
	var patrolBoro = selFeature.attributes['Patrol_Boro']; 
	var postDesc = selFeature.attributes['Post_Description'];
	var postLat = selFeature.attributes['Lat'];
	var postLon = selFeature.attributes['Lon'];
*/
	var theAttString = "";
	for(var propName in this.selFeature.attributes ) {
		theAttString += propName+": "+this.selFeature.attributes[propName]+"<br>";
	}
	popup = new OpenLayers.Popup.FramedCloud("chicken", 
		selFeature.geometry.getBounds().getCenterLonLat(),
		null,
		"<div style='font-size:.8em'>"+theAttString+"</div>",
		null, true );  
	selFeature.popup = popup;
	
	this.map.addPopup(popup);

		if( this.selFeature.attributes.srd_status == 'Default') {
			this.selFeature.attributes.srd_status = 'Pending';
		} else  if( this.selFeature.attributes.srd_status == 'Pending') {
			this.selFeature.attributes.srd_status = 'Clear';
		} else  if( this.selFeature.attributes.srd_status == 'Clear') {
			this.selFeature.attributes.srd_status = 'Default';
		} else {
			this.selFeature.attributes.srd_status = 'Default';
		}
		the_srd_layer.layer.redraw();

};
//END GLOBAL FUNC onFeatureSelect



//BEGIN GLOBAL FUNC onFeatureUnselect
onFeatureUnselect = function(evt, the_srd_layer) {
	var feature = evt.feature;
	this.map.removePopup(feature.popup);
	feature.popup.destroy();
	feature.popup = null;
};    
//END GLOBAL FUNC onFeatureUnselect

//NO LONGER CALLED...
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
///END TO REMOVE.


// this is going to be called by DataGrid -> onRowDblClick.  Event will be passed with 
// ref to the grid, cell and rowIndex
srd_layer.prototype.selectFeature = function(e) {
	var item = this.srd_layerGrid.getItem( e.rowIndex );
	this.selectedFeature  = this.layer.getFeatureByFid(item.fid);
	var thePoint = this.selectedFeature.geometry;
	var thelat = thePoint.y;
	var thelon = thePoint.x;
	var lonlat = new OpenLayers.LonLat(thelon, thelat).transform(map.projection, map.projection);
	this.map.panTo(lonlat );

	if( this.layer.getVisibility() == false) {
		this.layer.setVisibility(true);
	}
	selectControl.select(this.selectedFeature);		

};




// BEGIN GLOBAL FUNC loadDataGrid	
loadDataGrid = function(evt, the_srd_layer) {
	if(the_srd_layer.saveStrategy != null) {
//		the_srd_layer.saveStrategy.save();
	}
	var overlayTabContainer = dijit.byId("overlayTabContainer");
//	var layerTab = new dijit.layout.ContentPane();
//	layerTab.set('title', 'debugging');

	var layer = the_srd_layer.layer;

/// DESCRIBING HOW THE dojox.data.grid "spreadsheet"  should look.

	
	var theFeatArr = layer.features;
	var theFeatPropNames = {};
	var srd_layout = new Array();
	var srd_tableLayout = new Array();
	srd_tableLayout[0] = { cells: new Array() }; 
	alert("Load complete Number of features:"+layer.features.length);
	var j=0;
	for(j=0;j<theFeatArr.length;j++) {
		if( !theFeatArr[j].attributes.srd_status) {
			theFeatArr[j].attributes.srd_status = 'Default';
			theFeatArr[j].state =  OpenLayers.State.UPDATE;
		}
		if( !theFeatArr[j].attributes.srd_description) {
			theFeatArr[j].attributes.srd_description = 'None';
			theFeatArr[j].state =  OpenLayers.State.UPDATE;
		}
		if( !theFeatArr[j].attributes.srd_notes) {
			theFeatArr[j].attributes.srd_notes = 'None';
			theFeatArr[j].state =  OpenLayers.State.UPDATE;
		}
		

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

	if(the_srd_layer.srd_LayerStore == null) {

		the_srd_layer.srd_LayerStore = new dojo.store.Memory( { 
			idProperty: 'fid', 
			data: the_srd_layer.srd_data,
			features: { 'dojo.data.api.Read': true,
									'dojo.data.api.Write': true } 
			} );
		}

//alert( "TEST:" + 	srd_LayerStore.get('F1') +":TEST" );
	
	/// Utility Adapter for using dojo.store.Memory objects where dojo.data. objects are needed.
	var srd_LegacyDataStore =  new dojo.data.ObjectStore({ objectStore: the_srd_layer.srd_LayerStore});

	the_srd_layer.srd_layerGrid = new dojox.grid.DataGrid( 
		{
			title: layer.name, 
			clientSort: true,
//			rowSelector: '20px',
			store:srd_LegacyDataStore ,
			structure: srd_tableLayout
		},
		document.createElement('div')
	);
	var i=0;
//	var theFeatArr = new Array( "", "", "");
	overlayTabContainer.addChild(the_srd_layer.srd_layerGrid);

//	layerTab.set('content', "TEST"+layer.features[0].attributes['Post_Number']+"END");
//	overlayTabContainer.addChild(layerTab);

	dojo.connect(the_srd_layer.srd_layerGrid, "onRowDblClick", the_srd_layer, the_srd_layer.selectFeature , true);

};
//END GLOBAL FUNC loadDataGrid
//

// TO FIX using for wfs-t debugging right now.
function showMsg(szMessage) {
//	alert(szMessage);
}

function showSuccessMsg(){
    showMsg("Transaction successfully completed");
};

function showFailureMsg(){
//    showMsg("An error occured while operating the transaction");
};


function featureAdded(evt, the_srd_layer) {
	if(!evt.feature.attributes.srd_status) {
		evt.feature.attributes.srd_status = 'Default';
		evt.feature.attributes.srd_description = 'DefaultDesc';
		evt.feature.attributes.srd_notes = 'DefaultNotes';
	
//		evt.feature.fid = 1;
//		evt.feature.attributes.gid = 1;
		evt.feature.gid = 1;
		alert ("FID="+evt.feature.fid);		
		if(evt.feature.state != OpenLayers.State.INSERT) {
			evt.feature.state = OpenLayers.State.UPDATE;
		}
		the_srd_layer.layer.redraw();
	}
};


srd_layer.prototype.onFeatureInserted = function(insertedFeature) {
		alert ("onFeatureInsert FID="+evt.feature.fid);		
	if(!insertedFeature.attributes.srd_status) {
		insertedFeature.attributes.srd_status = 'Default';
	}
	if(!insertedFeature.attributes.srd_description) {
		insertedFeature.attributes.srd_description = 'Default';
	}
	if(!insertedFeature.attributes.srd_notes) {
		insertedFeature.attributes.srd_notes = 'Default';
	}
	var propName ="";
	for(propName in this.layer.features[0].attributes ) {
		if(!insertedFeature.attributes.propName) {
			alert("prop without "+propName);
			insertedFeature.attributes.propName = "";
			if(insertedFeature.state != OpenLayers.State.INSERT) {
				insertedFeature.state = OpenLayers.State.UPDATE;
			}
		}
	}

};





