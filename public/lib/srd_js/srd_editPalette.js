
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dojox.layout.ExpandoPane");


function srd_editPalette (theSrdLayer) {
//	this.layoutContainer = new dijit.layout.LayoutContainer( {
	this.layoutContainer = new dojox.layout.ExpandoPane( {
		style: "height:750px;margin:0px;border:0px;padding:0px;margin-right:16px;",
		region: 'top',
		title: "Edit Tools"
	} );

	this.presetsContainer = new dojox.layout.ExpandoPane( {
		style: "height:300px;margin:0px;border:0px;padding:0px;margin-right:16px;",
//		style: "width:100%;height:300px;margin:0px;border:0px;padding:0px;",
		region: 'top',
		title: 'Presets',
		startExpanded: false
	} );

	this.controlArray = {};

	this.drawControlArr = null;
	this.srd_featureAttributes = null;
	this.selCon = null;
	this.srd_layer = theSrdLayer;	

	this.drawControlLabelArr =  {
		point: { label: "Add Points", img: "lib/SR_OpenLayers/theme/default/img/draw_point_off.png" },
		line: { label: "Add Lines", img: "lib/SR_OpenLayers/theme/default/img/draw_line_off.png" },
		polygon: { label: "Add Polygons", img: "lib/SR_OpenLayers/theme/default/img/draw_polygon_off.png" },
		remove: { label: "Remove Features", img: "lib/SR_OpenLayers/theme/default/img/remove_point_off.png" },
		select: { label: "Select Features", img: "lib/SR_OpenLayers/theme/default/img/pan_off.png" }
	}	

}
// END CONSTRUCTOR

// BEGIN addToContainer
srd_editPalette.prototype.addToContainer = function(theContainer) {
	theContainer.addChild(this.presetsContainer);	
	theContainer.addChild(this.layoutContainer);	
}
// END

// BEGIN removeFromContainer
srd_editPalette.prototype.removeFromContainer = function(theContainer) {
	theContainer.removeChild(this.presetsContainer);
	theContainer.removeChild(this.layoutContainer);


}
// END


// BEGIN setFeatureAttributes
srd_editPalette.prototype.setFeatureAttributes = function (theAttributes) {
	if(theAttributes != this.srd_featureAttributes) {
		this.srd_featureAttributes = theAttributes;
		for(conId in this.controlArray) {
//			console.log("conId:"+conId);
			switch(this.controlArray[conId].conType) {
			case "editText" :
				this.controlArray[conId].editTextarea.set("value", this.srd_featureAttributes[conId]);
			break;
			case "colorPicker" :
				this.controlArray[conId].colorBox.attr("style", "background:"+this.srd_featureAttributes[conId] );
			break;
			case "editSlider" :
				this.controlArray[conId].editSlider.set("value",this.srd_featureAttributes[conId] );
			break;
			}	
		}
	}
}


srd_editPalette.prototype.deactivateDrawControls = function() {
	if(this.drawControlArr != null) {
		for(tmpDrawCon in this.drawControlArr) {
			this.drawControlArr[tmpDrawCon].deactivate();
		}
	}
}	


srd_editPalette.prototype.activateDrawControl = function(theDrawCon ) {
	if(theDrawCon != null) {
		this.selCon = theDrawCon;
	}
	if(this.drawControlArr != null) {
		for(tmpDrawCon in this.drawControlArr) {
			if( tmpDrawCon == this.selCon ) {
				this.drawControlArr[tmpDrawCon].activate();
				this.controlArray.activeControl.drawControlButton.attr("label","<img src="+this.drawControlLabelArr[this.selCon].img+" /img>");
			} else {
				this.drawControlArr[tmpDrawCon].deactivate();
			}
		}
	}
}


srd_editPalette.prototype.addControl = function(conType,conDisplayName,conName,conObject) {
	dojo.addOnLoad(function() {
		if(this.controlArray[conName] == null) {
			this.controlArray[conName] = {};
			this.controlArray[conName].conType = conType;
		}
		switch(conType) {
		case "activeControlPicker" :
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
			var textNameCP = new dijit.layout.ContentPane({
				content: conDisplayName+": ",
				region:'top'
			});
			this.controlArray[conName].textNameCP = textNameCP; 
			this.layoutContainer.addChild(textNameCP);
			var editTextarea = new dijit.form.Textarea( {
				value: conObject[conName],
				region: 'top',
				style: 'width:99%;',
//				style: 'width:100%;margin:2px;border:2px;padding:2px;',
				editPalette: this,
				conName: conName,
				onChange: function(evt) { 
					this.editPalette.srd_featureAttributes[conName] = this.value; 
					this.editPalette.srd_layer.updateLayer();
				}
			} );
			this.controlArray[conName].editTextarea = editTextarea;
			this.layoutContainer.addChild(editTextarea);	
			
			
		break;
		case "colorPicker" :
			var colorNameCP = new dijit.layout.ContentPane({
				content: conDisplayName+": ",
				region:'top'
			});
			this.controlArray[conName].colorNameCP = colorNameCP; 
			this.layoutContainer.addChild(colorNameCP);
			var colorBox = new dijit.form.TextBox( {
				readOnly: true,
				style : "background:"+conObject[conName]+";width:1.5em;"
				} );
			this.controlArray[conName].colorBox = colorBox;
	
			this.srd_featureAttributes = conObject;
			var picker = new dijit.ColorPalette({
				value: conObject[conName],
				editPalette: this,
				conName: conName,
				onChange: function(evt) { 
					if(this.editPalette.controlArray[conName].colorButton != null) {
						this.editPalette.srd_featureAttributes[conName] = this.value; 
						this.editPalette.controlArray[conName].colorButton.closeDropDown();
						this.editPalette.controlArray[conName].colorBox.attr("style", "background:"+this.value );
						this.editPalette.srd_layer.updateLayer();
					}
				}
			} );

			var colorButton = new dijit.form.DropDownButton({
				dropDown: picker,
				style: "position:relative;",
				region:'top'
				});
			this.controlArray[conName].colorButton = colorButton;
	
			this.layoutContainer.addChild( colorButton );
			colorBox.placeAt(colorButton);
		
		break;
		case "editSlider" :
			this.srd_featureAttributes = conObject;
			var textNameCP = new dijit.layout.ContentPane({
				content: conDisplayName+": ",
				region:'top'
			});
			this.controlArray[conName].textNameCP = textNameCP; 
			this.layoutContainer.addChild(textNameCP);
			var editSlider = new dijit.form.HorizontalSlider( {
				value: conObject[conName],
				region: 'top',
				minimum: 0,
				maximum: 1,
				intermediateChanges: true,
				editPalette: this,
				conName: conName,
				onChange: function(evt) { 
					this.editPalette.srd_featureAttributes[conName] = this.value;
					this.editPalette.srd_layer.updateLayer();
				}
			} );
			this.controlArray[conName].editSlider = editSlider;

			this.layoutContainer.addChild(editSlider);	

		break;
		}
//		this.layoutContainer.resize();
	}.bind(this)  );
	

}




