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

		this.editPalette = null;

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

		this.srd_featureAttributes = {
			fillColor: '#00F000',
			fillOpacity: 0.5,
			strokeColor : '#00FF00',
			strokeOpacity : 1,
			strokeWidth: '1',
			pointRadius: '6',
			label: 'Test Label',
			fontColor: '#000000',
			fontSize: '14px',
			fontFamily: 'Courier New, monospace',
			fontWeight: 'bold',
			labelAlign: 'rt',
			labelXOffset: '0',
			labelYOffset: '0',
			externalGraphic: '',
//			externalGraphic: 'lib/img/map_icons/PoliceCar_Left.png',
			graphicWidth: '80',
			graphicHeight: '40',
			graphicOpacity: '1',
			rotation: '45'

//			backgroundGraphic: ''
		}
		
		this.srd_customFeatureAttributes = {
			fillColor: '${fillColor}',
			fillOpacity: '${fillOpacity}',
			strokeColor : '${strokeColor}',
			strokeOpacity : '${strokeOpacity}',
			strokeWidth : '${strokeWidth}',
			pointRadius: '${pointRadius}',
			label: '${label}',
			fontColor: '${fontColor}',
			fontSize: '${fontSize}',
			fontFamily: 'Courier New, monospace',
			fontWeight: 'bold',
			labelAlign: 'rt',
			labelXOffset: '0',
			labelYOffset: '0',
			externalGraphic: '${externalGraphic}',
			graphicWidth: '${graphicWidth}',
			graphicHeight: '${graphicHeight}',
			graphicOpacity: '${graphicOpacity}',
			rotation: '${rotation}'
				
//			backgroundGraphic: '${backgroundGraphic}'

		}	

//		this.srd_customSelectFeatureAttributes = Object.create(this.srd_customFeatureAttributes);
		this.srd_customSelectFeatureAttributes = {
			fillColor: '${fillColor}',
			fillOpacity: '${fillOpacity}',
			strokeColor : '${strokeColor}',
			strokeOpacity : '${strokeOpacity}',
			strokeWidth : '${strokeWidth}',
			pointRadius: '${pointRadius}',
			label: '${label}',
			fontColor: '${fontColor}',
			fontSize: '${fontSize}',
			fontFamily: 'Courier New, monospace',
			fontWeight: 'bold',
			labelAlign: 'rt',
			labelXOffset: '0',
			labelYOffset: '0'
		}	




		this.srd_customSelectFeatureAttributes.label = '**${label}**';
