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
		srd_dataStore		 : null,
		srd_datagrid : null,
	
		//CONSTUCTOR - REMEMBER SUPER CONSTRUCTOR GETS CALLED FIRST!
		constructor : function( view_data, parent_srd_doc) {
			console.log("srd_view_admin constructor called!");
			this.srd_layerArr = this.srd_doc.srd_layerArr;
			this.srd_selLayer = this.srd_doc.srd_selLayer;
//				console.log("Selected Layer : "+this.srd_selLayer.name);
				// DEFINE ALL THE DIFFERENT TABLE WE CAN CONNECT TO:
				this.tableList = {
					"Users" : "/srdata/Users/",
					"Groups" : "/srdata/Groups/",
					"Permissions" : "/srdata/Permissions/",
					"Modules" : "/srdata/Modules/",
					"Sessions" : "/srdata/Sessions/",
					"Layers" : "/srdata/Layers/",
					"Styles" : "/srdata/Styles/",
					"Style Presets" : "/srdata/Stylepresets/",
					"Calls for service - SPRINT" : "/srdata/Cfs/"
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
					"Users": [
						{ name: "User ID", field:"uid", width: "50px" },
						{ name: "Group ID", field:"gid", width: "50px" },
						{ name: "Username", field:"username", width: "50px" },
						{ name: "First Name", field:"firstname", width: "50px" },
						{ name: "Last Name", field:"lastname", width: "50px" },
						{ name: "Title", field:"title", width: "50px" },
						{ name: "Title Code", field:"titlecode", width: "50px" },
						{ name: "Email", field:"email", width: "50px" },
						{ name: "Last Login", field:"last_login", width: "50px" },
						{ name: "View Layout X", field:"view_layout_x", width: "50px" },
						{ name: "View Layout Y", field:"view_layout_y", width: "50px" },
						{ name: "View Data", field:"view_data", width: "50px" }
					],
					"Groups": [
						{ name: "Group ID", field:"gid", width: "50px" },
						{ name: "Parent ID", field:"parent_gid", width: "50px" },
						{ name: "Groupname", field:"groupname", width: "50px" }
					],
					"Permissions": [
						{ name: "Permission ID", field:"permission_id", width: "50px" },
						{ name: "Role Type", field:"role_type", width: "50px" },
						{ name: "Role Id", field:"role_id", width: "50px" },
						{ name: "Resource Type", field:"resource_type", width: "50px" },
						{ name: "Resource ID", field:"resource_id", width: "50px" },
						{ name: "Create", field:"permission_create", width: "50px" },
						{ name: "Read", field:"permission_read", width: "50px" },
						{ name: "Update", field:"permission_update", width: "50px" },
						{ name: "Delete", field:"permission_delete", width: "50px" }
					],
					"Modules": [
						{ name: "Module ID", field:"id", width: "50px" },
						{ name: "Module Name", field:"name", width: "50px" }
					],
					"Sessions": [
						{ name: "Session ID", field:"id", width: "50px" },
						{ name: "Modified", field:"modified", width: "50px" },
						{ name: "Lifetime", field:"lifetime", width: "50px" },
						{ name: "Data", field:"data", width: "50px" }
					],
					"Layers": [ {
						defaultCell: { width: 10, editable: true },
						cells: [
							{ name: "ID", field:"id", width: "50px" },
							{ name: "Name", field:"name", width: "50px" },
							{ name: "Type", field:"type", width: "50px" },
							{ name: "Format", field:"format", width: "50px" },
							{ name: "isBaseLayer", field:"isbaselayer", width: "50px" },
							{ name: "Projection", field:"projection", width: "50px" },
							{ name: "Visibility", field:"visibility", width: "50px" },
							{ name: "Spherical Mercator", field:"sphericalmercator", width: "50px" },
							{ name: "Url", field:"url", width: "100px" },
							{ name: "Zoom Levels", field:"numzoomlevels", width: "50px" },
							{ name: "Min Zoom Level", field:"minzoomlevel", width: "50px" },
							{ name: "Max Zoom Level", field:"maxzoomlevel", width: "50px" },
							{ name: "Attribution", field:"attribution", width: "50px" },
							{ name: "Default Style ID", field:"defaultstyle", width: "50px" },
							{ name: "Data Table", field:"datatable", width: "50px" },
							{ name: "Created On", field:"created_on", width: "50px" },
							{ name: "Created By", field:"created_by", width: "50px" },
							{ name: "Updated On", field:"updated_on", width: "50px" },
							{ name: "Updated By", field:"updated_by", width: "50px" }
						]
					} ]  ,
					"Styles": [ {
						defaultCell: { width: 10, editable: true },
						cells: [
							{ name: "ID", field:"id", width: "50px" },
//							{ hidden: true, field:"id" },
							//TESTING TESTING --- NEED TO FIX!!!!
//							{ name: "ID", field:"grid_id", width: "50px", formatter: 
//								function(data) { return data.id;  }
//							 },
							{ name: "Name", field:"name", width: "50px" },
							{ name: "Label", field:"label", width: "50px" },
							{ name: "Fill Color", field:"fillcolor", width: "50px" },
							{ name: "Fill Opacity", field:"fillopacity", width: "50px" },
							{ name: "Stroke Color", field:"strokecolor", width: "50px" },
							{ name: "Stroke Opacity", field:"strokeopacity", width: "50px" },
							{ name: "Stroke Width", field:"strokewidth", width: "50px" },
							{ name: "Point Radius", field:"pointradius", width: "50px" },
							{ name: "Font Color", field:"fontcolor", width: "50px" },
							{ name: "Font Size", field:"fontsize", width: "50px" },
							{ name: "Font Family", field:"fontfamily", width: "50px" },
							{ name: "Font Weight", field:"fontweight", width: "50px" },
							{ name: "Font Opacity", field:"fontopacity", width: "50px" },
							{ name: "Label Align", field:"labelalign", width: "50px" },
							{ name: "Label X Offset", field:"labelxoffset", width: "50px" },
							{ name: "Label Y Offset", field:"labelyoffset", width: "50px" },
							{ name: "External Graphic", field:"externalgraphic", width: "50px" },
							{ name: "Graphic Width", field:"graphicwidth", width: "50px" },
							{ name: "Graphic Height", field:"graphicheight", width: "50px" },
							{ name: "Graphic Opacity", field:"graphicopacity", width: "50px" },
							{ name: "rotation", field:"rotation", width: "50px" },
							{ name: "Created On", field:"created_on", width: "50px" },
							{ name: "Created By", field:"created_by", width: "50px" },
							{ name: "Updated On", field:"updated_on", width: "50px" },
							{ name: "Updated By", field:"updated_by", width: "50px" }
						]
					} ],
					"Style Presets": [ {
						defaultCell: { width: 10, editable: true },
						cells: [
							{ name: "ID", field:"id", width: "50px" },
							{ name: "Name", field:"name", width: "50px" },
							{ name: "Style ID", field:"style_id", width: "50px" },
							{ name: "Layer ID", field:"layer_id", width: "50px" },
							{ name: "Group ID", field:"group_id", width: "50px" },
							{ name: "User ID", field:"user_id", width: "50px" }
							]
					} ],
					"Calls for service - SPRINT": [ {
						defaultCell: { width: 10, editable: true },
						cells: [
							{ name: "Date", field:"cfs_date", width: "80px" },
							{ name: "Time", field:"cfs_timecreated", width: "50px" },
							{ name: "Job Let", field:"cfs_letter", width: "50px" },
							{ name: "Job #", field:"cfs_num", width: "50px" },
							{ name: "Precinct", field:"cfs_pct", width: "50px" },
							{ name: "Sector", field:"cfs_sector", width: "50px" },
							{ name: "Address", field:"cfs_addr", width: "100px" },
							{ name: "Cross St 1", field:"cfs_cross1", width: "50px" },
							{ name: "Cross St 2", field:"cfs_cross2", width: "50px" },
							{ name: "Signal", field:"cfs_code", width: "50px", formatter:function(data) {
									if(data) { return "10-"+data} else { return ''; } }
						  },
							{ name: "Signal Info1", field:"cfs_codesup1", width: "50px" },
							{ name: "Signal Info2", field:"cfs_codesup2", width: "50px" },
							{ name: "Time Assigned", field:"cfs_timeassigned", width: "50px" },
							{ name: "Priority", field:"cfs_priority", width: "50px" },
							{ name: "Ops Tracking", field:"cfs_routenotifications", width: "50px" },
							{ name: "Final Disposition", field:"cfs_finaldis", width: "50px" },
							{ name: "Final Disposition Info", field:"cfs_finaldissup1", width: "50px" },
							{ name: "Final Disposition Date/Time", field:"cfs_finaldisdate", width: "50px" },
							{ name: "Final Disposition Unit", field:"cfs_finaldisunit", width: "50px" },
							{ name: "Job is Duplicate", field:"cfs_dup", width: "50px" },

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
				this.container.addChild(this.srd_datagrid);
				this.srd_doc.srd_dataMenuPopup.set('popup',this.dataMenu );
		
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
				this.container.addChild(this.srd_datagrid);
			}
		}
	}
);






