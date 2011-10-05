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
function srd_layer( ) {
		this.map = 	null;  //OpenLayers Map Class.
		this.layer = null; //OpenLayers Layer Class.
		

//		this.settings = { isBaseLayer: false, projection: "EPSG:4326", visibility: false };
		this.source = null;


// All of the values from the settings.xml file:
		this.name = null;
		this.id = null;
		this.layertype = null;
		this.format = null;
		this.isBaseLayer = null;
		this.projection = null;
		this.visibility = null;
		this.sphericalMercator = null;
		this.url = null;
		this.numZoomLevels = null;
		this.attribution = "";
		this.editable = false;

		// NEED TO CHANGE THIS!
		this.runFromServer = false;
// End section in settings.xml (for now).	


		this.selectControl = null;
		this.selectedFeatures = null;
		this.modifyControl = null;
		this.selectedFeature = null;
		this.srd_data = new Array();
		this.srd_LayerStore = null;
		this.srd_layerGrid = null;

		this.tmpLayer = null;
		this.saveStrategy = null;
		this.refreshStrategy = null;
		this.srd_styleMap = null; 


		// CONTROL FUNCTIONS FOR EDITING LAYER
		this.srd_drawControls = {
			point		:	null,
			line		:	null,
			polygon	:	null,
			remove	:	null,
			select	:	null
		}

}

srd_layer.prototype.copyValuesFromLayer = function(the_srd_layer) {
	for( var layerVal in the_srd_layer) {
		if(layerVal == "srd_styleMap" ) {
			if( the_srd_layer.srd_styleMap != null) {
				for(var theStyleName in the_srd_layer.srd_styleMap.styles) {
//					console.log("Copying Style ="+theStyleName);
					this.copyStyle(theStyleName,the_srd_layer.srd_styleMap.styles[theStyleName]);
				} 
			}
		} else { 
			this[layerVal] = the_srd_layer[layerVal];
		}
	}	
	return;
}


// srd_layer return the OpenLayer layer class.
srd_layer.prototype.getLayer = function() {
	return this.layer;	
}

srd_layer.prototype.addLayerToMap = function(theMap) {
	this.map = theMap; 
	this.map.addLayer( this.layer );
}