//		this.srd_customSelectFeatureAttributes.label = '${label}';


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
	if(this.editable) {
		for( theCon in this.srd_drawControls) {
			this.map.addControl(this.srd_drawControls[theCon]);
		}
	}
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
				attribution:				"<img src='lib/img/SitRepLogo_Tiny.png' height='25' width='60'><br> "+this.attribution,
				sphericalMercator: 	this.sphericalMercator
			} 
		);
	} else if (this.layertype == "Vector" ) {

	console.log("Vector Layer created:"+this.name);
// BEGIN MESSY STYLE RULE CODE
		if(this.srd_styleMap == null) {
			this.srd_styleMap = new OpenLayers.StyleMap();
		}
//		var tmpSymbolizer = this.srd_styleMap.styles["default"].defaultStyle;

		var mainRule = new OpenLayers.Rule( {
			elseFilter: true,
			symbolizer: this.srd_featureAttributes} );
//			symbolizer: tmpSymbolizer} );

		var customRule = new OpenLayers.Rule( {
			filter: new OpenLayers.Filter.Comparison( {
				type: OpenLayers.Filter.Comparison.NOT_EQUAL_TO,
				property: 'customStyle',
				value: null
			}),
			symbolizer: this.srd_customFeatureAttributes
		} );

		var customSelectRule = new OpenLayers.Rule( {
			filter: new OpenLayers.Filter.Comparison( {
				type: OpenLayers.Filter.Comparison.NOT_EQUAL_TO,
				property: 'customStyle',
				value: null
			}),
			symbolizer: this.srd_customSelectFeatureAttributes
		} );

		this.srd_styleMap.styles["default"].addRules( [mainRule, customRule] );
		this.srd_styleMap.styles["select"].addRules( [ customSelectRule] );



// END MESSY STYLE RULE CODE

		if(this.format == "GML" ) {
			this.runFromServer = true;
			if( this.runFromServer == false ) {
				console.log("Create GML Layer="+this.name+"===");
				this.layer = new OpenLayers.Layer.GML(this.name, this.url, { 
					isBaseLayer:	this.isBaseLayer,
//					projection:		this.projection,
					projection:		new OpenLayers.Projection(this.projection),
					visibility:		this.visibility, 
					styleMap:			this.srd_styleMap,
					preFeatureInsert: function(feature) {this.srd_preFeatureInsert(feature);}.bind(this) 
				}  );

				
				this.layer.loadGML();	

			} else {

				var layerProtocol = null;
				if(this.url == null || this.url == "") {
						layerProtocol = new OpenLayers.Protocol.HTTP( {
							format:		new OpenLayers.Format.GML( {
								featureType: "feature",
								featureNS: "http://example.com/feature" 
							} )	
						} );
				} else {
						layerProtocol = new OpenLayers.Protocol.HTTP( {
							readWithPOST: true,
							url:			this.url,
							format:		new OpenLayers.Format.GML( {
								featureType: "feature",
								featureNS: "http://example.com/feature" 
							} )	
						} );
				}	

	//			console.log("Create GML Layer Run From Server="+this.name+"===");
				this.layer = new OpenLayers.Layer.Vector(this.name, {
					isBaseLayer:	this.isBaseLayer,
//					projection:		this.projection,
//
					preFeatureInsert: function(feature) {this.srd_preFeatureInsert(feature);}.bind(this), 
					projection:		new OpenLayers.Projection(this.projection),
					units:				"degrees",
					visibility:		this.visibility,
					styleMap:			this.srd_styleMap,
					strategies:		[new OpenLayers.Strategy.Fixed()],
					protocol:			layerProtocol
				} );

//				console.log("Lazy Load");
//				this.layer.protocol = layerProtocol;
//				this.layer.refresh();


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
				url: "https://sitrep.local/geoserver/wfs",
				featureNS :  "https://sitrep.local/",
				featureType: this.name,
//				geometryName: "the_geom",
//				extractAttributes: true,
				preFeatureInsert: function(feature) {this.srd_preFeatureInsert(feature);}.bind(this)
        } )
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
				}.bind(this),
				keypress: function(theFeat) {
					alert("Key Pressed!");
				}
			} );

	this.srd_drawControls.select = new OpenLayers.Control.SelectFeature(this.layer, {
		onSelect: function(theFeature) { 
			this.onFeatureSelect(theFeature) 
		}.bind(this), 
		onUnselect: function(theFeature) { 
			this.onFeatureUnselect(theFeature) }.bind(this)
		} );


// TODO REGISTER KEYPRESS EVENT FOR DEL KEY TO DEL SELECTED FEATURE AT ANY TIME.
//		this.layer.events.register("keypress"



