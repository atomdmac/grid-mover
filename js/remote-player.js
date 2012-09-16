/**
 * Represents a non-local player.
 */
Crafty.c("RemoteMover", {
	
	// Initialize with parameters.
	remoteMover: function (data) {
		
		// !!! DEBUG !!! //
		console.log("Creating Remote Mover: ", data);
	
		this.id = data.id;
		this.attr({
			x: data.x,
			y: data.y,
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
		
		// For chaining.
		return this;
	},
	
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
			this._move(false);
		}
		// Player has stopped moving.  Go to final destination.
		else {
			this.tween(this._toCoords(data.current), 5);
		}
	},
	
	// Pre-init stuff.
	init: function () {
		// Dependencies.
		this.requires("2D, DOM, Color, GridMover");
	}
});