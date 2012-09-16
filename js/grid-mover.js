// ----------------------------------------------------------------- //
// Grid Mover
// ----------------------------------------------------------------- //
Crafty.c("GridMover", {
	
	// A unique ID for this entity.
	id: null,
	
	// If a key is pressed, remember which one.
	_curKey: null,
	
	// The assumed size of each tile.  Affects how far our minimum 
	// movement distance is.
	_gridSize: 50,
	
	// How long it takes us to move from our current position to our next.
	_moveDuration: 10,
	
	// Are we moving between tiles currently?
	_isMoving: false,
	
	// Fire when a key is pressed.
	_keyDown: function (e) {
		if (this._curKey == null) {
			this._curKey = e.key;
			this._move();
		}
	},
	
	// Fire when a key is released.
	_keyUp: function (e) {
		if (this._curKey == e.key) {
			this._curKey = null;
		}
	},
	
	// Move me!
	_move: function () {
		
		if (!this._isMoving) {
			// Well, we're going to move now.
			this._isMoving = true;
			
			// Define animation properties.
			var animProps;
			
			// !!! DEBUG !!! //
			console.log("Trying to move using key: ", this._curKey);
			
			if (this._curKey == Crafty.keys["LEFT_ARROW"]) {
				animProps = {
					x: this._x - this._gridSize
				};
			}
			
			else if (this._curKey == Crafty.keys["RIGHT_ARROW"]) {
				animProps = {
					x: this._x + this._gridSize
				};
			}
			
			else if (this._curKey == Crafty.keys["UP_ARROW"]) {
				animProps = {
					y: this._y - this._gridSize
				};
			}
			
			else if (this._curKey == Crafty.keys["DOWN_ARROW"]) {
				animProps = {
					y: this._y + this._gridSize
				};
			}
			
			// Go ahead and move 'er!
			this.tween(animProps, this._moveDuration);
			
			// Let everyone know that we've moved 'er!
			var currentCell = this._toCell({
				x: this._x,
				y: this._y
			});
			var destinationCell = this._toCell({
				x: animProps.x != undefined ? animProps.x : this._x,
				y: animProps.y != undefined ? animProps.y : this._y
			});
			var event = {
				target: this,
				current: currentCell,
				destination: destinationCell
			};
			
			this.trigger("ChangeCellStart", event);
		}
	},
	
	// Convert a position to a tile/cell.
	_toCell: function (pos) {
		return {
			x: Math.floor(pos.x / this._gridSize),
			y: Math.floor(pos.y / this._gridSize)
		}
	},
	
	// Fire when I've moved 1 whole tile.
	_onTileArrive: function (e) {
		this._isMoving = false;
		
		// Tell everyone about it!
		var currentPos = this._toCell({
			x: this._x,
			y: this._y
		});
		var event = {
			target: this,
			current: currentPos
		}
		this.trigger("ChangeCellEnd", event);
		
		// Keep moving?
		if (this._curKey != null) {
			this._move();
		}
	},
	
	// Initialize with arguments.
	gridMover: function (size, moveDuration) {
		this.attr({
			w: size,
			h: size
		});
		this._gridSize = size;
		this._moveDuration = moveDuration;
		
		// Used for scoping callbacks.
		var self = this;
		
		// Assign event handlers.
		this.bind("KeyDown", function (e) { 
			self._keyDown.call(self, e) 
		});
		this.bind("KeyUp", function (e) { 
			self._keyUp.call(self, e) 
		});
		this.bind("TweenEnd", function (e) {
			self._onTileArrive.call(self, e) 
		});
		
		// For chaining.
		return this;
	},
	
	// Pre-init stuff.
	init: function () {
		// Include dependencies.
		this.requires("2D, KeyBoard, Tween");
	}
});