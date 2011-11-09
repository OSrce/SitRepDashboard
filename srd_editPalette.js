

function srd_editPalette () {
	this.layoutContainer = new dijit.layout.LayoutContainer( {
		style: "background-color:yellow;height:200px",
		region: 'bottom'
	} ); 

	this.controlArray = {};

	this.layoutContainer.startup();	

}




srd_editPalette.prototype.addControl = function(conType,conDisplayName,conName,conObject) {
	dojo.addOnLoad(function() {
		switch(conType) {
		case "featureTypePicker" :
		

		break;
		case "colorPicker" :
			if(this.controlArray[conName] == null) {
				this.controlArray[conName] = {};
			}
			var colorNameCP = new dijit.layout.ContentPane({
				content: conDisplayName+": ",
				region:'top'
			});
			this.controlArray[conName].colorNameCP = colorNameCP; 
			this.layoutContainer.addChild(colorNameCP);
			var colorBox = new dijit.form.TextBox( {
				style : "background-color:"+conObject[conName]+";width:1.5em;"
				}, "colorBox");
			this.controlArray[conName].colorBox = colorBox;
	
			var colorMenu = new dijit.Menu({});
			this.controlArray[conName].colorMenu = colorMenu;
			var colorButton = new dijit.form.DropDownButton({
	//			label: "<div id='srd_'"+conName+"></div>",
				dropDown: colorMenu,
				style: "position:relative;",
				region:'top',
				id: "srd_"+conName
				});
			this.controlArray[conName].colorButton = colorButton;
			var picker = new dijit.ColorPalette({
				onChange: function(val) { 
					conObject[conName] = val; 
					this.controlArray[conName].colorButton.closeDropDown();
					this.controlArray[conName].colorBox.attr("style", "background-color:"+val );
				}.bind(this)
			}, "thePicker" );
			colorMenu.addChild(picker);
			this.layoutContainer.addChild( colorButton );
			colorBox.placeAt(colorButton);
		
		break;
		}
		this.layoutContainer.resize();
	}.bind(this)  );
	

}




