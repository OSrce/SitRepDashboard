// srd_view_cfssingle.js
////////////////////////////////
// srd view calls for service single view.
//
//
//
//
//
/////////////////////////////////

dojo.require("dijit.form.DateTextBox");

//srd_view class definition using dojo.declare 
dojo.declare( 
	'srd_view_cfssingle',
	srd_view,
	{
		srd_layerArr : null,
		srd_selLayer : null,
		srd_store		 : null,
		srd_dataStore		 : null,
		srd_datagrid : null,
		onChangeActivated : true,
	
		//CONSTUCTOR - REMEMBER SUPER CONSTRUCTOR GETS CALLED FIRST!
		constructor : function( view_data, parent_srd_doc) {
			dojo.addOnLoad( function() {
			console.log("srd_view_cfssingle constructor called!");
			this.srd_layerArr = this.srd_doc.srd_layerArr;
			this.srd_selLayer = this.srd_doc.srd_selLayer;
//				console.log("Selected Layer : "+this.srd_selLayer.name);
				// DEFINE ALL THE DIFFERENT TABLE WE CAN CONNECT TO:
				this.tableList = {
					"Calls for service - SPRINT" : "/srdata/cfs/"
				}
				this.selectedTable = "Calls for service - SPRINT";
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
					"Calls for service - SPRINT": [ {
						defaultCell: { width: 10, editable: false },
						cells: [
							{ name: "Date", field:"cfs_date", srdtype:"DateTextBox", srdrow:1, width:"80px", editable: true},
							{ name: "Time", field:"cfs_timecreated", srdtype:"PlainText", srdrow:2, width: "50px" },
							{ name: "Job Let", field:"cfs_letter", srdtype:"Hidden", width: "50px" },
							{ name: "Job #", field:"cfs_num", srdtype:"Text", srdrow:1, width: "50px", editable:true },
							{ name: "Precinct", field:"cfs_pct", srdtype:"PlainText", srdrow:2, width: "50px" },
							{ name: "Sector", field:"cfs_sector", srdtype:"Hidden", width: "50px" },
							{ name: "Address", field:"cfs_addr", srdtype:"PlainText", srdrow:3,width: "100px" },
							{ name: "X St", field:"cfs_cross1", srdtype:"PlainText", srdrow:4, width: "50px" },
							{ name: "X St", field:"cfs_cross2", srdtype:"PlainText", srdrow:4, width: "50px" },
							{ name: "Signal", field:"cfs_code", srdtype:"PlainText", srdrow:2, width: "50px", formatter: this.formatSignal},
							{ field:"cfs_codesup1", srdtype:"PlainText", srdrow:2, width: "50px" },
							{ field:"cfs_codesup2", srdtype:"PlainText", srdrow:2, width: "50px" },
							{ name: "Assigned", field:"cfs_timeassigned", srdtype:"PlainText", srdrow:4,width: "50px" },
							{ name: "Priority", field:"cfs_priority", width: "50px" },
							{ name: "Ops Tracking", field:"cfs_routenotifications", width: "50px" },
							{ name: "Dis", field:"cfs_finaldis", srdtype:"PlainText", srdrow:5, width: "50px" },
							{ field:"cfs_finaldissup1",  srdtype:"PlainText", srdrow:5, width: "50px" },
							{ name: "Final", field:"cfs_finaldisdate",  srdtype:"PlainText", srdrow:5, width: "50px",formatter: this.dateToTime},
							{ name: "Unit", field:"cfs_finaldisunit",  srdtype:"PlainText", srdrow:5, width: "50px" },
							{ name: "Dup", field:"cfs_dupnum", srdtype:"PlainText", srdrow:3, width: "50px" },
							{ name: "Updated", field:"cfs_updated_on", srdtype:"PlainText", srdrow:1, width: "60px" },

							{ field:"cfs_body", srdtype:"Text", srdrow:6, width: "250px" }
							]
					} ]
					
				}

				this.srd_dataStore = new dojo.data.ObjectStore( { objectStore: this.srd_store } );
/*				this.srd_datagrid = new dojox.grid.DataGrid( {
					store: this.srd_dataStore,
					structure : this.srd_structList[this.selectedTable],
					region : 'center'
				} );
				this.container.addChild(this.srd_datagrid);
				this.srd_doc.srd_dataMenuPopup.set('popup',this.dataMenu );
*/
				this.cp = new dijit.layout.ContentPane( {
					'region': "center",
					'isLayoutContainer': true,
					'class': "srd_cfs_single"
				} );
				if(this.data.noContainers) {
					this.srd_doc.viewContainer.addChild(this.cp);
					this.outsideContainer.destroyRecursive();
				} else {
					this.insideContainer.addChild(this.cp);	
					this.insideContainer.resize();
				}
			this.srd_widgetArr = null;
			this.displaySingleCfs();

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
				this.srd_datagrid = new dojox.grid.DataGrid( {
					store: this.srd_dataStore,
					structure : this.srd_structList[this.selectedTable],
					region : 'center'
				} );
				this.insideContainer.addChild(this.srd_datagrid);
			}
		},
		// END SELECT TABLE FUNCTION
		// BEGIN displaySingleCfs FUNCTION
		displaySingleCfs: function() {
			console.log("Called Display Single CFS");
			if( !this.srd_widgetArr) {
				var theLeftImageWidget = dojo.create("div", {'class':"srd_cfs_row0", id:"srd_cfs_leftImage", innerHTML: '<img src="'+this.srd_doc.siteLeftImage+'" class="srdLoginImage" id="leftLoginImage" />'    } , this.cp.domNode);
				var theTitleWidget = dojo.create("div", {'class':"srd_cfs_row0", id:"srd_cfs_title", innerHTML: this.srd_doc.siteTitle} , this.cp.domNode);
				var theRightImageWidget = dojo.create("div", {'class':"srd_cfs_row0", id:"srd_cfs_rightImage", innerHTML: '<img src="'+this.srd_doc.siteRightImage+'" class="srdLoginImage" id="rightLoginImage" />'  } , this.cp.domNode);
				
				this.srd_widgetArr = {};
				for(var i=0;i<this.srd_structList[this.selectedTable][0].cells.length;i++) {
					var cell = this.srd_structList[this.selectedTable][0].cells[i];
					if(!cell.editable) {
						cell.editable = false;
					}
					if(cell.srdtype) {
//						console.log("Creating Widget for "+cell.srdtype);
						switch(cell.srdtype) {
						case "DateTextBox" :
							var theLabel = dojo.create("label", {'class':"srd_cfs_row"+cell.srdrow, id:"label_"+cell.field, innerHTML: cell.name+" :"} , this.cp.domNode);
							var theWidget = new dijit.form.DateTextBox( {
								'class': "srd_cfs_row"+cell.srdrow,
								id: cell.field,
								value: new Date(),
								srd_view: this,
								editable: cell.editable,
								onChange: function() { this.srd_view.getData(); }
							} );
							theWidget.placeAt(this.cp.domNode);
							theWidget.startup();
							this.srd_widgetArr[cell.field] = theWidget;
							break;
						case "PlainText" :
							if(cell.name) {
								var theLabel = dojo.create("label", {'class':"srd_cfs_row"+cell.srdrow, id:"label_"+cell.field, innerHTML: cell.name+" :"} , this.cp.domNode);
							}
							var theWidget = dojo.create("div", {'class':"srd_cfs_row"+cell.srdrow, id:cell.field, innerHTML: ""} , this.cp.domNode);
							if(cell.formatter) {
								dojo.attr(theWidget,'formatter',cell.formatter);
							}
							this.srd_widgetArr[cell.field] = theWidget;
							break;	
						case "Text" :
							if(cell.name) {
								var theLabel = dojo.create("label", {'class':"srd_cfs_row"+cell.srdrow, id:"label_"+cell.field, innerHTML: cell.name+" :"} , this.cp.domNode);
							}
							var theWidget = new dijit.form.Textarea( {
								'class': "srd_cfs_row"+cell.srdrow,
								id: cell.field,
								editable: cell.editable,
								srd_view: this,
								intermediateChanges: true,
								onChange: function() { this.srd_view.getData(); },
								onKeyPress: function(e) { this.srd_view.noEnter(e); }
							} );
							theWidget.placeAt(this.cp.domNode);
							theWidget.startup();
							this.srd_widgetArr[cell.field] = theWidget;
							break;
						}
					}
				}
			}
		},
		// END displaySingleCfs FUNCTION
		// BEGIN getData FUNCTION
		getData : function() {	
//			console.log("getData Called!");
			if( this.onChangeActivated ) {
			if( this.srd_widgetArr["cfs_date"] && this.srd_widgetArr["cfs_num"] ) {
				if( this.srd_widgetArr["cfs_date"].value && this.srd_widgetArr["cfs_num"].value) {
//					var theDate = dojo.date.locale.format( new Date(), { datePattern: "y-M-d" } );
					var theDate = dojo.date.locale.format( new Date(this.srd_widgetArr["cfs_date"].value), { datePattern: "y-M-d" } );
//					var theDate = this.srd_widgetArr["cfs_date"].value;
					var theJob = this.srd_widgetArr["cfs_num"].value; 
					dojo.when( this.srd_store.query({"cfs_date":theDate, "cfs_num":theJob}, {
						count: 1
					} ), function(results) {
						console.log("TEST1");
						this.displayResults(results[0])
					}.bind(this)
					);
				}
			}
			}
		},
		// END getData FUNCTION
		// BEGIN displayResults FUNCTION
		displayResults : function(item) {	
			for(var hashId in item) {
//				console.log( "Showing value for "+hashId+" ::: "+item[hashId]);
				if(this.srd_widgetArr[hashId] && hashId != "cfs_num" && hashId != "cfs_date" ) {
					if(this.srd_widgetArr[hashId].declaredClass && this.srd_widgetArr[hashId].declaredClass != undefined ) {					
						if(this.srd_widgetArr[hashId].declaredClass == "dijit.form.Textarea" ) {
//							console.log("Widget is TextArea");
							this.srd_widgetArr[hashId].set("value", item[hashId]);
/*						} else {
							if(this.srd_widgetArr[hashId].formatter) {
								console.log("Var :"+hashId+" has formatter!");
								dojo.attr( this.srd_widgetArr[hashId], 'innerHTML', this.srd_widgetArr[hashId].formatter( item[hashId]) );
							} else {
//							console.log("Widget is something else.");
							dojo.attr( this.srd_widgetArr[hashId], 'innerHTML', item[hashId]);

							}
*/
						}	
					} else {
//						console.log("Widget is something else.");
						if(hashId=="cfs_finaldisdate" || hashId=="cfs_timeassigned" || hashId=="cfs_timecreated") {
//							console.log("Var :"+hashId+" has formatter!");
							dojo.attr( this.srd_widgetArr[hashId], 'innerHTML', this.dateToTime( item[hashId]) );
						} else if(hashId=="cfs_finaldis" || hashId=="cfs_code" ) {
							dojo.attr( this.srd_widgetArr[hashId], 'innerHTML', this.formatSignal( item[hashId]) );
	
						} else {
//						console.log("Widget is something else.");
							dojo.attr( this.srd_widgetArr[hashId], 'innerHTML', item[hashId]);
							// TODO: TEMP FIX FOR IE BUG THAT CAN"T USE CSS INHERIT FOR HEIGHT OF ContentPane
//							if(hashId=="cfs_body") {
//								var theHeight = 
//								dojo.attr(this.cp,"style","height:"+theHeight);
//							}
						}
					}
				}
			}
			// GET POSITION OF cfs_body TEXT and resize window height.
			if(this.srd_widgetArr["cfs_body"] ) {	
				var posObj = dojo.position(this.srd_widgetArr["cfs_body"].domNode);
				var theHeight = posObj.y + posObj.h + 20;
				this.cp.resize({h:theHeight});
				var winDiff = window.outerHeight-window.innerHeight;
				if(theHeight + winDiff < screen.height) {
					if(this.data.noContainers) {
						window.resizeTo(window.outerWidth, theHeight+winDiff);
					}
				}	
			}				

			// END FOR LOOP FOR WIDGETS
			this.cp.resize();	
		},
		// END displayResults FUNCTION
		// BEGIN noEnter FUNCTION
		noEnter : function(e) {	
//			console.log("noEnter Called!");
			if(e.keyCode == dojo.keys.ENTER) {
				dojo.stopEvent(e);	
//				this.getData();
			}
		},
		// END noEnter
		getJob : function(theDate, theJob) {
			this.theDate = theDate;
			this.theJob = theJob;
		dojo.addOnLoad(function() {
//				console.log("getJob Called:"+this.theDate+" ::: "+this.theJob);

			this.srd_widgetArr["cfs_date"].set("value",this.theDate);
			this.srd_widgetArr["cfs_num"].set("value", this.theJob);
			this.onChangeActivated = false;
				dojo.when( this.srd_store.query({"cfs_date":this.theDate, "cfs_num":this.theJob}, {
					count: 1
				} ), function(results) {
					this.displayResults(results[0]);
					this.onChangeActivated = true;
				}.bind(this)
				);
			}.bind(this) );
		}
		// END getJob
	}
);






