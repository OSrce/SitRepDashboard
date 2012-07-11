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
		type: 'map',
		// MAP VARIABLES 
		map : null,
		srd_layerArr : null,
		start_lat : null,
		start_lon : null,
		start_zoom : null,
		geolocateLayer : null,
		geolocateControl : null,
		geolocateFirstTime : true,	
		//CONSTUCTOR
		constructor : function( view_data, parent_srd_doc) {
			console.log("srd_view_map constructor called!");
			this.start_lat = view_data.start_lat;
			this.start_lon = view_data.start_lon;
			this.start_zoom = view_data.start_zoom;
//			this.map = this.srd_doc.map;
			dojo.ready( function() {
			this.srd_layerArr = this.srd_doc.srd_layerArr;
			this.srd_mapContent = new dijit.layout.ContentPane(
	     {  splitter: 'false', style: "background-color:black;width:100%;height:100%;border:0px;margin:0px;padding:0px;", region: 'center'} );
			this.srd_mapContent.connect(this.srd_mapContent,'onShow', function(data) { this.map_init(); }.bind(this)  );
			this.insideContainer.addChild(this.srd_mapContent);
			}.bind(this) );
		},
		map_init : function() {
//			console.log("###############CALLED MAP_INIT");
//			dojo.ready(function() {
			if( this.map == null) {
				console.log("CREATING MAP!!!!");
				this.mapDiv = dojo.create("div",{ id: 'srdmap', 'class':'map', style:'top:0;left:0;width:100%;height:100%;' }, this.srd_mapContent.domNode);
				this.geolocateControl = new OpenLayers.Control.Geolocate( {
					bind: false,
					geolocationOptions: {
						enableHighAccuracy: false,
						maximumAge: 0,
						timeout: 7000
					}
				} );
				this.map = new OpenLayers.Map({ 
					controls: [
						new OpenLayers.Control.Navigation(),
						new OpenLayers.Control.PanZoomBar(),
						new OpenLayers.Control.Attribution(),
						new OpenLayers.Control.KeyboardDefaults(),
						this.geolocateControl
					],
					projection : "EPSG:900913",
					displayProjection: "EPSG:4326",
					units: "m",
					maxExtent : new OpenLayers.Bounds(-20037508.34,-20037508.34, 20037508.34, 20037508.34)
				} );
				this.map.render( this.mapDiv  ); 

				console.log("DONE CREATING MAP!!!!");
			////////////////////////
			///// LAYER CREATION ////


/*			this.map.setOptions( 
				{ projection :  new OpenLayers.Projection("EPSG:900913") ,
					displayProjection : new OpenLayers.Projection("EPSG:4326") }
				);
*/


			// Iterate through each srd_layer and call loadData and addLayerToMap)

			for(var i in this.srd_layerArr ) {
				console.log("Loading Layer:"+this.srd_layerArr[i].options.name+":::");
				this.srd_layerArr[i].loadData();
				console.log("addLayerToMap:"+this.srd_layerArr[i].options.name);
				this.srd_layerArr[i].addLayerToMap(this.map);
				console.log("Finished addLayerToMap:"+this.srd_layerArr[i].options.name);
			

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
			var lonlat = new OpenLayers.LonLat(this.start_lon, this.start_lat).transform( mapProjection, googleProjection  );

			this.map.setCenter( lonlat, this.start_zoom ); 
			this.map.zoomTo( this.start_zoom ); 
	
			console.log("goToPoint Lat/Lon/Zoom :"+this.start_lat+" / "+this.start_lon+" / "+this.start_zoom);	
			this.goToPoint(this.start_lat, this.start_lon);

//			console.log("Should be displaying Map at this point!");

			// IF start_base_layer is set to a valid baselayer we have, then we
			// should start with that base layer being the one shown.
			if(this.data.start_base_layer && this.srd_layerArr[this.data.start_base_layer]) {
				this.map.setBaseLayer(this.srd_layerArr[this.data.start_base_layer].layer);

			}





			// Adding the Control for the Layer select 
			this.map.addControl(new OpenLayers.Control.LayerSwitcher() );

			//BEGIN GEOLOCATION STUFF
			this.geolocateLayer = new OpenLayers.Layer.Vector('geolocateVector');
			this.map.addLayer(this.geolocateLayer);

			this.geolocateControl.events.register("locationupdated", this.geolocateControl, 
				function(e) {
					this.geolocateLayer.removeAllFeatures();
					var circle = new OpenLayers.Feature.Vector( 
						OpenLayers.Geometry.Polygon.createRegularPolygon(
							new OpenLayers.Geometry.Point(e.point.x, e.point.y),
							e.position.coords.accuracy/2,
							40,
							0
						),
						{},
						{ fillColor: '#000', fillOpacity: '0.1', strokeWidth: '0' }
					);
					console.log("Position Logged, Heading="+e.position.coords.heading);
					this.geolocateLayer.addFeatures([
						new OpenLayers.Feature.Vector(
							e.point,
							{},
							{
								graphicName: 'cross',
								strokeColor: '#00f',
								strokeWidth: 2,
								fillOpacity: 0,
								pointRadius: 10
							}
						),
						circle
					] );
					if(this.geolocateFirstTime) {
						this.map.zoomToExtent(this.geolocateLayer.getDataExtent() );
						this.pulsate(circle);
						this.geolocateFirstTime = false;
						this.bind = true;
					}			


				}.bind(this)
				// END function(e)
			);
			//END geolocateControl.events.register
			this.geolocateControl.events.register("locationfailed",this,function() {
				console.log( "Location detection failed!" );
			} );
// ATTEMPTING TO FIX MAP LOAD BUG...
//				dojo.ready(function() {
//				if(this.data.start_base_layer != null) {
//					this.map.removeLayer(this.srd_layerArr[this.data.start_base_layer].layer); 
//					this.map.addLayer(this.srd_layerArr[this.data.start_base_layer].layer); 
//						console.log("Redrawing Layer :"+this.srd_layerArr[i].options.name);
//				}
//				for(var i in this.srd_layerArr) {
//					if(this.srd_layerArr[i].options.isBaseLayer == true && this.srd_layerArr[i].options.visibility == true) {
//						this.srd_layerArr[i].layer.redraw();
//					} 
//				}
//				}.bind(this) );
				console.log("END map_init function");

				// CALL onLoad function to trigger the event.
				this.onLoad();
//			}.bind(this) );
			}
		},
		// END map_init
		// BEGIN goToPoint
		goToPoint : function(lat, lon) {
			console.log ("Go To Point called: lat="+lat+", lon="+lon);
			var googleProjection = new OpenLayers.Projection("EPSG:900913");
			var mapProjection = new OpenLayers.Projection("EPSG:4326");
			var lonlat = new OpenLayers.LonLat(lon, lat).transform( mapProjection, googleProjection  );
			this.map.panTo(lonlat);
		},
		//END goToPoint
		toggleLocationTracking: function( turnOn ) {
			this.geolocateLayer.removeAllFeatures();
			this.geolocateControl.deactivate();
			if( turnOn ) {
				this.geolocateControl.watch = true;
				this.geolocateFirstTime = true;
				this.geolocateControl.activate();
			}
		},
		//END toggleLocationTrackking
		pulsate: function(feature) {
			var point = feature.geometry.getCentroid(),
					bounds= feature.geometry.getBounds(),
					radius= Math.abs( (bounds.right - bounds.left)/2),
					count = 0,
					grow  = 'up';
			
			var resize = function() {
				if(count>16) {
					clearInterval(window.resizeInterval);
				}
				var interval = radius * 0.03;
				var ratio = interval / radius;
				switch(count) {
					case 4:
					case 12:
						grow = 'down';
					break;
					case 8:
						grow = 'up';
					break;
				}
				if ( grow!== 'up') {
					ratio = - Math.abs(ratio);
				}
				feature.geometry.resize(1+ratio, point);
				this.geolocateLayer.drawFeature(feature);
				count++;
			}.bind(this);
			window.resizeInterval = window.setInterval(resize, 50, point, radius);	
		},
		//END pulsate
		//BEGIN DESTROY
		destroy : function() {
// TODO - TO FIX : CAREFUL ON DELETING MAPS or LAYERS AS it may
//   SEND DELETE TO REMOVE FEATURES FROM SERVER.
			console.log("srd_view_map destroy called!");
			if(this.map) {
				for(var i in this.srd_layerArr) {
					if(this.srd_layerArr[i].layer != null) {
						console.log("Layer :"+this.srd_layerArr[i].options.name+" exists!");
//						this.srd_layerArr[i].layer.remove();
//						this.srd_layerArr[i].map = null;
//						delete this.srd_layerArr[i].layer;
					}
				}
//				this.map.unloadDestroy();
				delete this.map;
				dojo.destroy(this.mapDiv);
			}
			return;
		}
	}
);






