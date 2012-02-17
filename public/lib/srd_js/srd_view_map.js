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
			this.srd_layerArr = this.srd_doc.srd_layerArr;
			this.srd_mapContent = new dijit.layout.ContentPane(
	     {  splitter: 'false', style: "background-color:white;width:100%;height:100%;border:0px;margin:0px;padding:0px;", region: 'center'} );
			this.container.addChild(this.srd_mapContent);
			this.mapDiv = dojo.create("div",{ 'class':'map' }, this.srd_mapContent.domNode);
			this.map_init();
		},
		map_init : function() {
			if(this.map == null) {
				console.log("CREATING MAP!!!!");
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
					displayProjection: "EPSG:4326"
				} );
				this.map.render( this.mapDiv  ); 
				console.log("DONE CREATING MAP!!!!");
			}
			////////////////////////
			///// LAYER CREATION ////


			this.map.setOptions( 
				{ projection :  new OpenLayers.Projection("EPSG:900913") ,
					displayProjection : new OpenLayers.Projection("EPSG:4326") }
				);



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


			console.log("Should be displaying Map at this point!");


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
				console.log("END map_init function");
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
		}
		//END pulsate
	}
);






