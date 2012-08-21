define([
	"dojo/_base/declare",
	"dijit/form/Form",
	"dijit/form/Textarea",
	"dijit/ColorPalette",
	"dijit/form/HorizontalSlider",
	"dijit/form/NumberSpinner",
	"dijit/layout/ContentPane",
	"dijit/layout/BorderContainer",
	"dojox/layout/ExpandoPane"
], function(declare, Form, NumberSpinner,ContentPane,BorderContainer,ExpandoPane) {

	return declare( [], {
	constructor: function(theSrdLayer) {
	this.layoutContainer = new dojox.layout.ExpandoPane( {
		style: "height:750px;margin:0px;border:9px;padding:9px;margin-right:16px;overflow:auto;",
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
		point: { label: "Add Points", img: "lib/OpenLayers/theme/default/img/draw_point_off.png" },
		line: { label: "Add Lines", img: "lib/OpenLayers/theme/default/img/draw_line_off.png" },
		polygon: { label: "Add Polygons", img: "lib/OpenLayers/theme/default/img/draw_polygon_off.png" },
		remove: { label: "Remove Features", img: "lib/OpenLayers/theme/default/img/remove_point_off.png" },
		select: { label: "Select Features", img: "lib/OpenLayers/theme/default/img/pan_off.png" }
	}	

	//BEGIN BUILD THE PRESETS
	this.getPresets();

	// END BUILD THE PRESETS

},
// END CONSTRUCTOR

// BEGIN addToContainer
addToContainer : function(theContainer) {
	theContainer.addChild(this.presetsContainer);	
	theContainer.addChild(this.layoutContainer);	
},
// END

// BEGIN removeFromContainer
removeFromContainer : function(theContainer) {
	theContainer.removeChild(this.presetsContainer);
	theContainer.removeChild(this.layoutContainer);


},
// END


// BEGIN setFeatureAttributes
setFeatureAttributes : function (feature) {
	// this function is to set the appropriate values
	// of the attributes of the feature selected to the 
	// controls in the editPalette.  We will use the attributes
	// in the defaultStyle symbolizer unless a feature.attributes.srstyle
	// is specified.  In either case, if the symbolizer value is a
	// feature.attribute variable then the control is 'editable' otherwise
	// it should be read only.

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
},
// END setFeatureAttributes

deactivateDrawControls : function() {
	if(this.drawControlArr != null) {
		for(tmpDrawCon in this.drawControlArr) {
			this.drawControlArr[tmpDrawCon].deactivate();
		}
	}
},	
// END deactivateDrawControls

activateDrawControl : function(theDrawCon ) {
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
},
// END activateDrawControl

addControl : function(conType,conDisplayName,conName,conObject) {
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
//				style: 'width:50%;',
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
		case "editNumber" :
			this.srd_featureAttributes = conObject;
			var textNameCP = new dijit.layout.ContentPane({
				content: conDisplayName+": ",
				region:'top'
			});
			this.controlArray[conName].textNameCP = textNameCP; 
			this.layoutContainer.addChild(textNameCP);
			var editNumber = new dijit.form.NumberSpinner( {
				value: conObject[conName],
//				style: 'width:100px;',
//				style: 'width:100%;margin:2px;border:2px;padding:2px;',
				editPalette: this,
				conName: conName,
				onChange: function(evt) { 
					this.editPalette.srd_featureAttributes[conName] = this.value; 
					this.editPalette.srd_layer.updateLayer();
				}
			} );
			this.controlArray[conName].editNumber = editNumber;
			this.layoutContainer.addChild(editNumber);	
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
	

},
// END addControl


// BEGIN getPresets
getPresets : function() {
	dojo.addOnLoad(function() {
		console.log("editPalette getPresets for :"+this.srd_layer.options.name);
//		this.styleArr = this.srd_layer.srd_styleArr;
		this.srd_styleMap = this.srd_layer.srd_styleMap;
		this.renderIntent = this.srd_layer.renderIntent;
		var presetsCP = new dijit.layout.ContentPane( );
		this.presetsContainer.addChild(presetsCP);
		this.presetsSource = new dojo.dnd.Source( presetsCP.domNode );
//		this.presetsArr = [];
//		for( var styleId in this.styleArr) {
//			this.presetsArr.push(this.styleArr[styleId] );
//		}
//		this.presetsSource.insertNodes( false, this.presetsArr );
	
		if( this.srd_styleMap == null || this.renderIntent == null) {
			return;
		}


		this.presetNodeArr = [];
		// NEED TO MAKE DND ITEM FOR DEFAULT STYLE
		if( this.srd_styleMap.styles[this.renderIntent].defaultStyle ) {
			var theSym = this.srd_styleMap.styles[this.renderIntent].defaultStyle;
			// the Symbolizer is for points, lines, and polys
			if ( theSym.externalGraphic == null || theSym.externalGraphic == ""  ) {
				this.presetNodeCreator(theSym, 'point');
				this.presetNodeCreator(theSym, 'line');
				this.presetNodeCreator(theSym, 'polygon');
			// the Symbolizer is for an externalGraphic
			} else {
				this.presetNodeCreator(theSym, 'graphic');
			}
		}
		// NEED TO MAKE DND ITEM FOR DEFAULT STYLE
		for( var i in this.srd_styleMap.styles[this.renderIntent].rules) {
			if(this.srd_styleMap.styles[this.renderIntent].rules[i].symbolizer) {
				var theSym = this.srd_styleMap.styles[this.renderIntent].rules[i].symbolizer;
				// the Symbolizer is for points, lines, and polys
				if ( theSym.externalGraphic == null || theSym.externalGraphic == ""  ) {
					this.presetNodeCreator(theSym, 'point');
					this.presetNodeCreator(theSym, 'line');
					this.presetNodeCreator(theSym, 'polygon');
				// the Symbolizer is for an externalGraphic
				} else {
					this.presetNodeCreator(theSym, 'graphic');
				}
			}
		}

		this.presetsSource.insertNodes( false, this.presetNodeArr );

	}.bind(this) );
},
// END getPresets()


// BEGIN presetNodeCreator
presetNodeCreator : function(item, hint) {
//	var node = domConstruct.toDom(stringUtil.substitute(

//	);
		var node = dojo.create('div', { innerHtml: item.id } );

//	return { node: node, data: item, type: type };
		this.presetNodeArr.push(  { node: node, data: item, type: hint } );

}
// END presetNodeCreator

} );
// END declare srd_editPalette

} );
// END REQUIRE





