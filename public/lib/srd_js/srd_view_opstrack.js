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
		srd_mapModes : {
			"Precinct" : 1,
			"Sector"   : 2,
			"Address"  : 3
		},	
		srd_selMapMode : 1,
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
				this.dataMenu.addChild(new dijit.CheckedMenuItem( {
					label: "Map Data",
					srd_view: this,
					onClick: function() { this.srd_view.toggleMapData(this); } 
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
							{ name: "Date", field:"cfs_date", width: "120px", hidden:true },
							{ name: "Time", field:"cfs_timecreated", width: "90px", formatter:this.dateToTime},
//							{ name: "Job Let", field:"cfs_letter", width: "50px" },
							{ name: "Job #", field:"cfs_num", width: "90px" },
							{ name: "Precinct", field:"cfs_pct", width: "50px" },
							{ name: "Sector", field:"cfs_sector", width: "50px" },
							{ name: "Address", field:"cfs_addr", width: "250px" },
							{ name: "Cross St 1", field:"cfs_cross1", width: "150px" },
							{ name: "Cross St 2", field:"cfs_cross2", width: "150px" },
							{ name: "Signal", field:"cfs_code", width: "90px", formatter: this.formatSignal},
							{ name: "Signal Info1", field:"cfs_codesup1", width: "50px" },
							{ name: "Signal Info2", field:"cfs_codesup2", width: "150px" },
							{ name: "Time Assigned", field:"cfs_timeassigned", width: "100px",  formatter: this.dateToTime },
							{ name: "Priority", field:"cfs_priority", width: "50px" },
							{ name: "Final Disposition", field:"cfs_finaldis", width: "90px", formatter:function(data) {
									if(data) { return "10-"+data} else { return ''; } }
						  },
							{ name: "Final Disposition Info", field:"cfs_finaldissup1", width: "150px" },
							{ name: "Final Disposition Date/Time", field:"cfs_finaldisdate", width: "150px", formatter:this.dateToTime},
							{ name: "Final Disposition Unit", field:"cfs_finaldisunit", width: "50px" },
							{ name: "Job is Duplicate", field:"cfs_dup", width: "50px" },
							{ name: "Last Updated From SPRINT", field:"cfs_updated_on", width: "150px" , formatter:this.dateToTime}

//							{ name: "Body of Job", field:"cfs_body", width: "250px" }
							]
					} ]
					
				}
				this.srd_dataStore = new dojo.data.ObjectStore( { objectStore: this.srd_store } );
				this.srd_datagrid = new dojox.grid.EnhancedGrid( {
					store: this.srd_dataStore,
					structure : this.srd_structList[this.selectedTable],
					plugins: {nestedSorting: true},
					sortFields: [{attribute:'cfs_finaldisdate', descending:true},{attribute:'cfs_timecreated', descending:true}],
					region : 'center'
				} );
				this.srd_query = { SREXPR: "( cfs_finaldis IS NULL OR cfs_finaldisdate >= current_timestamp - interval '15 minutes' ) AND cfs_routenotifications = 'true'" }; 
				this.srd_datagrid.setQuery(this.srd_query ); 
				this.insideContainer.addChild(this.srd_datagrid);
				dojo.connect(this.srd_datagrid, 'onRowDblClick', this, 'popupCfsSingle');
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
				//TODO FIX THIS - IT DOES NOT WORK!!!!
				dojo.connect(this.srd_datagrid, 'onRowDblClick', this, 'popupCfsSingle');
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
		// BEGIN toggleMapData 
		toggleMapData: function(menuItem) { 
			if( menuItem.checked == true ) {
				//CHECKED
					console.log("Adding OpsTrack to Map");
//				this.srd_doc.srd_createLayer("OpsTracking",'');
					var theOptions = {
						name: 'OpsTrack',
						id:'-1',
						isBaseLayer: false,
						visibility: true,
						type: "Vector",
						format: "NONE"	

					}
					this.srd_layer = new srd_layer();
					this.srd_layer.options = theOptions;
//					this.srd_layerArr
					this.srd_layer.loadData();
					// NEED TO FIX TODO:::
					this.srd_layer.addLayerToMap(this.srd_doc.selectedView.map);
//					var theQuery ={ cfs_finaldis: null, cfs_routenotifications: 'true'}; 
					this.srd_store.query(this.srd_query).forEach( function( cfs) {
						if(this.srd_selMapMode == 1) {
							// USE PCT BOUNDARIES
							var pct = cfs.cfs_pct;
							var jobNum = cfs.cfs_num;
							var searchVal = String(pct);
							var theRefFeat = this.srd_layerArr[2001].layer.getFeaturesByAttribute('PctName',searchVal);
							console.log("Create Feature for Job:"+jobNum+" in :"+searchVal);
							if(theRefFeat && theRefFeat.length > 0) {
								console.log("Adding Feature to Vector Layer!");
								var theFeatureAttr = { 
									label: cfs.cfs_code,
									body : "Signal: "+cfs.cfs_code+" Job :"+cfs.cfs_num,
									style: 2001
								}
								var theFeat = new OpenLayers.Feature.Vector(theRefFeat[0].geometry,theFeatureAttr,null);
								this.srd_layer.layer.addFeatures( Array( theFeat), {});
							}
						} else if(this.srd_selMapMode == 2) {
							// USE SECTOR BOUNDARIES
							var pct = cfs.cfs_pct;
							var jobNum = cfs.cfs_num;
							var sector = cfs.cfs_sector;
							var searchVal = pct+sector;
							var theRefFeat = this.srd_layerArr[3001].layer.getFeaturesByAttribute('Name',searchVal);
							console.log("Create Feature for Job:"+jobNum+" in :"+searchVal);
							if(theRefFeat && theRefFeat.length > 0) {
								console.log("Adding Feature to Vector Layer!");
								var theFeatureAttr = { 
									label: cfs.cfs_code,
									body : "Signal: "+cfs.cfs_code+" Job :"+cfs.cfs_num,
									style: 2001
								}
								var theFeat = new OpenLayers.Feature.Vector(theRefFeat[0].geometry,theFeatureAttr,null);
								this.srd_layer.layer.addFeatures( Array( theFeat), {});
							}
						} else if(this.srd_selMapMode ==3) {
							// USE Actual Address (if it was geocoded)
//							console.log("Create Feature for Job:"+jobNum+" in :"+searchVal);
//							if(theRefFeat && theRefFeat.length > 0) {
//								console.log("Adding Feature to Vector Layer!");
//								var theFeat = new OpenLayers.Feature.Vector(theRefFeat[0].geometry,cfs,null);
//								this.srd_layer.layer.addFeatures( Array( theFeat), {});
//							}
						}
				}.bind(this) );

			} else {
				//UNCHECKED
			}
		},
		// END toggleMapData
		refreshTable: function() {
			console.log("Refresh Table Called!");
			this.srd_datagrid.setQuery(this.srd_query ); 
			this.srd_datagrid.setStore( this.srd_dataStore );
			this.srd_datagrid.setQuery(this.srd_query ); 
		},
		// END refreshTable
		// BEGIN popupCfsSingle
		popupCfsSingle: function(evt) {
			var selectedItem = this.srd_datagrid.getItem(this.srd_datagrid.selection.selectedIndex);
			var theDate = this.srd_datagrid.store.getValue( selectedItem, 'cfs_date' );
			var theJobNum = this.srd_datagrid.store.getValue( selectedItem, 'cfs_num' );
			console.log("popupCfsSingle CALLED: "+theDate+" ::: "+theJobNum);
			var urlStr = '/home/cfssingle?cfs_date='+theDate+"&cfs_num="+theJobNum;
//			var theWindow = window.open(urlStr,'Calls For Service - Single View','width=650px');	
			var theWindow = window.open(urlStr,'CallsForService','width=612,scrollbars=1,resizeable=1');	

		}
	}
);






