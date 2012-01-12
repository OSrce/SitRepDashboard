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
	
		//CONSTUCTOR - REMEMBER SUPER CONSTRUCTOR GETS CALLED FIRST!
		constructor : function( view_data, parent_srd_doc) {
			console.log("srd_view_datagrid constructor called!");
			this.srd_layerArr = this.srd_doc.srd_layerArr;
			this.srd_selLayer = this.srd_doc.selLayer;
		}
	}
);






