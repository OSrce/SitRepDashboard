dojo.declare(
    "srd/testavatar",
    [dojo.dnd.Avatar],
    {    
        _mouseOverConnects: [],
            
        construct: function() {
            // override and cancel the autoScroll function to prevent whitespace from appearing
            // in the application when the user is dragging files near the border.
            dojo.dnd.autoScroll = function(){};
            this._mouseOverConnects.push(dojo.connect(this.manager, "onMouseMove", this, "_handleMouseMove"));
        }

        _handleMouseMove: function() {
            var pos, viewport = dojo.window.getBox();
            if(this.node) {
                pos = dojo.position(this.node);
                if(viewport.w <= pos.x + pos.w || pos.x <= 0
                || viewport.h <= pos.y + pos.h || pos.y + pos.h <= 0) {
                // at this stage we know that the user is dragging the avatar close to the application's boundaries.
                // time to make a switch from an internal dnd operation to an external dnd.
                this. _handleExternalDnd();
            }
        }
