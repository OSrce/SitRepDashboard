

function srd_editPalette () {
	this.layoutContainer = new dijit.layout.LayoutContainer( {
		style: "background-color:yellow;"
	} ); 

	

}




srd_editPalette.prototype.addControl = function(conType,conDisplayName,conName,conObject) {
	switch(conType) {
	
	case "colorPicker" :
		var colorNameCP = new dijit.layout.ContentPane({
			content: theName+": "
		});
		this.layoutContainer.addChild(colorNameCP);
		var colorBox = new dijit.form.TextBox( {
			style : "background-color:"+this.srd_selLayer.srd_featureAttributes[theColorType]+";width:1.5em;"
			}, "colorBox");

		var colorMenu = new dijit.Menu({});
		var colorButton = new dijit.form.DropDownButton({
			label: "<div id='srd_colorBox'></div>",
			dropDown: colorMenu,
			style: "position:relative;",
			id: "srd_"+theName
			});
		var picker = new dijit.ColorPalette({
			onChange: function(val,colorButton,colorBox) { 
				this.srd_selLayer.srd_featureAttributes[theColorType] = val; 
				colorButton.closeDropDown();
				colorBox.attr("style", "background-color:"+val );
			}.bind(this)
		}, "somePicker" );
		colorMenu.addChild(picker);
		this.srd_toolbar.addChild( colorButton );
		colorBox.placeAt("srd_"+theName);

	break;
	}
	




}




