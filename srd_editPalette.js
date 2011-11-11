

function srd_editPalette () {
	this.layoutContainer = new dijit.layout.LayoutContainer( {
		style: "background-color:light-gray;height:400px",
		region: 'top'
	} );

	this.controlArray = {};

	this.layoutContainer.startup();	

	this.drawControlArr = null;
	this.srd_featureAttributes = null;
	this.selCon = null;

	this.drawControlLabelArr =  {
		point: { label: "Add Points", img: "SR_OpenLayers/theme/default/img/draw_point_off.png" },
		line: { label: "Add Lines", img: "SR_OpenLayers/theme/default/img/draw_line_off.png" },
		polygon: { label: "Add Polygons", img: "SR_OpenLayers/theme/default/img/draw_polygon_off.png" },
		remove: { label: "Remove Features", img: "SR_OpenLayers/theme/default/img/remove_point_off.png" },
		select: { label: "Select Features", img: "SR_OpenLayers/theme/default/img/pan_off.png" }
	}	

}


srd_editPalette.prototype.activateDrawControl = function(theDrawCon) {
	this.selCon = theDrawCon;
	for(tmpDrawCon in this.drawControlArr) {
		if( tmpDrawCon == theDrawCon ) {
			this.drawControlArr[tmpDrawCon].activate();
			this.controlArray.activeControl.drawControlButton.attr("label","<img src="+this.drawControlLabelArr[theDrawCon].img+" /img>");
		} else {
			this.drawControlArr[tmpDrawCon].deactivate();
		}
	}
}


srd_editPalette.prototype.addControl = function(conType,conDisplayName,conName,conObject) {
	dojo.addOnLoad(function() {
		switch(conType) {
		case "activeControlPicker" :
			if(this.controlArray[conName] == null) {
				this.controlArray[conName] = {};
			}
			var conLabelCP = new dijit.layout.ContentPane({
				content: conDisplayName+": ",
				region:'top'
			});
			this.controlArray[conName].conLabelCP = conLabelCP; 
			this.layoutContainer.addChild(conLabelCP);
		
			this.drawControlArr = conObject;
			if(this.selCon == null) {
				this.selCon = "select";
			}
			var drawControlMenu = new dijit.Menu({});
			this.controlArray[conName].drawControlMenu = drawControlMenu;
			var drawControlButton = new dijit.form.DropDownButton({
				label: "<img src="+this.drawControlLabelArr[this.selCon].img+" /img>",
				dropDown: drawControlMenu,
				style: "position:relative;",
				region:'top'
				});
			this.controlArray[conName].drawControlButton = drawControlButton;
			for( var theDrawCon in conObject) {
						
					drawControlMenu.addChild(   new dijit.MenuItem( {
					label: "<img src="+this.drawControlLabelArr[theDrawCon].img+" /img> "+this.drawControlLabelArr[theDrawCon].label,
					theDrawCon: theDrawCon,
					editPalette : this,
					onClick: function(evt) { 
						this.editPalette.activateDrawControl(this.theDrawCon);
					} 
				} ) );
			}
			this.layoutContainer.addChild( drawControlButton );

		break;
		case "editText" :
			this.srd_featureAttributes = conObject;
			if(this.controlArray[conName] == null) {
				this.controlArray[conName] = {};
			}
			var textNameCP = new dijit.layout.ContentPane({
				content: conDisplayName+": ",
				region:'top'
			});
			this.controlArray[conName].textNameCP = textNameCP; 
			this.layoutContainer.addChild(textNameCP);
			var editTextarea = new dijit.form.Textarea( {
				value: conObject[conName],
				region: 'top',
				editPalette: this,
				conName: conName,
				onChange: function(evt) { this.editPalette.srd_featureAttributes[conName] = this.value; }
				} );
			this.controlArray[conName].editTextarea = editTextarea;
			this.layoutContainer.addChild(editTextarea);	
			
			
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
				region:'top'
//				id: "srd_"+conName
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




