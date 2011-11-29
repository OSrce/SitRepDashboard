//This profile is used just to illustrate the layout of a layered build.
//All layers have an implicit dependency on dojo.js.

//Normally you should not specify a layer object for dojo.js. It is normally
//implicitly built containing the dojo "base" functionality (dojo._base).
//However, if you prefer the Dojo 0.4.x build behavior, you can specify a
//"dojo.js" layer to get that behavior. It is shown below, but the normal
//0.9 approach is to *not* specify it.

//

dependencies = {
	layers: [
		{
			name: "srd_dojo.js",
			localeList: "en-us",
			dependencies: [
				"dojo.dojo",
				"dijit.dijit",
				"dojo.parser",
				"dijit.layout.ContentPane",
				"dijit.layout.FloatingPane",
				"dijit.layout.BorderContainer",
				"dijit.layout.LayoutContainer",
				"dijit.form.Button",
				"dijit.ColorPalette",
				"dijit.MenuBar",
				"dijit.PopupMenuBarItem",
				"dijit.layout.TabContainer",
				"dijit.TitlePane",
				"dojox.grid.DataGrid",
				"dojo.store.Memory",
				"dojo.data.ObjectStore",
				"dojox.data.XmlStore",
				"dijit.form.FilteringSelect", 
				//END FROM 
				"dojox.storage.LocalStorageProvider",
				"dojo.date.locale",
				"dijit.form.Form",
				"dojox.form.Uploader",
				"dojox.form.uploader.FileList",
				"dijit.Dialog",
				"dijit.form.Textarea",
				"dijit.form.HorizontalSlider"
			]
		}, 
		{
			name: "srd_dojo.css",
			localeList: "en-us",
			dependencies: [
					//BEGIN CSS
				"srd.srd_style.css"
/*				"dijit.themes.tundra.tundra.css",
				"dojo.resources.dojo.css",
				"dojox.grid.resources.Grid.css",
				"dojox.layout.resources.FloatingPane.css",
				"dojox.layout.resources.ResizeHandle.css",
				"dojox.form.resources.UploaderFileList.css"
*/			]
		}	
	],

	prefixes: [
		[ "dijit", "../dijit" ],
		[ "dojox", "../dojox" ]
//		[ "SitRepDashboard", "../../DEVSitRepDashboard" ]
	]
}

//If you choose to optimize the JS files in a prefix directory (via the optimize= build parameter),
//you can choose to have a custom copyright text prepended to the optimized file. To do this, specify
//the path to a file tha contains the copyright info as the third array item in the prefixes array. For
//instance:
//	prefixes: [
//		[ "mycompany", "/path/to/mycompany", "/path/to/mycompany/copyright.txt"]
//	]
//
//	If no copyright is specified in this optimize case, then by default, the dojo copyright will be used.