/////////////////////////////////////////////
	}
	// END IF VECTOR

	console.log("End if Vector");


	if(this.isBaseLayer == false ) {
		if(this.editPalette == null ) {
			this.editPalette = new srd_editPalette(this);
//			console.log("finished making editPal");
			if(this.editable == true) {
				this.editPalette.addControl("activeControlPicker","Edit Mode","activeControl",this.srd_drawControls);
			}
			this.editPalette.addControl("editText","Feature Label","label",this.srd_featureAttributes);

//			console.log("finished making label");
			this.editPalette.addControl("colorPicker","Font Color","fontColor",this.srd_featureAttributes);	

//			console.log("finished making color");
			this.editPalette.addControl("editText","Font Size","fontSize",this.srd_featureAttributes);	

//			console.log("finished making size");
			this.editPalette.addControl("editText","Point Radius","pointRadius",this.srd_featureAttributes);	
			this.editPalette.addControl("colorPicker","Stroke Color","strokeColor",this.srd_featureAttributes);	
			this.editPalette.addControl("editSlider","Stroke Opacity","strokeOpacity",this.srd_featureAttributes); 
			this.editPalette.addControl("editText","Stroke Width","strokeWidth",this.srd_featureAttributes);	
			this.editPalette.addControl("colorPicker","Fill Color","fillColor",this.srd_featureAttributes);	
			this.editPalette.addControl("editSlider","Fill Opacity","fillOpacity",this.srd_featureAttributes); 

			//Some of the attributes that are a little more fun!
			this.editPalette.addControl("editText","Notes","notes",this.srd_featureAttributes);	
			this.editPalette.addControl("editText","Start Time","startTime",this.srd_featureAttributes);	
			this.editPalette.addControl("editText","End Time","endTime",this.srd_featureAttributes);	
			this.editPalette.addControl("editText","Last Edited","lastEditTime",this.srd_featureAttributes);	


		}
	}


//	console.log("end srd_loadData");
	//Adding the Control to allow for points to be selected and moved 
//	this.dragControl = new OpenLayers.Control.DragFeature( this.layer ); 
//	this.map.addControl(dragControl);
//	this.layer.events.register("loadend", this.layer, this.loadDataGrid() );
	
	return 0;
}; 
//// END srd_loadData  function



// DEFINE preFeatureInsert for Dynamic Layers so that we can add appropriate styling
srd_layer.prototype.srd_preFeatureInsert = function(feature) {
	if( this.editable == true) {
		if(feature.attributes.customStyle == null) {
			feature.attributes.customStyle = true;
			for(var styleAttribute in this.srd_featureAttributes) {
				feature.attributes[styleAttribute] = this.srd_featureAttributes[styleAttribute];
			}
		}

	}
}



// BEGIN FUNC onFeatureSelect
srd_layer.prototype.onFeatureSelect = function(theFeature) {
	console.log("Feature selected: "+theFeature.attributes.fillColor);
	this.editPalette.setFeatureAttributes( theFeature.attributes);
	this.selectedFeature = theFeature;
}
//END FUNC onFeatureSelect

// BEGIN FUNC onFeatureUnselect
srd_layer.prototype.onFeatureUnselect = function(theFeature) {
	console.log("Feature unselected: "+theFeature.fid);
	this.editPalette.setFeatureAttributes( this.srd_featureAttributes );
	this.selectedFeature = null;
}
//END FUNC onFeatureSelect

srd_layer.prototype.updateLayer = function() {
	if(this.selectedFeature != null) {
		this.layer.drawFeature(this.selectedFeature);
	}
}





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
			try{
				this[varName] = dojo.fromJson(varValue);
			} catch(error) {

				this[varName] = String(varValue);
			}
//			this[varName] = dojo.fromJson(varValue);

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
		case "label" :
		case "fontFamily" :
			if(styleName == "default") {
//TODO need to fix for other cases.
//				if(String(varValue).indexOf("${") == -1) {
					this.srd_featureAttributes[varName] = String(varValue);
//				} else {
//					this.srd_customFeatureAttributes[varName] = String(varValue);
//				}
			} else {
				this.srd_styleMap.styles[styleName].defaultStyle[varName] = String(varValue);
			}
			break;
		case "fillOpacity" :
		case "strokeOpacity" :
		case "pointRadius" :
		case "fontOpacity" :
		case "fontSize" :
			if(styleName == "default") {
				this.srd_featureAttributes[varName] = String(varValue);
			} else {
				this.srd_styleMap.styles[styleName].defaultStyle[varName] = Number(varValue);
			}
	
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

/*
srd_layer.prototype.activate = function() {
	for( theCon in this.srd_drawControls) {
		theCon.
*/











