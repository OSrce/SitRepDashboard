// srd_view_opstrack.js
////////////////////////////////
// srd view admin
//
//
//
//
//
/////////////////////////////////

dojo.require('dojox.timing');

//srd_view class definition using dojo.declare 
dojo.declare( 
	'srd_view_opstrack',
	srd_view,
	{
		srd_layerArr : null,
		srd_selLayer : null,
		srd_store		 : null,
		srd_dataStore		 : null,
		srd_datagrid : null,
	
		//CONSTUCTOR - REMEMBER SUPER CONSTRUCTOR GETS CALLED FIRST!
		constructor : function( view_data, parent_srd_doc) {
			dojo.addOnLoad( function() {
			console.log("srd_view_ops constructor called!");
			this.srd_layerArr = this.srd_doc.srd_layerArr;
			this.srd_selLayer = this.srd_doc.srd_selLayer;
//				console.log("Selected Layer : "+this.srd_selLayer.name);
				// DEFINE ALL THE DIFFERENT TABLE WE CAN CONNECT TO:
				this.tableList = {
					"Calls for service - SPRINT" : "/srdata/cfs/"
				}
				this.selectedTable = "Calls for service - SPRINT";
				this.selectedDataMenu = new dijit.Menu();
//				this.autoRefresh = false;				
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
				this.dataMenu.addChild(new dijit.CheckedMenuItem( {
					label: "Auto Refresh",
					srd_view: this,
					onClick: function() { this.srd_view.toggleAutoRefresh(this); } 
				} ) );
			
				this.srd_store = new dojo.store.Cache(
					dojo.store.JsonRest({ 
						target: this.tableList[this.selectedTable]
					} ),
					dojo.store.Memory() 
				);
				var gridCellsDijit = dojox.grid.cells;
				this.srd_structList = { 
					"Calls for service - SPRINT": [ {
						defaultCell: { width: 10, editable: false, cellStyles: 'text-align: center;'  },
						cells: [
							{ name: "Date", field:"cfs_date", width: "120px" },
							{ name: "Time", field:"cfs_timecreated", width: "90px" },
//							{ name: "Job Let", field:"cfs_letter", width: "50px" },
							{ name: "Job #", field:"cfs_num", width: "90px" },
							{ name: "Precinct", field:"cfs_pct", width: "50px" },
							{ name: "Sector", field:"cfs_sector", width: "50px" },
							{ name: "Address", field:"cfs_addr", width: "250px" },
							{ name: "Cross St 1", field:"cfs_cross1", width: "150px" },
							{ name: "Cross St 2", field:"cfs_cross2", width: "150px" },
							{ name: "Signal", field:"cfs_code", width: "90px", formatter:function(data) {
									if(data) { return "10-"+data} else { return ''; } }
						  },
							{ name: "Signal Info1", field:"cfs_codesup1", width: "50px" },
							{ name: "Signal Info2", field:"cfs_codesup2", width: "150px" },
							{ name: "Time Assigned", field:"cfs_timeassigned", width: "100px",  formatter: function(data) {
									if(data) { 
										var dateObj = dojo.date.locale.parse(data, { datePattern: 'yyyy-MM-dd', timePattern:'HH:mm:ss'} );
										if(dateObj) {
											var test =dojo.date.locale.format( dateObj, {selector:'time', timePattern: 'HH:mm'} );
											return test;
										} else {
											return data;
										}
									} else { return ''; } 
								}
							},
							{ name: "Priority", field:"cfs_priority", width: "50px" },
							{ name: "Final Disposition", field:"cfs_finaldis", width: "90px", formatter:function(data) {
									if(data) { return "10-"+data} else { return ''; } }
						  },
							{ name: "Final Disposition Info", field:"cfs_finaldissup1", width: "150px" },
							{ name: "Final Disposition Date/Time", field:"cfs_finaldisdate", width: "150px", formatter: function(data) {
									if(data) { 
										var dateObj = dojo.date.locale.parse(data, { datePattern: 'yyyy-MM-dd', timePattern:'HH:mm:ss'} );
										if(dateObj) {
											var test =dojo.date.locale.format( dateObj, {selector:'time', timePattern: 'HH:mm'} );
											return test;
										} else {
											return data;
										}
									} else { return ''; } 
								}
							},
							{ name: "Final Disposition Unit", field:"cfs_finaldisunit", width: "50px" },
							{ name: "Job is Duplicate", field:"cfs_dup", width: "50px" },
							{ name: "Last Updated From SPRINT", field:"cfs_updated_on", width: "150px" , formatter: function(data) {
									if(data) { 
										var dateObj = dojo.date.locale.parse(data, { datePattern: 'yyyy-MM-dd', timePattern:'HH:mm:ss'} );
										if(dateObj) {
											var test =dojo.date.locale.format( dateObj, {selector:'time', timePattern: 'HH:mm'} );
											return test;
										} else {
											return data;
										}
									} else { return ''; } 
								}
							}

//							{ name: "Body of Job", field:"cfs_body", width: "250px" }
							]
					} ]
					
				}
				this.srd_dataStore = new dojo.data.ObjectStore( { objectStore: this.srd_store } );
				this.srd_datagrid = new dojox.grid.EnhancedGrid( {
					store: this.srd_dataStore,
					structure : this.srd_structList[this.selectedTable],
					plugins: {nestedSorting: true},
					region : 'center'
				} );
				var todayStr = dojo.date.locale.format( new Date(), { datePattern: "y-M-d" } );
				this.srd_query = { cfs_date: todayStr, cfs_routenotifications: 'true'}; 
				this.srd_datagrid.setQuery(this.srd_query ); 
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
		},
		// END selectTable FUNCTION
		toggleAutoRefresh: function(menuItem) { 
			if( menuItem.checked == true ) {
				this.srd_timer = new dojox.timing.Timer(30000);
				this.srd_timer.onTick = function() { this.refreshTable();
					}.bind(this);				
				this.srd_timer.start();	
//				this.autoRefresh = true;
			} else {
				this.srd_timer.stop();	
//				this.autoRefresh = false;
			}
		},
		// END toggleAutoRefresh
		refreshTable: function() {
			console.log("Refresh Table Called!");
			this.srd_datagrid.setQuery(this.srd_query ); 
			this.srd_datagrid.setStore( this.srd_dataStore );
			this.srd_datagrid.setQuery(this.srd_query ); 
	
		}
	}
);






