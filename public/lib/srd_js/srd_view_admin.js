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
require( [
	"dojo/_base/declare",
	"srd_js/srd_view"
], function(declare, srd_view) {


declare( 
	'srd_view_admin',
	[srd_view],
	{
		srd_layerArr : null,
		srd_selLayer : null,
		srd_store		 : null,
		srd_dataStore		 : null,
		srd_datagrid : null,
	
		//CONSTUCTOR - REMEMBER SUPER CONSTRUCTOR GETS CALLED FIRST!
		constructor : function( view_data, parent_srd_doc) {
			dojo.addOnLoad( function() {
			console.log("srd_view_admin constructor called!");
			this.srd_layerArr = this.srd_doc.srd_layerArr;
			this.srd_selLayer = this.srd_doc.srd_selLayer;
//				console.log("Selected Layer : "+this.srd_selLayer.name);
				// DEFINE ALL THE DIFFERENT TABLE WE CAN CONNECT TO:
				this.tableList = {
					"Users" : "/srdata/users/",
					"Groups" : "/srdata/groups/",
					"Permissions" : "/srdata/permissions/",
					"Modules" : "/srdata/modules/",
					"Sessions" : "/srdata/sessions/",
					"Layers" : "/srdata/layers/",
					"Styles" : "/srdata/styles/",
					"Style Presets" : "/srdata/stylepresets/",
					"Calls for service - SPRINT" : "/srdata/cfs/"
				}
				this.selectedTable = "Users";
				this.selectedDataMenu = new dijit.Menu();
				for( var tmpTable in this.tableList) {
					console.log("Table Type:"+tmpTable);
					this.selectedDataMenu.addChild( new dijit.MenuItem( {
						label: tmpTable,
						value: this.tableList[tmpTable],
						srd_view: this,
						onClick: function() { this.srd_view.selectTable(this.label); }
					} ) );	
				}
				this.dataMenu.addChild(new dijit.PopupMenuItem( {
					label: "Selected Table: ",
					popup: this.selectedDataMenu
				} ) );
				this.dataMenu.addChild(new dijit.MenuItem( {
					label: "Upload Changes",
					srd_view: this,
					onClick: function() { this.srd_view.srd_dataStore.save(); } 
				} ) );
				this.dataMenu.addChild(new dijit.MenuItem( {
					label: "Create New Item",
					srd_view: this,
					onClick: function() { this.srd_view.createItem(); } 
				} ) );
				this.dataMenu.addChild(new dijit.MenuItem( {
					label: "Delete Selected",
					srd_view: this,
					onClick: function() { this.srd_view.deleteSelectedItems(); } 
				} ) );
	
			
				this.srd_store = new dojo.store.Cache(
					dojo.store.JsonRest({ 
						target: this.tableList[this.selectedTable]
					} ),
					dojo.store.Memory() 
				);
				var gridCellsDijit = dojox.grid.cells;
				this.srd_structList = { 
					defaultCell: { autoWidth:true, width:60, editable: true },
					"Users": [
						{ name: "User ID", field:"uid" },
						{ name: "Group ID", field:"gid" },
						{ name: "Username", field:"username" },
						{ name: "First Name", field:"firstname" },
						{ name: "Last Name", field:"lastname" },
						{ name: "Title", field:"title" },
						{ name: "Title Code", field:"titlecode" },
						{ name: "Email", field:"email" },
						{ name: "Last Login", field:"last_login" },
//						{ name: "View Layout X", field:"view_layout_x" },
//						{ name: "View Layout Y", field:"view_layout_y" },
//						{ name: "View Data", field:"view_data" }
						{ name: "Default Window Layout", field:"wlayout" }
					],
					"Groups": [
						{ name: "Group ID", field:"gid" },
						{ name: "Parent ID", field:"parent_gid" },
						{ name: "Groupname", field:"groupname" }
					],
					"Permissions": [
						{ name: "Permission ID", field:"permission_id" },
						{ name: "Role Type", field:"role_type" },
						{ name: "Role Id", field:"role_id" },
						{ name: "Resource ID", field:"resource_id" },
						{ name: "Create", field:"permission_create" },
						{ name: "Read", field:"permission_read" },
						{ name: "Update", field:"permission_update" },
						{ name: "Delete", field:"permission_delete" }
					],
					"Modules": [
						{ name: "Module ID", field:"id" },
						{ name: "Module Name", field:"name"  }
					],
					"Sessions": [
						{ name: "Session ID", field:"id" },
						{ name: "Modified", field:"modified" },
						{ name: "Lifetime", field:"lifetime" },
						{ name: "Data", field:"data" }
					],
					"Layers": [ {
						defaultCell: { width: 10, editable: true },
						cells: [
							{ name: "ID", field:"id" },
							{ name: "Name", field:"name" },
							{ name: "Type", field:"type" },
							{ name: "Format", field:"format" },
							{ name: "isBaseLayer", field:"isbaselayer" },
							{ name: "Projection", field:"projection" },
							{ name: "Visibility", field:"visibility" },
							{ name: "Spherical Mercator", field:"sphericalmercator" },
							{ name: "Url", field:"url", width: "100px" },
							{ name: "Zoom Levels", field:"numzoomlevels" },
							{ name: "Min Zoom Level", field:"minzoomlevel" },
							{ name: "Max Zoom Level", field:"maxzoomlevel" },
							{ name: "Attribution", field:"attribution" },
							{ name: "Default Style ID", field:"defaultstyle" },
							{ name: "Data Table", field:"datatable" },
							{ name: "Created On", field:"created_on" },
							{ name: "Created By", field:"created_by" },
							{ name: "Updated On", field:"updated_on" },
							{ name: "Updated By", field:"updated_by" }
						]
					} ]  ,
					"Styles": [ {
						defaultCell: { width: 10, editable: true },
						cells: [
							{ name: "ID", field:"id" },
//							{ hidden: true, field:"id" },
							//TESTING TESTING --- NEED TO FIX!!!!
//							{ name: "ID", field:"grid_id", formatter: 
//								function(data) { return data.id;  }
//							 },
							{ name: "Name", field:"name" },
							{ name: "Label", field:"label" },
							{ name: "Fill Color", field:"fillcolor" },
							{ name: "Fill Opacity", field:"fillopacity" },
							{ name: "Stroke Color", field:"strokecolor" },
							{ name: "Stroke Opacity", field:"strokeopacity" },
							{ name: "Stroke Width", field:"strokewidth" },
							{ name: "Point Radius", field:"pointradius" },
							{ name: "Font Color", field:"fontcolor" },
							{ name: "Font Size", field:"fontsize" },
							{ name: "Font Family", field:"fontfamily" },
							{ name: "Font Weight", field:"fontweight" },
							{ name: "Font Opacity", field:"fontopacity" },
							{ name: "Label Align", field:"labelalign" },
							{ name: "Label X Offset", field:"labelxoffset" },
							{ name: "Label Y Offset", field:"labelyoffset" },
							{ name: "External Graphic", field:"externalgraphic" },
							{ name: "Graphic Width", field:"graphicwidth" },
							{ name: "Graphic Height", field:"graphicheight" },
							{ name: "Graphic Opacity", field:"graphicopacity" },
							{ name: "rotation", field:"rotation" },
							{ name: "Created On", field:"created_on" },
							{ name: "Created By", field:"created_by" },
							{ name: "Updated On", field:"updated_on" },
							{ name: "Updated By", field:"updated_by" }
						]
					} ],
					"Style Presets": [ {
						defaultCell: { width: 10, editable: true },
						cells: [
							{ name: "ID", field:"id" },
							{ name: "Name", field:"name" },
							{ name: "Style ID", field:"style_id" },
							{ name: "Layer ID", field:"layer_id" },
							{ name: "Group ID", field:"group_id" },
							{ name: "User ID", field:"user_id" }
							]
					} ],
					"Calls for service - SPRINT": [ {
						defaultCell: { width: 10, editable: true },
						cells: [
							{ name: "Date", field:"cfs_date", width: "80px" },
							{ name: "Time", field:"cfs_timecreated" },
							{ name: "Job Let", field:"cfs_letter" },
							{ name: "Job #", field:"cfs_num" },
							{ name: "Precinct", field:"cfs_pct" },
							{ name: "Sector", field:"cfs_sector" },
							{ name: "Address", field:"cfs_addr", width: "100px" },
							{ name: "Cross St 1", field:"cfs_cross1" },
							{ name: "Cross St 2", field:"cfs_cross2" },
							{ name: "Signal", field:"cfs_code", formatter:function(data) {
									if(data) { return "10-"+data} else { return ''; } }
						  },
							{ name: "Signal Info1", field:"cfs_codesup1" },
							{ name: "Signal Info2", field:"cfs_codesup2" },
							{ name: "Time Assigned", field:"cfs_timeassigned" },
							{ name: "Priority", field:"cfs_priority" },
							{ name: "Ops Tracking", field:"cfs_routenotifications" },
							{ name: "Final Disposition", field:"cfs_finaldis" },
							{ name: "Final Disposition Info", field:"cfs_finaldissup1" },
							{ name: "Final Disposition Date/Time", field:"cfs_finaldisdate" },
							{ name: "Final Disposition Unit", field:"cfs_finaldisunit" },
							{ name: "Job is Duplicate", field:"cfs_dup" },

							{ name: "Body of Job", field:"cfs_body", width: "250px" }
							]
					} ]
					
				}

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
				this.srd_dataStore = new dojo.data.ObjectStore( { objectStore: this.srd_store } );
				this.srd_datagrid = new dojox.grid.EnhancedGrid( {
					store: this.srd_dataStore,
					structure : this.srd_structList[this.selectedTable],
					plugins: {nestedSorting: true},
					region : 'center'
				} );
				this.insideContainer.addChild(this.srd_datagrid);
				this.srd_doc.srd_dataMenuPopup.set('popup',this.dataMenu );
			}.bind(this) );	
		},
		deleteSelectedItems: function() {
			var items = this.srd_datagrid.selection.getSelected();
			if(items.length) {
				dojo.forEach(items,function(selectedItem) {
					if(selectedItem !== null) {
						this.srd_dataStore.deleteItem(selectedItem);
					}
				}.bind(this) );
			}
		},
		createItem: function() {
			var item = {'id': 0 };
			this.srd_dataStore.newItem(item);
		},
		selectTable: function( selTable) {
			if(this.selectedTable != selTable) {
			console.log( "Selected Table called: "+selTable);	
				this.selectedTable = selTable;
				delete this.srd_datagrid;
				delete this.srd_dataStore;
				delete this.srd_store;
				this.srd_store = new dojo.store.Cache(
					dojo.store.JsonRest({ 
						target: this.tableList[this.selectedTable]
					} ),
					dojo.store.Memory() 
				);
				this.srd_dataStore = new dojo.data.ObjectStore( { objectStore: this.srd_store } );
				this.srd_datagrid = new dojox.grid.EnhancedGrid( {
					store: this.srd_dataStore,
					structure : this.srd_structList[this.selectedTable],
					plugins: {nestedSorting: true},
					region : 'center'
				} );
				this.insideContainer.addChild(this.srd_datagrid);
			}
		}
	}
);


} );



