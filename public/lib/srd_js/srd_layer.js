// srd_layer.js
////////////////////////////
// Javascript class srd_layer used for srd layers.
//
//
//
//
//////////////////////////////


dojo.require("dojox.timing.Sequence");
//OpenLayers.ProxyHost = "/cgi-bin/proxy.cgi?url=";

//srd_layer constructor 
function srd_layer( ) {
		this.map = 	null;  //OpenLayers Map Class.
		this.layer = null; //OpenLayers Layer Class.
		

//		this.settings = { isBaseLayer: false, projection: "EPSG:4326", visibility: false };
		this.source = null;


// All of the values from the settings.xml file:
		this.options = {
			name : null,
			id : null,
			type : null,
			format : null,
			isBaseLayer : null,
			projection : null,
			visibility : null,
			sphericalMercator : null,
			url : null,
			numZoomLevels : null,
			minZoomLevel : null,
			maxZoomLevel : null,
			attribution : "",
			can_update : false,
			can_delete : false,
			feature_create : false,
			feature_update : false,
			feature_delete : false,
			defaultstyle : null
		}
		
		this.featureCount = 0;

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

		this.srd_styleArr = [];
		
		this.srd_featureAttributes = {
//			setStyles: '${styleFunction}',
			fillColor: '#ee9900',
			fillOpacity: 0.4,
			strokeColor : '#ee9900',
			strokeWidth : 1,
			strokeOpacity : 1,
			pointRadius: 6
		}

/*		this.srd_featureAttributes = {
			setStyles: '${styleFunction}',
			fillColor: '${fillColor}',
			fillOpacity: '${fillOpacity}',
			strokeColor : '${strokeColor}',
			strokeWidth : '${strokeWidth}',
			strokeOpacity : '${strokeOpacity}',
			pointRadius: '${pointRadius}',
			label: '${label}',
			fontColor: '${fontColor}',
			fontSize: '${fontSize}',
			fontFamily: '${fontFamily}',
			fontWeight: '${fontWeight}',
			labelAlign: '${labelAlign}',
			labelXOffset: '${labelXOffset}',
			labelYOffset: '${labelYOffset}',
			externalGraphic: '${externalGraphic}',
			graphicWidth: '${graphicWidth}',
			graphicHeight: '${graphicHeight}',
			graphicOpacity: '${graphicOpacity}',
			rotation: '${rotation}'
//			backgroundGraphic: '${backgroundGraphic}'
		}
*/

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
	console.log("Adding Layer to Map. For Layer "+this.options.name);
	this.map.addLayer( this.layer );
	console.log("Adding Controls to Map...");
	if(this.options.type == "Vector" && this.options.feature_update) {
		for( theCon in this.srd_drawControls) {
			this.map.addControl(this.srd_drawControls[theCon]);
		}
	}
	if(this.options.format == "NONE" ) {
		this.map.addControl(this.selectControl);
		this.selectControl.activate();
	}
}


