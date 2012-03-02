// srd_view_datagrid.js
////////////////////////////////
// srd view datagrid 
//
//
//
//
//
/////////////////////////////////

//srd_view class definition using dojo.declare 
dojo.declare( 
	'srd_view_datagrid',
	srd_view,
	{
		srd_layerArr : null,
		srd_selLayer : null,
		srd_store		 : null,
		srd_datagrid : null,
	
		//CONSTUCTOR - REMEMBER SUPER CONSTRUCTOR GETS CALLED FIRST!
		constructor : function( view_data, parent_srd_doc) {
			console.log("srd_view_datagrid constructor called!");
			console.log("test2");
			this.srd_layerArr = this.srd_doc.srd_layerArr;
			console.log("test1");
			this.srd_selLayer = this.srd_doc.srd_selLayer;

			console.log("Selected Layer : "+this.srd_selLayer.name);
			this.srd_store = new dojo.store.Memory( { 
				data: this.srd_selLayer.layer.features,
				idProperty: "fid" 
			} );
			var theStruct = [
				{ name: "Feature ID", field:"fid", width: "50px" }
			];
			for(var dataType in this.srd_selLayer.layer.features[0].data) {
				theStruct.push( { 
					name: dataType,
					field: "data",
//					width: "50px",
					formatter: function(data) { 
						if(data) { return data[this.name]; 
						}else { return ''; }
				  }
				} );
			}
			this.srd_datagrid = new dojox.grid.DataGrid( {
				store: dataStore = dojo.data.ObjectStore({ objectStore: this.srd_store}),
//				structure : [ 
//					{ name: "Feature ID", field:"fid", width: "50px" },
//					{ name: "Data", field: "data[PctName]", width: "100px" }
//				],
				structure : theStruct,
				region : 'center'
			} );
			this.container.addChild(this.srd_datagrid);
			this.srd_datagrid.startup();
		}
	}
);






