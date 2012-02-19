// srd_view_admin.js
////////////////////////////////
// srd view admin
//
//
//
//
//
/////////////////////////////////

//srd_view class definition using dojo.declare 
dojo.declare( 
	'srd_view_admin',
	srd_view,
	{
		srd_layerArr : null,
		srd_selLayer : null,
		srd_store		 : null,
		srd_datagrid : null,
	
		//CONSTUCTOR - REMEMBER SUPER CONSTRUCTOR GETS CALLED FIRST!
		constructor : function( view_data, parent_srd_doc) {
			console.log("srd_view_admin constructor called!");
			this.srd_layerArr = this.srd_doc.srd_layerArr;
			this.srd_selLayer = this.srd_doc.srd_selLayer;
//				console.log("Selected Layer : "+this.srd_selLayer.name);
				this.srd_store = new dojo.store.JsonRest( { 
					target: "/srdata/Users/"
				} );
				var theStruct = [
					{ name: "Feature ID", field:"fid", width: "50px" }
				];

/*				for(var dataType in this.srd_selLayer.layer.features[0].data) {
					theStruct.push( { 
						name: dataType,
						field: "data",
//						width: "50px",
						formatter: function(data) { 
							if(data) { return data[this.name]; 
							}else { return ''; }
					  }
					} );
				}
*/
				this.srd_datagrid = new dojox.grid.DataGrid( {
					store: dataStore = dojo.data.ObjectStore({ objectStore: this.srd_store}),
					structure : theStruct,
					region : 'center'
				} );
				this.container.addChild(this.srd_datagrid);

				//TESTING ONLY
				this.srd_store.remove(3);
		
		}
	}
);