// loadData <- bring in the vector data from whatever source is specifed
// right now only GML hopefully wfs-t real fucking soon.
srd_layer.prototype.loadData = function( ) { 
//srd_layer.prototype.loadData = function(type, name, source, settings ) { 

	if( this.options.type == "XYZ" ) {
		console.log("XYZ Layer Created : "+this.options.name+":::"+this.options.url+":::");
		if( !this.options.attribution) {
			this.options.attribution = "";
		}
		this.layer = new OpenLayers.Layer.XYZ ( 
			this.options.name,
//				"test",
//				'http://otile1.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png',
			this.options.url,
			{
//				projection:		new OpenLayers.Projection(this.options.projection),
				numZoomLevels:	this.options.numZoomLevels,
				attribution:				"<img src='lib/img/SitRepLogo_Tiny.png' height='25' width='60'><br> "+this.options.attribution,
				sphericalMercator: 	this.options.sphericalMercator
			} 
		);
	} else if (this.options.type == "WMS" ) {
		console.log("WMS Layer Created : "+this.options.name+":::"+this.options.url+":::");
		this.layer = new OpenLayers.Layer.WMS ( 
			this.options.name,
			this.options.url,
			{
				// TESTING ONLY
				layers: "nexrad-n0r-wmst",
				transparent : "true",
				format : 'image/png',
				time : '2012-06-26T13:00:00',
				srs: 'EPSG:4326'
			},
			{
				isBaseLayer:	this.options.isBaseLayer,
				projection:		new OpenLayers.Projection(this.options.projection),
				visibility:		this.options.visibility 
				
 			}
		);
	} else if (this.options.type == "Vector" ) {

	console.log("Vector Layer created:"+this.options.name);
// BEGIN MESSY STYLE RULE CODE

/*
		if(this.srd_styleMap == null) {
//			this.srd_styleMap = new OpenLayers.StyleMap();


 			if(this.options.defaultstyle &&  this.srd_styleArr[this.options.defaultstyle] ) {
				this.srd_styleMap = new OpenLayers.StyleMap( { 
					'default': new OpenLayers.Style( this.srd_styleArr[this.options.defaultstyle] )
				} ); 	
			} else {
				this.srd_styleMap = new OpenLayers.StyleMap( { 
					'default': new OpenLayers.Style( this.srd_featureAttributes )
				} ); 
			}
		}
	*/
/*
			this.srd_styleMap = new OpenLayers.StyleMap( { 
//				'default': this.srd_styleArr[this.options.defaultstyle]
				'default': new OpenLayers.Style( this.srd_featureAttributes, { 
//				'default': new OpenLayers.Style( {styleFunction: "${styleFunction}" }, { 
				context: {
					styleFunction : function(feature) { this.srd_styleFunction(feature); }.bind(this),
					fillColor: function(feature) { return feature.tmpAttributes.fillColor; },
					fillOpacity: function(feature) { return feature.tmpAttributes.fillOpacity; },
					strokeColor: function(feature) { return feature.tmpAttributes.strokeColor; },
					strokeWidth: function(feature) { return feature.tmpAttributes.strokeWidth; },
					strokeOpacity: function(feature) { return feature.tmpAttributes.strokeOpacity; },
					pointRadius: function(feature) { return feature.tmpAttributes.pointRadius; },
					label: function(feature) { return feature.tmpAttributes.label; },
					fontColor: function(feature) { return feature.tmpAttributes.fontColor; },
					fontSize: function(feature) { return feature.tmpAttributes.fontSize; },
					fontFamily: function(feature) { return feature.tmpAttributes.fontFamily; },
					fontWeight: function(feature) { return feature.tmpAttributes.fontWeight; },
					labelAlign: function(feature) { return feature.tmpAttributes.labelAlign; },
					labelXOffset: function(feature) { return feature.tmpAttributes.labelXOffset; },
					labelYOffset: function(feature) { return feature.tmpAttributes.labelYOffset; },
					externalGraphic: function(feature) { return feature.tmpAttributes.externalGraphic; },
					graphicWidth: function(feature) { return feature.tmpAttributes.graphicWidth; },
					graphicHeight: function(feature) { return feature.tmpAttributes.graphicHeight; },
					graphicOpacity: function(feature) { return feature.tmpAttributes.graphicOpacity; },
					rotation: function(feature) { return feature.tmpAttributes.rotation; },
					backgroupGraphic: function(feature) { return feature.tmpAttributes.backgroupGraphic; },

				} 
				}  )
*/

///			} );
/*			var theRuleArr = [];
			theRuleArr.push( new OpenLayers.Rule( {
				elseFilter: true,
//				symbolizer: this.srd_styleArr[this.options.defaultstyle] 
					symbolizer: "${styleFunc}",
					styleFunc: this.srd_styleFunction
				} )
			);
*/
/*	
			for(var styleId in this.srd_styleArr) {
				theRuleArr.push( new OpenLayers.Rule( {
					filter: new OpenLayers.Filter.Comparison( {
						type: OpenLayers.Filter.Comparison,EQUAL_TO,
						property: 'style',
						value: styleId
					}),
					symbolizer: this.srd_styleArr[styleId] 
					} )
				);
			}
*/
//			this.srd_styleMap.styles["default"].addRules( theRuleArr );
//			this.srd_styleMap.addUniqueValueRules("default","style", this.srd_styleArr);

//				this.srd_styleMap.addUniqueValueRules("default","feature", this.srd_styleFunction);
//		}

//		var tmpSymbolizer = this.srd_styleMap.styles["default"].defaultStyle;

/*
		var mainRule = new OpenLayers.Rule( {
			elseFilter: true,
			symbolizer: "${styleFunction}"
		} );
*/
//			symbolizer: this.srd_styleArr[this.options.defaultstyle] } );
//			symbolizer: tmpSymbolizer} );

/*
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
*/

//		this.srd_styleMap.styles["default"].addRules( [mainRule ] );
//		this.srd_styleMap.styles["default"] = this.srd_styleArr[this.options.defaultstyle];

//console.log("End Messy Rule code");
// END MESSY STYLE RULE CODE

		if(this.options.format == "GML" ) {
			this.runFromServer = true;
			if( this.runFromServer == false ) {
				console.log("Create GML Layer="+this.options.name+"===");
				this.layer = new OpenLayers.Layer.GML(this.options.name, this.options.url, { 
					isBaseLayer:	this.options.isBaseLayer,
//					projection:		this.options.projection,
					projection:		new OpenLayers.Projection(this.options.projection),
					visibility:		this.options.visibility, 
					styleMap:			this.srd_styleMap,
					preFeatureInsert: function(feature) {this.srd_preFeatureInsert(feature);}.bind(this) 
				}  );

				
				this.layer.loadGML();	

			} else {
//console.log("Running from server");
				var layerProtocol = null;
				if(this.options.url == null || this.options.url == "") {
						layerProtocol = new OpenLayers.Protocol.HTTP( {
							format:		new OpenLayers.Format.GML( {
								featureType: "feature",
								featureNS: "http://example.com/feature" 
							} )	
						} );
				} else {
						layerProtocol = new OpenLayers.Protocol.HTTP( {
							readWithPOST: true,
							url:			this.options.url,
							format:		new OpenLayers.Format.GML( {
								featureType: "feature",
								featureNS: "http://example.com/feature" 
							} )	
//							format: new OpenLayers.Format.GeoJSON( { } )
						} );
				}	

//			console.log("Create GML Layer Run From Server="+this.options.name+"===");
				this.layer = new OpenLayers.Layer.Vector(this.options.name, {
					isBaseLayer:	this.options.isBaseLayer,
//					projection:		this.options.projection,
//
					preFeatureInsert: function(feature) {this.srd_preFeatureInsert(feature);}.bind(this), 
					projection:		new OpenLayers.Projection(this.options.projection),
					units:				"degrees",
					visibility:		this.options.visibility,
					styleMap:			this.srd_styleMap,
					strategies:		[new OpenLayers.Strategy.BBOX(), new OpenLayers.Strategy.Save( {auto: true}) ],
//					strategies:		[new OpenLayers.Strategy.Fixed()],
					protocol:			layerProtocol
				} );

//				console.log("Lazy Load");
//				this.layer.protocol = layerProtocol;
//				this.layer.refresh();

			}

		} else if(this.options.format == "NONE" ) {
				console.log("Create Plain Vector  Layer "+this.options.name+"===");
				this.store = new dojo.store.Memory();
				this.layer = new OpenLayers.Layer.Vector(this.options.name, {
					isBaseLayer:	this.options.isBaseLayer,
					projection:		new OpenLayers.Projection(this.options.projection),
					units:				"degrees",
					visibility:		this.options.visibility,
					styleMap:			this.srd_styleMap
				} );
//				this.layer.events.register("featureadded", this, this.srd_create);
//				this.layer.events.register("featuremodified", this, this.srd_update);
//				this.layer.events.register("featureremoved", this, this.srd_delete);
				this.selectControl = new OpenLayers.Control.SelectFeature(
					this.layer, {
					onSelect: function(theFeature) { 
						this.onFeatureSelect(theFeature) 
					}.bind(this), 
					onUnselect: function(theFeature) { 
						this.onFeatureUnselect(theFeature) }.bind(this)
					} );
					 

		} else if(this.options.format == "SRJSON" ) {
				console.log("Create SRJson Layer Run From Server="+this.options.name+"===");
				this.store = new dojo.store.Cache(
					dojo.store.JsonRest( { 
//						idProperty: { "layer_id", "feature_id"},
//						idProperty: "feature_id",
						target: "/srdata/features/"
					} ),
					dojo.store.Memory()
				);
				this.layer = new OpenLayers.Layer.Vector(this.options.name, {
					isBaseLayer:	this.options.isBaseLayer,
					projection:		new OpenLayers.Projection(this.options.projection),
					units:				"degrees",
					visibility:		this.options.visibility,
					styleMap:			this.srd_styleMap
				} );
				dojo.when(this.store.query({"layer_id":this.options.id}), function(theFeatArr) {
					dojo.forEach( theFeatArr, function(theFeat) {
						var theFeature = new OpenLayers.Feature.Vector( new OpenLayers.Geometry.fromWKT( theFeat.geometry), dojo.fromJson(theFeat.feature_data) );
						theFeature.db_id = theFeat.id;
//						theFeature.fid = theFeat.feature_id;
//						theFeature.id = theFeat.feature_id;
						console.log("Adding Feature: "+theFeature.db_id+" on Layer: "+this.options.id);
						this.layer.addFeatures( [theFeature] ); 
	
					}.bind(this) );

					this.layer.events.register("featureadded", this, this.srd_create);
					this.layer.events.register("featuremodified", this, this.srd_update);
					this.layer.events.register("featureremoved", this, this.srd_delete);

				}.bind(this) );

		} else if(this.options.format == "GeoJSON" ) {

				this.layerProtocol = null;
				this.options.url =null;
				if(this.options.url == null || this.options.url == "") {
						this.layerProtocol = new OpenLayers.Protocol.HTTP( {
//								url: "/srdata/Geojsonstatic/layer_id/"+this.options.id+"/",
								url: "/srdata/geojsonstatic/?layer_id="+this.options.id,
//							params: { layer_id : this.options.id },
//							readWithPOST: true,
							format: new OpenLayers.Format.GeoJSON( { } )
						} );
				} else {
						this.layerProtocol = new OpenLayers.Protocol.HTTP( {
							readWithPOST: true,
							headers: { layer_id : this.options.id },
							params: { layer_id : this.options.id },
							url:			this.options.url,
							callback: function(resp ) { this.crudComplete(resp) }.bind(this),
							format: new OpenLayers.Format.GeoJSON( {
//								'internalProjection' : new OpenLayers.Projection("EPSG:900913"),
//								'externalProjection' : new OpenLayers.Projection("EPSG:4326")
							 } )
						} );
				}	
			console.log("Create GeoJSON Layer Run From Server="+this.options.name+"===");
				this.layer = new OpenLayers.Layer.Vector(this.options.name, {
					isBaseLayer:	this.options.isBaseLayer,
					preFeatureInsert: function(feature) {this.srd_preFeatureInsert(feature);}.bind(this), 
					projection:		new OpenLayers.Projection(this.options.projection),
					units:				"degrees",
					visibility:		this.options.visibility,
					styleMap:			this.srd_styleMap,
					strategies:		[new OpenLayers.Strategy.BBOX(), new OpenLayers.Strategy.Save( {auto: true}) ],
					protocol:			this.layerProtocol
				} );

		} else if(this.options.format == "WFST" ) {
			this.saveStrategy = new OpenLayers.Strategy.Save( ); //{ auto: true } );
 			this.saveStrategy.events.register("success", '', showSuccessMsg);
			this.saveStrategy.events.register("fail", '', showFailureMsg);	
//		this.refreshStrategy = new OpenLayers.Strategy.Refresh({force: true, interval: 10000});

			this.layer = new OpenLayers.Layer.Vector(this.options.name, {
				isBaseLayer: this.options.isBaseLayer,
				visibility: this.options.visibility,
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
				featureType: this.options.name,
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

		// STYLING FOR ALL VECTOR LAYERS :
		var theObject = {};
		this.layer.events.register('beforefeatureadded', theObject, function(theObject) { this.srd_beforeAdd(theObject)}.bind(this)  );

	
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
					if (confirm('Are you sure you want to delete this feature from Overlay : '+this.options.name+'?')) {
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


	this.srd_drawControls.select = new OpenLayers.Control.ModifyFeature(this.layer);
/*
  	this.srd_drawControls.select = new OpenLayers.Control.SelectFeature(this.layer, {
		onSelect: function(theFeature) { 
			this.onFeatureSelect(theFeature) 
		}.bind(this), 
		onUnselect: function(theFeature) { 
			this.onFeatureUnselect(theFeature) }.bind(this)
		} );
*/

// TODO REGISTER KEYPRESS EVENT FOR DEL KEY TO DEL SELECTED FEATURE AT ANY TIME.
//		this.layer.events.register("keypress"



	console.log("End if Vector");
//	console.log("TEST5::"+this.srd_featureAttributes.tagName+":::");

	/////////////////////////////////////////////
	}
	// END IF VECTOR



	if(this.options.isBaseLayer == false ) {
		if(this.editPalette == null ) {
			this.editPalette = new srd_editPalette(this);
//			console.log("finished making editPal");

			if(this.options.type == "Vector" && this.options.feature_update == "true") {
				this.editPalette.addControl("activeControlPicker","Edit Mode","activeControl",this.srd_drawControls);
			}
			this.editPalette.addControl("editText","Feature Label","label",this.srd_featureAttributes);

//			console.log("finished making label");
			this.editPalette.addControl("colorPicker","Font Color","fontColor",this.srd_featureAttributes);	

//			console.log("finished making color");
			this.editPalette.addControl("editNumber","Font Size","fontSize",this.srd_featureAttributes);	

//			console.log("finished making size");
			this.editPalette.addControl("editNumber","Point Radius","pointRadius",this.srd_featureAttributes);	
			this.editPalette.addControl("colorPicker","Stroke Color","strokeColor",this.srd_featureAttributes);	
			this.editPalette.addControl("editSlider","Stroke Opacity","strokeOpacity",this.srd_featureAttributes); 
			this.editPalette.addControl("editNumber","Stroke Width","strokeWidth",this.srd_featureAttributes);	
			this.editPalette.addControl("colorPicker","Fill Color","fillColor",this.srd_featureAttributes);	
			this.editPalette.addControl("editSlider","Fill Opacity","fillOpacity",this.srd_featureAttributes); 

			//Some of the attributes that are a little more fun!
			this.editPalette.addControl("editText","Notes","notes",this.srd_featureAttributes);	
			this.editPalette.addControl("editText","Start Time","startTime",this.srd_featureAttributes);	
			this.editPalette.addControl("editText","End Time","endTime",this.srd_featureAttributes);	
			this.editPalette.addControl("editText","Last Edited","lastEditTime",this.srd_featureAttributes);	

		}
	}
	console.log("end srd_loadData");
	//Adding the Control to allow for points to be selected and moved 
//	this.dragControl = new OpenLayers.Control.DragFeature( this.layer ); 
//	this.map.addControl(dragControl);
//	this.layer.events.register("loadend", this.layer, this.loadDataGrid() );
	
	return 0;
}; 
//// END srd_loadData  function



// DEFINE preFeatureInsert for Dynamic Layers so that we can add appropriate styling
srd_layer.prototype.srd_preFeatureInsert = function(feature) {
	if( this.options.type=="Vector" && this.options.feature_update == true) {
		if(feature.attributes.customStyle == null) {
			feature.attributes.customStyle = true;
			for(var styleAttribute in this.srd_featureAttributes) {
				feature.attributes[styleAttribute] = this.srd_featureAttributes[styleAttribute];
			}
		}
	}
//	this.featureCount++;
//	feature.fid = this.featureCount;
}



// BEGIN FUNC onFeatureSelect
srd_layer.prototype.onFeatureSelect = function(theFeature) {
	console.log("Feature selected: "+theFeature.db_id);
//	this.editPalette.setFeatureAttributes( theFeature.attributes);
//	theFeature.
	this.selectedFeature = theFeature;
	if(this.options.format == "NONE") {	
		console.log("TEST:::"+this.selectedFeature.geometry.getCentroid().toString() );
/*		 var popup = new OpenLayers.Popup.FramedCloud("popup",
			this.selectedFeature.geometry.getBounds().getCenterLonLat(),
			null,
			this.selectedFeature.attributes.body,
			null,
			true,
			this.onPopupClose
		);
		this.selectedFeature.popup = popup;
		this.map.addPopup(this.selectedFeature.popup);
*/
		this.selectedFeature.popupClass = OpenLayers.Popup.FramedCloud;
		this.selectedFeature.createPopup();
	}

}
//END FUNC onFeatureSelect
srd_layer.prototype.onPopupClose = function(evt) {
	this.selectControl.unselect(this.selectedFeature);
}
// BEGIN FUNC onFeatureUnselect
srd_layer.prototype.onFeatureUnselect = function(theFeature) {
	console.log("Feature unselected: "+theFeature.db_id);
//	this.editPalette.setFeatureAttributes( this.srd_featureAttributes );
	if(this.options.format == "NONE") {	
		this.map.removePopup(this.selectedFeature.popup);
		this.selectedFeature.popup.destroy();
		this.selectedFeature.popup = null;
	}
	this.selectedFeature = null;
}
//END FUNC onFeatureSelect

srd_layer.prototype.updateLayer = function() {
	if(this.selectedFeature != null) {
		this.layer.drawFeature(this.selectedFeature);
	} else {
		this.layer.redraw();
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
	this.selectedFeature  = this.layer.getFeatureByFid(item.db_id);
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
//		the_srd_layer.srd_data[j].fid = theFeatArr[j].fid;
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
				this.options[varName] = 1; //Boolean(true);
			} else {
				this.options[varName] = 0; //Boolean(false);
			}
			break;
		case "minZoomLevel" :
		case "maxZoomLevel" :
		case "numZoomLevels" :
			this.options[varName] = Number(varValue);
			break;
		default :
			try{
				this.options[varName] = dojo.fromJson(varValue);
			} catch(error) {

				this.options[varName] = String(varValue);
			}
//			this[varName] = dojo.fromJson(varValue);

	}

	return 0;
}

srd_layer.prototype.setStyleProperty = function(styleName,varName,varValue) {
//	console.log(":::"+this.options.name+":::setStyleProperty name="+styleName+", varName="+varName+", varVal="+varValue);	
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
		default:
			if(styleName == "default") {
				this.srd_featureAttributes[varName] = String(varValue);
			} else {
				this.srd_styleMap.styles[styleName].defaultStyle[varName] = String(varValue);
			}
			break;	
	}
}

srd_layer.prototype.createStyle = function(styleName) {
//	console.log("CREATE STYLE CALLED="+styleName);
	if(this.srd_styleMap == null) {
//		console.log("New StyleMap Created for Layer="+this.options.name);
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


// BEGIN UPLOAD LAYER TO SERVER.
srd_layer.prototype.uploadLayer = function() {
	var uploadData = {
		options: this.options,
		styles: this.srd_featureAttributes
	}
	var xhrArgs =  {
		url: "/srdata/Layer/Create",
		postData: dojo.toJson(uploadData),
		handleAs: 'json',
		headers: { 'Content-Type' : 'application/json' }, 
		load: function(data) {
			//WHAT to do when we're done sending data.
			console.log("Finished Uploading Layer Info :"+data.id);
			this.oldOptions = this.options;
			this.oldLayer = this.layer;
	
			this.layer = null;
			this.options = null;
			this.options = data;
			this.loadData();
			console.log("oldLayer has :"+this.oldLayer.features.length+" : of features");
			var headers =  {
				'Content-Type' : 'application/json', 
				'layer_id' : this.options.id,
				'sr_requestType' : 'create'
			}
			this.loadAllFeatures = 1;
			this.createFeature(this.oldLayer.features[0], {'headers':headers} );
//		this.map.removeLayer(this.layer);

			this.addLayerToMap(this.map);
		}.bind(this),
		error: function(error) {
			//What to do if it failed.
		}
	}
	var deferred = dojo.xhrPost(xhrArgs);

}
// END uploadLayer

// BEGIN UPLOAD LAYER DATA TO SERVER.
srd_layer.prototype.uploadData = function() {
	var uploadData = {
		options: this.options,
		styles: this.srd_featureAttributes
	}
	var xhrArgs =  {
		url: "/srdata/Layer/Create",
		postData: dojo.toJson(uploadData),
		handleAs: 'json',
		headers: { 'Content-Type' : 'application/json' }, 
		load: function(data) {
			//WHAT to do when we're done sending data.
			console.log("Finished Uploading Layer Info :"+data);

		},
		error: function(error) {
			//What to do if it failed.
		}
	}
	var deferred = dojo.xhrPost(xhrArgs);

}
// END uploadLayer




// BEGIN DOWNLOAD LAYER STYLES FROM SERVER.
srd_layer.prototype.downloadStyles = function() {
	var requestData = {
		layer_id : this.options.id
	}
	var xhrArgs =  {
		url: "/srdata/Layer/Readstyles",
		postData: dojo.toJson(requestData),
		handleAs: 'json',
		headers: { 'Content-Type' : 'application/json' }, 
		load: function(data) {
			//WHAT to do when we're done sending data.
			
		}.bind(this),
		error: function(error) {
			//What to do if it failed.
		}
	}
	var deferred = dojo.xhrPost(xhrArgs);

}
// END uploadLayer


// BEGIN crudComplete SERVER.
srd_layer.prototype.crudComplete = function(resp) {
	if(resp.requestType == "create") {
		var respObj = {inserted : false};
		if( resp != null && resp.priv != null && resp.priv.responseText != null ) {
			try {			
				respObj = dojo.fromJson(resp.priv.responseText);	
			} catch(e) {
				respObj.inserted = false;
			}
		}
		var headers =  {
			'Content-Type' : 'application/json', 
			'layer_id' : this.options.id,
			'sr_requestType' : 'create'
		}
	
		console.log("crudComplete ="+resp.reqFeatures.db_id+":::"+resp.priv.responseText);
//		if(resp.code == OpenLayers.Protocol.Response.FAILURE || respObj.inserted != true) {
//		if(resp.code != OpenLayers.Protocol.Response.SUCCESS || respObj.inserted != true) {
		if(resp.code != OpenLayers.Protocol.Response.SUCCESS || respObj.inserted != true) {
			console.log("Create feature FAILED!, retrying in 1 sec.");
			var options = {'headers': headers};
			seq = new dojox.timing.Sequence();
			var funcs = [ {
			func: [ this.createFeature, this, resp.reqFeatures, options], pauseBefore: 2000 } ];
//			seq.go([{pauseBefore:1000}], function() { this.layerProtocol.create(resp.reqFeatures, options)}.bind(this)  );		
			seq.go(funcs);
		} else {
			var featIter = resp.reqFeatures.fid;
			if(this.loadAllFeatures == 1 && featIter < this.oldLayer.features.length ) {
				this.createFeature(this.oldLayer.features[featIter], {headers: headers});
			}
		}
	}
}
// END crudComplete SERVER.

srd_layer.prototype.createFeature = function(theFeat,options) {
	console.log("Create Feature Called for "+theFeat.fid);
	console.log("theOptions="+options.headers.layer_id);
	this.layerProtocol.create(theFeat,options);
}
// ABOVE MAYBE TO REMOVE --- OLD CODE----

// BEGIN srd_create EVENT HANDLER FOR AFTER NEW FEATURES ARE CREATED
srd_layer.prototype.srd_create = function(evt) {
//	console.log("Create Feature Called! ID: "+evt.feature.id);
/*
 	var featId = this.layer.features.length;
	while( this.layer.getFeatureByFid(featId) != null) {
		featId++;
	}
	evt.feature.fid= featId;
*/
	var item = {
//		"id":evt.feature.db_id,
		"layer_id":this.options.id,
//		"feature_id":featId,
		"feature_data":dojo.toJson(evt.feature.attributes),
		"sr_geom":evt.feature.geometry.toString()
	}
	evt.srd_layer = this;
	dojo.when( this.store.add(item), function(returnId) {
		console.log("Created Feature on server side! retStr:"+returnId);
//		var retItem = dojo.fromJson(retStr);
//		console.log("Created Feature on server side! retItem.feature_id:"+retItem.feature_id);
//		this.feature.fid=retItem.feature_id;
		this.feature.db_id=returnId;
		console.log("Created Feature on server side! this.feature.db_id:"+this.feature.db_id);
	}.bind(evt) );	
}
// END srd_create EVENT HANDLER FOR AFTER NEW FEATURES ARE CREATED

// BEGIN srd_update EVENT HANDLER FOR AFTER FEATURES ARE UPDATED
srd_layer.prototype.srd_update = function(evt) {
	console.log("Update Feature Called! ID: "+evt.feature.db_id);
	var item = {
		"id":evt.feature.db_id,
		"layer_id":this.options.id,
//		"feature_id":evt.feature.fid,
		"feature_data":dojo.toJson(evt.feature.attributes),
		"sr_geom":evt.feature.geometry.toString()
	}
	evt.srd_layer = this;
	dojo.when( this.store.put(item), function(returnId) {
//		console.log("Created Feature on server side! ID:"+returnId);
		var retItem = dojo.fromJson(returnId);
//		console.log("Created Feature on server side! ID:"+this.feature.fid);
//		this.feature.db_id=returnId;
//		console.log("Created Feature on server side! ID:"+this.feature.fid);
	}.bind(evt) );	
}	
// END srd_update EVENT HANDLER FOR AFTER FEATURES ARE UPDATED

// BEGIN srd_delete EVENT HANDLER FOR AFTER FEATURES ARE DELETED
srd_layer.prototype.srd_delete = function(evt) {
	console.log("Delete Feature Called! ID: "+evt.feature.db_id);
//	var itemStr = "layer_id/"+this.options.id+"/feature_id/"+evt.feature.fid;
	evt.srd_layer = this;
	dojo.when( this.store.remove(evt.feature.db_id), function(returnId) {
//	dojo.when( this.store.remove(itemStr), function(returnId) {
		var retItem = dojo.fromJson(returnId);
//		this.feature.fid=returnId;
//		console.log("Created Feature on server side! ID:"+this.feature.fid);
	}.bind(evt) );	
}	
// END srd_delete EVENT HANDLER FOR AFTER FEATURES ARE DELETED

// BEGIN srd_styleFunction 
srd_layer.prototype.srd_styleFunction = function( feature ) {
	if( !this.options) {
		console.log("Styling Feature :"+feature.id+" NO this.options!!!");
		return;
	}
	console.log("Styling Feature :"+feature.id+" on layer"+this.options.id);

/*	if( !feature.tmpAttributes) {
//		console.log("Feature:"+feature.id+" using hardcoded defaults.");
		feature.tmpAttributes = {
      fillColor: '#777777',
      fillOpacity: 1,
      strokeColor : '#555555',
      strokeOpacity : 1,
      strokeWidth: 5,
      pointRadius: 8,
      label: 'MyTestLabel',
      fontColor: '#000000',
      fontSize: '14',
			fontFamily: 'Courier New, monospace',
			fontWeight: '',
			labelAlign: 'ct',
			labelXOffset: 0,
			labelYOffset: 0,
			externalGraphic: '',
			graphicWidth: 0,
			graphicHeight: 0,
			graphicOpacity: 0,
			rotation: 0,
			backgroundGraphic: ''
		};
*/
		// CHECK IF STYLE # SET FOR FEATURE
		if( feature.data.style && this.srd_styleArr[feature.data.style]  ) {
			if( !feature.style ) {
				feature.style = this.srd_styleArr[feature.data.style];
			}
/*
//			console.log("Feature:"+feature.id+" has style :"+feature.data.style);
//			for(var i in feature.tmpAttributes) {
			for(var i in this.srd_styleArr[feature.data.style] ) {
//				if(this.srd_styleArr[feature.data.style][i] ) {
					if( dojo.isString( this.srd_styleArr[feature.data.style][i]) && this.srd_styleArr[feature.data.style][i].charAt(0) == '$' && feature.attributes[this.srd_styleArr[feature.data.style][i].substr(2,this.srd_styleArr[feature.data.style][i].length-3)   ] ) {
//						feature.tmpAttributes[i] = feature.attributes[ this.srd_styleArr[feature.data.style][i].substr(2,this.srd_styleArr[feature.data.style][i].length-3)  ];
						feature.style[i] = feature.attributes[ this.srd_styleArr[feature.data.style][i].substr(2,this.srd_styleArr[feature.data.style][i].length-3)  ];
					} else {
//						feature.tmpAttributes[i] = this.srd_styleArr[feature.data.style][i];
						feature.style[i] = this.srd_styleArr[feature.data.style][i];
					}
//				}

			}
*/
		// ELSE CHECK IF STYLE # SET FOR LAYER
		} else if ( this.options.defaultstyle && this.srd_styleArr[this.options.defaultstyle] ) {
//			console.log("Feature:"+feature.id+" using layer style :"+this.options.defaultstyle);
			if( !feature.style ) {
				feature.style = this.srd_styleArr[this.options.defaultstyle];
			}
//			console.log("Feature:"+feature.id+" using layer style :"+this.options.defaultstyle);
/*			for(var i in feature.tmpAttributes) {
				if(this.srd_styleArr[this.options.defaultstyle][i] ) {
					if( dojo.isString( this.srd_styleArr[this.options.defaultstyle][i]) && this.srd_styleArr[this.options.defaultstyle][i].charAt(0) == '$' && feature.attributes[this.srd_styleArr[this.options.defaultstyle][i].substr(2,this.srd_styleArr[this.options.defaultstyle][i].length-3)   ] ) {
						feature.tmpAttributes[i] = feature.attributes[ this.srd_styleArr[this.options.defaultstyle][i].substr(2,this.srd_styleArr[this.options.defaultstyle][i].length-3)  ];
					} else {
						feature.tmpAttributes[i] = this.srd_styleArr[this.options.defaultstyle][i];
					}
				}
			}
		}
*/
	}
	return;
}
// END srd_styleFunction 


// BEFORE ADD SHOULD ONLY BE USED FOR FEATURE SPECIFIC STYLING.
srd_layer.prototype.srd_beforeAdd = function( theObject ) {
//	console.log("Before Add Feature :"+theObject.feature.id+" on layer"+this.options.id);
	if( !this.options) {
		console.log("Feature :"+feature.id+" NO this.options!!!");
		return;
	}

/*
		var feature = theObject.feature;
		if( feature.data.style && this.srd_styleArr[feature.data.style]  ) {
			if( !feature.style ) {
				feature.style = {};
				for(var i in this.srd_styleArr[feature.data.style] ) {
					if( dojo.isString( this.srd_styleArr[feature.data.style][i]) && this.srd_styleArr[feature.data.style][i].charAt(0) == '$' ) {
						if( !feature.attributes[this.srd_styleArr[feature.data.style][i].substr(2,this.srd_styleArr[feature.data.style][i].length-3)] ) {
						feature.attributes[this.srd_styleArr[feature.data.style][i].substr(2,this.srd_styleArr[feature.data.style][i].length-3)] = '';
						}
						feature.style[i] = feature.attributes[this.srd_styleArr[feature.data.style][i].substr(2,this.srd_styleArr[feature.data.style][i].length-3)  ];
					} else {
						feature.style[i] = this.srd_styleArr[feature.data.style][i];
					}
				}
/// TODO TODO NEED TO FIX SYMBOLIZERS
//				feature.style.label = feature.attributes.label;
			}
		} else if ( this.options.defaultstyle && this.srd_styleArr[this.options.defaultstyle] ) {
			for(var i in this.srd_styleArr[this.options.defaultstyle] ) {
				if( dojo.isString( this.srd_styleArr[this.options.defaultstyle][i]) && this.srd_styleArr[this.options.defaultstyle][i].charAt(0) == '$' ) {

					if( !feature.attributes[ this.srd_styleArr[this.options.defaultstyle][i].substr(2,this.srd_styleArr[this.options.defaultstyle][i].length-3)] ) {
						feature.attributes[this.srd_styleArr[this.options.defaultstyle][i].substr(2,this.srd_styleArr[this.options.defaultstyle][i].length-3)] = '';
					}
				}
			}



//			console.log("Feature:"+feature.id+" using layer style :"+this.options.defaultstyle);
//			if( !feature.style ) {
//				feature.style = this.srd_styleArr[this.options.defaultstyle];
//			}
		}
*/

/*		if(feature.style) {
			for(var i in feature.style) {
				if( dojo.isString( feature.style[i]) && feature.style[i].charAt(0) == '$' && feature.attributes[feature.style[i].substr(2,feature.style[i].length-3)   ] ) {
						feature.style[i] = feature.attributes[ feature.style[i].substr(2,feature.style[i].length-3)  ];
				}
			}
		}
*/
	return;
}
// END srd_beforeAdd


// BEFORE refresh
srd_layer.prototype.refresh = function() {
	console.log("REFRESH on layer: "+this.options.id);
	dojo.when(this.store.query({"layer_id":this.options.id}), function(theFeatArr) {
		for(var i in this.layer.features) {
			var foundUpdateId = null;
			for(var j in theFeatArr) {
				// IF FOUND -> CHECK FOR UPDATE ON THAT FEATURE.
				if(this.layer.features[i].db_id == theFeatArr[j].id) {	
					foundUpdateId = this.layer.features[i].db_id;
					this.compareAndUpdateFeature(this.layer.features[i], theFeatArr[j]);
//					console.log("Update Feature: "+this.layer.features[i].db_id+" on Layer: "+this.options.id);
				}
			}
			// IF foundUpdateId == null -> DELETE 
			if( foundUpdateId == null) {
				console.log("Remove Feature: "+this.layer.features[i].db_id+" on Layer: "+this.options.id);
				this.layer.removeFeatures( Array(this.layer.features[i]), {silent:true} );
			}
		}
		for(var j in theFeatArr) {
		var addFeature = true;
			for(var i in this.layer.features) {
				if(this.layer.features[i].db_id == theFeatArr[j].id) {	
					addFeature = false;
				}
			}
			if(addFeature == true) {
				var theFeature = new OpenLayers.Feature.Vector( new OpenLayers.Geometry.fromWKT( theFeatArr[j].geometry), dojo.fromJson(theFeatArr[j].feature_data) );
				theFeature.db_id = theFeatArr[j].id;
//				theFeature.fid = theFeatArr[j].feature_id;
				console.log("Adding Feature: "+theFeature.db_id+" on Layer: "+this.options.id);
				this.layer.addFeatures( [theFeature], {silent:true} ); 
			}
		}	
	}.bind(this) );
	return;
}
// END refresh


// BEGIN srd_compareAndUpdateFeature 
srd_layer.prototype.compareAndUpdateFeature = function(oldFeat, newFeat) {
	console.log("Compare from Server Feature: "+oldFeat.db_id+" on Layer: "+this.options.id);
	var tmpDataStr = dojo.toJson(oldFeat.attributes);
	var updateFeature = false;
	if(tmpDataStr != newFeat.feature_data) {
		console.log(oldFeat.db_id+" DIFF IN DATA :"+tmpDataStr+" ::: "+newFeat.feature_data);
		updateFeature = true;
		delete oldFeat.attributes;
		oldFeat.attributes = dojo.toJson(newFeat.feature_data);
	} 
  var tmpGeomStr = oldFeat.geometry.toString();
	if( tmpGeomStr != newFeat.geometry ) {
		console.log(oldFeat.db_id+" DIFF IN GEOM :"+tmpGeomStr+" ::: "+newFeat.geometry);
		updateFeature = true;
		this.layer.removeFeatures([oldFeat], {silent:true} );	
		delete oldFeat.geometry;
		oldFeat.geometry =  new OpenLayers.Geometry.fromWKT( newFeat.geometry);
		this.layer.addFeatures([oldFeat], {silent:true} );
	}
	if(updateFeature == true) {
//		this.layer.drawFeature(oldFeat);
	}
	return;
}
// END compareAndUpdateFeature





