// srd_view.js
////////////////////////////////
// BASE CLASS FOR srd views 
//
//
//
//
//
/////////////////////////////////

//srd_view class definition using dojo.declare 
dojo.declare( 
	'srd_view',
	null,
	{
		// Pointer to parent srd_document class
		srd_doc : null,
		// type: this can be one of the following:
		// empty, map, datagrid, admin, view (more to come)
		type : null,
		container : null,
		selected : null,
		containerStyle : null,

		//CONSTUCTOR
		constructor : function( view_data, parent_srd_doc) {
			console.log("srd_view constructor called!");
			this.srd_doc = parent_srd_doc;
			if(view_data.type == 'empty') {
				this.containerStyle = 'height:100%;width:100%;background-color:gray;';
			}
			this.container = new dijit.layout.BorderContainer({
				style: this.containerStyle,
				region: 'center',
			} ); 
			
			this.srd_doc.viewContainer.addChild(this.container);
		}


	}
);






