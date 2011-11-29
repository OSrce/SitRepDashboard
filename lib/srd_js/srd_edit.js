
// srd_edit : this js class will be for the edit tools section :


//srd_edit constructor
function srd_edit(map, srd_layers) {
	this.map = map;
	this.srd_layers = srd_layers;
//	this.parentContainer = dijit.byId("editToolsContainer");
	this.container = dijit.byId("editToolsContainer");
//	this.container = new dijit.layout.ContentPane();
//	this.parentContainer.appendDiv(this.container);
/*
	this.selectDataStore = null; 
	this.layerSelect = new dijit.form.FilteringSelect( {
		id: "layerSelect",
		name: "layer",
		value: "none",
		store: this.selectDataStore,
		searchAttr: "name"
	}
	);	

*/
}


srd_edit.prototype.loadEditTools = function() {
// Create dijit.form.FilteringSelect for drop down list to select which layer we would like to be able to edit.	









}






