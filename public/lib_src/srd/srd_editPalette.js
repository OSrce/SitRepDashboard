define([
	"srd/include_edit",
	"dojo/_base/declare",
	"dijit/form/Form",
	"dijit/form/Textarea",
	"dijit/ColorPalette",
	"dijit/form/HorizontalSlider",
	"dijit/form/NumberSpinner",
	"dijit/layout/ContentPane",
	"dijit/layout/BorderContainer",
	"dojox/layout/ExpandoPane",
	"dojox/gfx",
	"dojo/dnd/Manager",
], function(edit_include, declare, Form, NumberSpinner,ContentPane,BorderContainer,ExpandoPane, gfx, dojosource, dojomanager) {

	return declare( [], {
	constructor: function(theSrdLayer) {
	this.layoutContainer = new dojox.layout.ExpandoPane( {
		style: "height:750px;margin:0px;border:9px;padding:9px;margin-right:16px;overflow:auto;",
		region: 'top',
		title: "Edit Tools",
		startExpanded: true
	} );

	this.presetsContainer = new dojox.layout.ExpandoPane( {
		style: "height:300px;margin:0px;border:0px;padding:0px;margin-right:16px;",
//		style: "width:100%;height:300px;margin:0px;border:0px;padding:0px;",
		region: 'top',
		title: 'Presets',
		startExpanded: true
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
			
			//Korb note: I couldn't figure out a better way to make this available to the presets
			DrawArrGlobal = this.drawControlArr;
			
			if(this.selCon == null) {
				this.selCon = "select";
			}
			//var drawControlMenu = new dijit.Menu({});
			drawControlMenu = new dijit.Menu({});
			this.controlArray[conName].drawControlMenu = drawControlMenu;
			var drawControlButton = new dijit.form.DropDownButton({
				label: "<img src="+this.drawControlLabelArr[this.selCon].img+" /img>",
				dropDown: drawControlMenu,
				style: "position:relative;",
				region:'top',
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


		//Make presets into a DnD source
		//this.presetsSource = new dojo.dnd.Source( presetsCP.domNode );
		this.presetsSource = new dojo.dnd.Source( presetsCP.domNode, {creator: function( item, hint ){
				myDiv = dojo.create( 'div', { });
				
   				if (hint == 'avatar') {
      				// create the avatar
      					//myDiv.innerHTML = item.data;
      					//Create surface to draw on avatar
      					var avatarsurface = dojox.gfx.createSurface(myDiv,15,10);

						
						//I tried to make this it's own function, but it kept telling me "drawOnSurface is not a function"
						//Draws the given type on the given surface
						//drawOnSurface: function(type, tempsurface) {

						switch(item.data) {
							case "point" :
								var shape = avatarsurface.createCircle({ cx: 8, cy: 5, r: 4 }).setFill("yellow").setStroke("blue");
							break;
							case "line" :
								var shape = avatarsurface.createLine({ x1: 4, y1: 8, x2: 12, y2: 0 }).setStroke("blue");
		
							break;
							case "polygon" :
								var shape = avatarsurface.createRect({ x: 4, y: 1, width: 8, height: 8 }).setFill("red").setStroke("blue");
							break;
						}	
								
						//I don't know what to do with the returned shape.
						//It might be better to just return a shape and let the user add it to their surface, but I don't know how to do that		
						//return shape;
							//},
												
						//make the drawing on the surface
						//this.drawOnSurface(item.data, avatarsurface);
						//avatarsurface.createCircle(drawingarray).setFill("yellow").setStroke("blue");
   					}
   						
   				return {node: myDiv, data: item, type: hint};
			
		 }} );

		//END KORB AVATAR TESTING
		
		
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
				
				//THIS GETS EXECUTED				
				
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

		//The preset node arrray gets inserted into the DnD source
		this.presetsSource.insertNodes( false, this.presetNodeArr );
				
		//Korb- drawing test
		
		//var d = dojo.create('div', { id: "surfaceElement" }, presetsCP.domNode );
		//var surface = dojox.gfx.createSurface(d,30,30);
		var nodelist = this.presetsSource.getAllNodes();

		jontest1 = nodelist;
/*
		for(var i=0;i<nodelist.length;i++){
				nodelist[i].surface = dojox.gfx.createSurface(nodelist[i],10,10);
				nodelist[i].surface.createCircle({ cx: 4, cy: 4, r: 8 }).setFill("yellow").setStroke("blue");
		}
*/	
			
//			var tempsurface = dojox.gfx.createSurface(nodelist[i],20,20);
//			this.surfaceArr.push({node: tempsurface});
			// Create a rectangle
//			surfaceArr[i].createRect({ x: 8, y: 5, width: 8, height: 8 }).setFill("yellow").setStroke("blue");		

		this.surfaceArr =[];
		var surfacetest0 = dojox.gfx.createSurface(nodelist[0],15,10);
		var surfacetest1 = dojox.gfx.createSurface(nodelist[1],15,10);
		var surfacetest2 = dojox.gfx.createSurface(nodelist[2],15,10);
		
		
		//NOTE TO JON 10/22/12 11PM: When you click on a preset it now activates that drawing type. Unfortunately I couldn't get it to deactivate
		//other drawing types, so if you click on one, then another it starts to get funky. There's probably a better way also than using a global variable
		//but I couldn't figure it out. Also, it doesn't change what's displayed in the edit tools dropdown menu, which it probably should.
		dojo.connect(nodelist[0], "onclick", function(){ DrawArrGlobal.point.activate(); });
		dojo.connect(nodelist[1], "onclick", function(){ DrawArrGlobal.line.activate(); });
		dojo.connect(nodelist[2], "onclick", function(){ DrawArrGlobal.polygon.activate(); });

		
		
		surfacetest0.createCircle({ cx: 8, cy: 5, r: 4 }).setFill("yellow").setStroke("blue");
		surfacetest1.createLine({ x1: 4, y1: 8, x2: 12, y2: 0 }).setStroke("blue");
		surfacetest2.createRect({ x: 4, y: 1, width: 8, height: 8 }).setFill("red").setStroke("blue");
		
		//END DRAWING TEST

	}.bind(this) );
},
// END getPresets()


// BEGIN presetNodeCreator
presetNodeCreator : function(item, hint) {
//	var node = domConstruct.toDom(stringUtil.substitute(

//	);
		//var node = dojo.create('div', { innerHtml: item.id } );
//		var node = dojo.create('div', { innerHtml: item.id } );



		var theDiv = dojo.create('div', { innerHtml: item.id } );
		var node =   { node: theDiv, data: hint, type: hint }; 
		this.presetNodeArr.push( node );


//		jontest2 = node;

//		var surfacetest0 = dojox.gfx.createSurface(node,10,10);
//		surfacetest0.createCircle({ cx: 4, cy: 4, r: 4 }).setFill("yellow").setStroke("blue");
		
//	return { node: node, data: item, type: type };

		//Korb: The array gets populated
		//this.presetNodeArr.push(  { node: node, data: item.id, type: hint } );
}
// END presetNodeCreator

} );
// END declare srd_editPalette

} );
// END REQUIRE