// loadData <- bring in the vector data from whatever source is specifed
// right now only GML hopefully wfs-t real fucking soon.
srd_layer.prototype.loadData = function( ) { 
//srd_layer.prototype.loadData = function(type, name, source, settings ) { 

	if( this.layertype == "XYZ" ) {
		console.log("XYZ Layer Created : "+this.name+":::"+this.url+":::");
		this.layer = new OpenLayers.Layer.XYZ ( 
			this.name,
//				"test",
//				'http://otile1.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png',
			this.url,
			{
				attribution:				"<img src='img/SitRepLogo_Tiny.png' height='25' width='60'><br> "+this.attribution,
				sphericalMercator: 	this.sphericalMercator
			} 
		);
	} else if (this.layertype == "Vector" ) {


// BEGIN MESSY STYLE RULE CODE
		if(this.srd_styleMap == null) {
			this.srd_styleMap = new OpenLayers.StyleMap();
		}
		var tmpSymbolizer = this.srd_styleMap.styles["default"].defaultStyle;
		var mainRule = new OpenLayers.Rule( { symbolizer: tmpSymbolizer} );
		this.srd_styleMap.styles["default"].addRules( [mainRule] );
// END MESSY STYLE RULE CODE


		if(this.format == "GML" ) {
			if( this.runFromServer == false ) {
				console.log("Create GML Layer="+this.name+"===");
				this.layer = new OpenLayers.Layer.GML(this.name, this.url, { 
					isBaseLayer:	this.isBaseLayer,
//					projection:		this.projection,
					projection:		new OpenLayers.Projection(this.projection),
					visibility:		this.visibility, 
					styleMap:			this.srd_styleMap
				} );
				this.layer.loadGML();	
			} else {
				this.layer = new OpenLayers.Layer.Vector(this.name, {
					isBaseLayer:	this.isBaseLayer,
//					projection:		this.projection,
					projection:		new OpenLayers.Projection(this.projection),
					visibility:		this.visibility,
					styleMap:			this.srd_styleMap,
					strategies:		[new OpenLayers.Strategy.Fixed()],
					protocol: 		new OpenLayers.Protocol.HTTP( {
						url:			this.url,
						format:		new OpenLayers.Format.GML()
					} )
				} );
			}
		} else if(this.format == "WFST" ) {
			this.saveStrategy = new OpenLayers.Strategy.Save( ); //{ auto: true } );
 			this.saveStrategy.events.register("success", '', showSuccessMsg);
			this.saveStrategy.events.register("fail", '', showFailureMsg);	
//		this.refreshStrategy = new OpenLayers.Strategy.Refresh({force: true, interval: 10000});

			this.layer = new OpenLayers.Layer.Vector(this.name, {
				isBaseLayer: this.isBaseLayer,
				visibility: this.visibility,
				styleMap: this.srd_styleMap,
				strategies: [ new OpenLayers.Strategy.Fixed(), this.saveStrategy],
//				projection: new OpenLayers.Projection("EPSG:4326"),
				projection: new OpenLayers.Projection("EPSG:900913"),
				protocol: new OpenLayers.Protocol.WFS({
				version: "1.1.0",
//				srsName: "EPSG:4326",
				srsName: "EPSG:900913",
				url: "http://SitRepGIS.local/geoserver/wfs",
				featureNS :  "http://SitRepGIS.local/",
				featureType: this.name
//				geometryName: "the_geom",
//				extractAttributes: true,
        })
    }); 
		}

//		this.modifyControl = new OpenLayers.Control.ModifyFeature(this.layer,
//								{ mode: OpenLayers.Control.ModifyFeature.DRAG } );
//		this.map.addControl(this.modifyControl);
//		this.modifyControl.activate();


//// BEGIN controller initialize ////

		this.srd_drawControls.point = new OpenLayers.Control.DrawFeature( this.layer,
			OpenLayers.Handler.Point);
		this.srd_drawControls.point.displayClass = "olControlDrawFeaturePoint";	

		this.srd_drawControls.line = new OpenLayers.Control.DrawFeature( this.layer,
			OpenLayers.Handler.Path);
		this.srd_drawControls.line.displayClass = "olControlDrawFeaturePath";	

		this.srd_drawControls.polygon = new OpenLayers.Control.DrawFeature( this.layer,
			OpenLayers.Handler.Polygon);
		this.srd_drawControls.polygon.displayClass = "olControlDrawFeaturePolygon";	

		this.srd_drawControls.remove = new OpenLayers.Control.SelectFeature(
			this.layer, {
				clickout: true,
				toggle: false,
				hover: false,
				title: "Delete",
				displayClass: "olControlDelete",
				onSelect: function (theFeat) {
					if (confirm('Are you sure you want to delete this feature from Overlay : '+this.name+'?')) {
						theFeat.state = OpenLayers.State.DELETE;
						if( !theFeat.attributes.gid) {
							this.layer.removeFeatures([theFeat]);
						}
					}
				}.bind(this)
			} );
	this.srd_drawControls.select = new OpenLayers.Control.SelectFeature(this.layer,
		{onSelect: this.onFeatureSelect, onUnselect: this.onFeatureUnselect});

/////////////////////////////////////////////
	}
	// END IF VECTOR

	//Adding the Control to allow for points to be selected and moved 
//	this.dragControl = new OpenLayers.Control.DragFeature( this.layer ); 
//	this.map.addControl(dragControl);
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
	if(theSelectedControl != selectControl) {
		return 0;
	}
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



//DEV TESTING -- changed this.map to the_srd_layer.map and 
// added if not null's for both vars.
//BEGIN GLOBAL FUNC onFeatureUnselect
onFeatureUnselect = function(evt, the_srd_layer) {
	var feature = evt.feature;
	if( the_srd_layer != null && feature.popup != null ) {
		the_srd_layer.map.removePopup(feature.popup);
		feature.popup.destroy();
		feature.popup = null;
	}
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
//	alert("Load complete Number of features:"+layer.features.length);
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
		var canEdit = false;
		for(var propName in theFeatArr[j].attributes ) {
			canEdit = true;
			if( propName == "gid" ) {
				canEdit = false;
			}
			theFeatPropNames[i] = propName;
			if( propName.toLowerCase() != 'lat' && propName.toLowerCase() != 'lon' && propName.toLowerCase() != 'latitude' && propName.toLowerCase() != 'longitude') {
				the_srd_layer.srd_data[j][propName] = theFeatArr[j].attributes[propName];
				srd_layout[i] = { field: theFeatPropNames[i], name: theFeatPropNames[i], width: 'auto', editable: canEdit };
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
//		evt.feature.attributes.srd_description = 'DefaultDesc';
//		evt.feature.attributes.srd_notes = 'DefaultNotes';
	
		if(evt.feature.state != OpenLayers.State.INSERT) {
			evt.feature.state = OpenLayers.State.UPDATE;
		}
//		alert("featureAdded Called, and srd_status not there");
		the_srd_layer.layer.redraw();
	}
};


srd_layer.prototype.onFeatureInserted = function(insertedFeature) {
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

srd_layer.prototype.setValue = function(varName, varValue) {
//		console.log("setValue Called: Name:"+varName+", Value:"+varValue);
	switch( String(varName )) {
		case "sphericalMercator" :
		case "visibility" :
		case "isBaseLayer" :
			if(String(varValue).toUpperCase() == "TRUE" ) {
				this[varName] = Boolean(true);
			} else {
				this[varName] = Boolean(false);
			}
			break;
		case "numZoomLevels" :
			this[varName] = Number(varValue);
			break;
		default :
			this[varName] = String(varValue);
	}

	return 0;
}

srd_layer.prototype.setStyleProperty = function(styleName,varName,varValue) {
//	console.log(":::"+this.name+":::setStyleProperty name="+styleName+", varName="+varName+", varVal="+varValue);	
//	return 0;
	switch( String(varName) ) {
		// COLORS :
		case "fillColor" :
		case "strokeColor" :
		case "labelAlign" :
		case "fontColor" :
		case "fontFamily" :
			this.srd_styleMap.styles[styleName].defaultStyle[varName] = String(varValue);
			break;
		case "fillOpacity" :
		case "strokeOpacity" :
		case "pointRadius" :
		case "fontOpacity" :
		case "fontSize" :
			this.srd_styleMap.styles[styleName].defaultStyle[varName] = Number(varValue);
			break;
		case "label" :
//			this.srd_styleMap.styles[styleName].defaultStyle[varName] = "${"+String(varValue)+"}";
			this.srd_styleMap.styles[styleName].defaultStyle[varName] = String(varValue);
			break;
	}
}

srd_layer.prototype.createStyle = function(styleName) {
//	console.log("CREATE STYLE CALLED="+styleName);
	if(this.srd_styleMap == null) {
//		console.log("New StyleMap Created for Layer="+this.name);
		this.srd_styleMap = new OpenLayers.StyleMap();
	}
	var tmpStyleName = String(styleName);
	this.srd_styleMap.styles[tmpStyleName] = new OpenLayers.Style( {} );

}

srd_layer.prototype.copyStyle = function(theStyleName,theStyle) {
	this.createStyle(theStyleName);
	for(var styleVal in theStyle.defaultStyle) {
//		console.log("Loading StyleSettings"+theStyleName+":::"+styleVal+":::"+theStyle.defaultStyle[styleVal] );
		this.setStyleProperty(theStyleName,styleVal,theStyle.defaultStyle[styleVal] );
	}

}













