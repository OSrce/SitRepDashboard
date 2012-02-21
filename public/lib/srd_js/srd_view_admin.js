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
				//TESTING TESTING - doesnt work yet.
				this.dataMenu.addChild(new dijit.MenuItem( {
					label: "Upload Changes",
					srd_view: this,
					onClick: function() { this.srd_view.srd_datagrid.store.save(); } 
				} ) );
			
				this.srd_store = new dojo.store.JsonRest( { 
					target: this.tableList[this.selectedTable]
				} );
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
				this.srd_datagrid = new dojox.grid.DataGrid( {
					store: dataStore = dojo.data.ObjectStore({ objectStore: this.srd_store}),
					structure : this.srd_structList[this.selectedTable],
					region : 'center'
				} );
				this.container.addChild(this.srd_datagrid);
				this.srd_doc.srd_dataMenuPopup.set('popup',this.dataMenu );
		
		},
		selectTable: function( selTable) {
			if(this.selectedTable != selTable) {
			console.log( "Selected Table called: "+selTable);	
				this.selectedTable = selTable;
				delete this_srd_datagrid;
				delete this.srd_store;
				this.srd_store = new dojo.store.JsonRest( { 
					target: this.tableList[this.selectedTable]
				} );
				this.srd_datagrid = new dojox.grid.DataGrid( {
					store: dataStore = dojo.data.ObjectStore({ objectStore: this.srd_store}),
					structure : this.srd_structList[this.selectedTable],
					region : 'center'
				} );
				this.container.addChild(this.srd_datagrid);
			}
		}
	}
);






