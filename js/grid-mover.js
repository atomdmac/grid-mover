// ----------------------------------------------------------------- //
// Grid Mover
// ----------------------------------------------------------------- //
Crafty.c("GridMover", {
	
	// A unique ID for this entity.
	id: null,
	
	// The assumed size of each tile.  Affects how far our minimum 
	// movement distance is.
	_gridSize: 50,
	
	// How long it takes us to move from our current position to our next.
	_moveDuration: 10,
	
	// Are we moving between tiles currently?
	_isMoving: false,
	
	// Current direction that we're moving.
	_direction: null,
	
	// Move me!
	_move: function (bUseEvent) {
		
		if (!this._isMoving) {
			// Well, we're going to move now.
			this._isMoving = true;
			
			// Define animation properties.
			var animProps;
			
			// !!! DEBUG !!! //
			console.log("Trying to move using key: ", this._curKey);
			
			// Which direction to move?
			switch (this._direction) {
				case "LEFT":
					animProps = {
						x: this._x - this._gridSize
					};
					break;
				case "RIGHT":
					animProps = {
						x: this._x + this._gridSize
					};
					break;
				case "UP":
					animProps = {
						y: this._y - this._gridSize
					};
					break;
				case "DOWN":
					animProps = {
						y: this._y + this._gridSize
					};
					break;
				default:
					console.log("Well, this is weird... Not a valid direction: ", this._direction);
					break;
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
				destination: destinationCell,
				direction: this._direction
			};
			
			// Dispatch an event (if necessary).
			if (bUseEvent) {
				this.trigger("ChangeCellStart", event);
			}
		}
	},
	
	// Convert a position to a tile/cell.
	_toCell: function (pos) {
		return {
			x: Math.floor(pos.x / this._gridSize),
			y: Math.floor(pos.y / this._gridSize)
		}
	},
	
	// Convert a tile/cell position to screen coords.
	_toCoords: function (pos) {
		return {
			x: pos.x * this._gridSize,
			y: pos.y * this._gridSize
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
		if (this._direction != null) {
			this._move(this._direction);
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