/**
 * Represents a non-local player.
 */
Crafty.c("RemoteMover", {
	
	// Data describing this mover.  Passed from server.
	_data: null,
	
	// Path to follow.
	_path: null,
	
	// Update position based on new info from server.
	updatePosition: function (data) {
		// !!! DEBUG !!! //
		console.log("Remote Movement: ", data.direction);
		
		// Stop all current tweens on this.
		// NOTE: This is a total hack.  See Tween in Crafty code for details.
		this.stopAllTweens();
		
		// Player is still in motion.  Continue along general path.
		if (data.direction) {
			this._isMoving = false;
			this._direction = data.direction;
			this._move(this._toCoords(data.destination));
		}
		// Player has stopped moving.  Go to final destination.
		else {
			// Only tolerate 5 movement in advance.  If we lag out, we lag out.
			if (this._path.length > 5) {
				this._path.splice(0, this._path.length);
			}
			
			// Queue 'er up for movement.
			this._path.push(this._toCoords(data.destination));
		}
	},
	
	// NOTE: We use position here, not direction.  GET IT?
	_move: function (position) {
		this.tween(position, this._moveDuration);
	},
	
	// Called when the _move() animation finishes.
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
		if (this._path.length > 0) {
			var next = this._path.pop();
			this._move(next);
		}
	},
	
	// Initialize with parameters.
	remoteMover: function (data) {
		
		// !!! DEBUG !!! //
		console.log("Creating Remote Mover: ", data);
		
		// Cache data in case we need it later.
		this._data = data;
		
		// Save ID info.
		this.id = data.id;
		
		// Convert the given cell/grid position to real coordinates.
		var pos = this._toCoords(data);
		
		// Apply data to our remote mover instance.
		this.attr({
			x: pos.x,
			y: pos.y,
			w: this._gridSize,
			h: this._gridSize
		});
		this.color(data.color);
		
		// Used for scoping.
		var self = this;
		
		// Event handlers.
		this.bind("ChangeCellStart", function (e) {
			self.updatePosition.call(self, e);
		});
		// Assign event handlers.
		this.bind("TweenEnd", function (e) {
			self._onTileArrive.call(self, e) 
		});
		
		// For chaining.
		return this;
	},
	
	// Pre-init stuff.
	init: function () {
		// Used for scoping.
		var self = this;
	
		// HACK ATTACK: Make sure the functions defined here don't get overriden
		// by the components that we add.
		var tileArriveTemp = this._onTileArrive;
		var moveTemp = this._move;
		
		// Dependencies.
		this.requires("2D, DOM, Color, GridMover, Mouse");
		
		// THIS IS A TOTAL HACK: (Continued from HACK ATTACK above).
		this._onTileArrive = tileArriveTemp;
		this._move = moveTemp;
		
		// Initialize path array.
		this._path = [];
		
		// !!! DEBUG !!! //
		// When this entity is clicked, print information about it.
		this.bind("Click", function (e) {
			console.log("Remote Player Info: ", this._data);
		});
	}
});