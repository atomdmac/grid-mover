/**
 * Represents a non-local player.
 */
Crafty.c("RemoteMover", {

	// Path to follow.
	_path: null,
	
	// Update position based on new info from server.
	updatePosition: function (data) {
		
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
		console.log("move to ", position);
		this.tween(position, this._moveDuration);
	},
	
	_onTileArrive: function (e) {
		console.log("ARRIVAL!");
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
		console.log("path = ", this._path);
		if (this._path.length > 0) {
			var next = this._path.pop();
			console.log("next = ", next);
			this._move(next);
		}
	},
	
	// Initialize with parameters.
	remoteMover: function (data) {
		
		// !!! DEBUG !!! //
		console.log("Creating Remote Mover: ", data);
	
		this.id = data.id;
		var pos = this._toCoords(data);
		
		console.log("POS = ", pos);
		
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
		// HACK ATTACK
		var tileArriveTemp = this._onTileArrive;
		var moveTemp = this._move;
		
		// Dependencies.
		this.requires("2D, DOM, Color, GridMover");
		
		// THIS IS A TOTAL HACK:
		this._onTileArrive = tileArriveTemp;
		this._move = moveTemp;
		
		// Initialize path array.
		this._path = [];
	}
});