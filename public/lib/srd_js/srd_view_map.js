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
		//CONSTUCTOR
		constructor : function( view_data, parent_srd_doc) {
			console.log("srd_view_map constructor called!");
			this.srd_doc = parent_srd_doc;
			this.type = view_data.type;
			this.start_lat = view_data.start_lat;
			this.start_lon = view_data.start_lon;
			this.start_zoom = view_data.start_zoom;
			this.xPos = view_data.xPos;
			this.yPos = view_data.yPos;
			this.xDim = view_data.xDim;
			this.yDim = view_data.yDim;
			this.map = this.srd_doc.map;
			this.srd_layerArr = this.srd_doc.srd_layerArr;
			this.width = 50; //Math.round(100 / this.xDim);
			this.height = 50; //Math.round(100 / this.yDim);
			if(view_data.type == "map") {
//				this.containerStyle = 'width:'+this.width+'%; height:'+this.height+'%; background-color:blue;';
				this.containerStyle = 'width:300px; height:300px; background-color:blue;';
			}
			this.container = new dijit.layout.BorderContainer({
				style: this.containerStyle,
				region: 'center',
			} ); 

			this.srd_mapContent = new dijit.layout.ContentPane(
	     {  splitter: 'false', style: "background-color:white;width:100%;height:100%;border:0px;margin:0px;padding:0px;", region: 'center'} );
			this.container.addChild(this.srd_mapContent);
			this.mapDiv = dojo.create("div",{ 'class':'map' }, this.srd_mapContent.domNode);
//			this.srd_doc.viewContainer.addChild(this.srd_mapContent);
			this.srd_doc.viewContainer.addChild(this.container,this.xPos,this.yPos);
			this.map_init();
		},
		map_init : function() {
			if(this.map == null) {
				console.log("CREATING MAP!!!!");
				this.map = new OpenLayers.Map({ 
					controls: [
						new OpenLayers.Control.Navigation(),
						new OpenLayers.Control.PanZoomBar(),
						new OpenLayers.Control.Attribution(),
						new OpenLayers.Control.KeyboardDefaults()
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

				console.log("END map_init function");
		}

	}
);






