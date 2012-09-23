/**
 * Allow movement from Touch or Mouse.
 */
Crafty.c("MouseMover", {

	// Position where touch/mouse was down.
	_downPos: {
		x: null,
		y: null
	},
	
	_getHeading: function (e) {
		// Calculate different.
		var diff = {
			x: e.clientX - this._downPos.x,
			y: e.clientY - this._downPos.y
		}
		var abs = {
			x: Math.abs(diff.x),
			y: Math.abs(diff.y)
		}
		
		console.log("abs = ", abs);
		
		// X movement is more significant.
		if (abs.x > abs.y) {
			if (diff.x > 0) {
				return "RIGHT";
			}
			else {
				return "LEFT";
			}
		}
		
		// Y movement is more significant
		else {
			if (diff.y > 0) {
				return "DOWN";
			}
			else {
				return "UP";
			}
		}
			
		return diff;
	},
	
	/**
	 * Handle touch/mouse down.
	 */
	_onDown: function (e) {
		console.log("on down", e);
		
		if (this._direction == null) {
			// Remember where we clicked/touched first.
			this._downPos.x = e.offsetX;
			this._downPos.y = e.offsetY;
			this._direction = this._getHeading(e);
			Crafty.addEvent(this, Crafty.stage.elem, "mousemove", this._onMove);
		}
	},
	
	_onMove: function (e) {
		this._direction = this._getHeading(e);
		this._move(true);
		console.log("direction: ", this._direction);
	},
	
	/** 
	 * Handle touch/mouse release.
	 */
	_onRelease: function (e) {
		// TODO
		console.log("on release", e, this);
		this._direction = null;
		Crafty.removeEvent(this, Crafty.stage.elem, "mousemove", this._onMove);
	},
	
	init: function () {
		this.requires("LocalMover");
		Crafty.addEvent(this, Crafty.stage.elem, "mousedown", this._onDown);
		Crafty.addEvent(this, Crafty.stage.elem, "mouseup", this._onRelease);
	}
});