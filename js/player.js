Crafty.c("LocalMover", {
	
	// A reference to the global websocket used for communicating with the
	// server.
	_websocket: null,
	
	// ---
	// KEYBOARD MOVEMENT STUFF
	// ---
	// If a key is pressed, remember which one.
	_curKey: null,
	
	// Fire when a key is pressed.
	_keyDown: function (e) {
		if (this._curKey == null) {
			this._curKey = e.key;
			this._direction = this._getDirection(e.key);
			if (this._direction) this._move(true);
		}
	},
	
	// Fire when a key is released.
	_keyUp: function (e) {
		if (this._curKey == e.key) {
			this._curKey = null;
			this._direction = null;
		}
	},
	
	// Turn keycode into direction string.
	_getDirection: function (key) {
		// Which direction to move?
		switch (key) {
			case Crafty.keys["LEFT_ARROW"]:
				return "LEFT";
			case Crafty.keys["RIGHT_ARROW"]:
				return "RIGHT";
			case Crafty.keys["UP_ARROW"]:
				return "UP";
			case Crafty.keys["DOWN_ARROW"]:
				return "DOWN";
			default:
				console.log("Defaulting!");
				return false;
		}
	},
	
	// Fire when player announces change in tiles/cells/position.
	_onChangeCellStart: function (e) {
	
		// !!! DEBUG !!! //
		console.log("ChangeCellStart: ", e);
		
		// Tell server that I'm moving.
		var moveEvent = {
			type: Event.MOVE,
			id: this.id,
			current: e.current,
			destination: e.destination,
			direction: this._direction
		};
		this._websocket.send(JSON.stringify(moveEvent));
	},
	
	_onChangeCellEnd: function (e) {
		// !!! DEBUG !!! //
		console.log("ChangeCellEnd: ", e);
		
		// Tell the server that I'm no longer moving.
		var arriveEvent = {
			type: Event.ARRIVE,
			id: this.id,
			current: e.current
		};
		this._websocket.send(JSON.stringify(arriveEvent));
	},
	
	// Init with arguments.
	localMover: function (color, websocket) {
		this.color(color);
		this._websocket = websocket;
		
		// For chaining.
		return this;
	},
	
	// Pre-init stuff.
	init: function () {
		// Dependencies.
		this.requires("2D, Color, DOM, GridMover");
		
		// Initialize my ID.
		this.id = new Date().getTime();
		
		// Used for scoping.
		var self = this;
		
		// Assign event handlers.
		this.bind("KeyDown", function (e) { 
			self._keyDown.call(self, e) 
		});
		this.bind("KeyUp", function (e) { 
			self._keyUp.call(self, e) 
		});
		this.bind("ChangeCellStart", function (e) {
			self._onChangeCellStart.call(self, e);
		});
		this.bind("ChangeCellEnd", function (e) {
			self._onChangeCellEnd.call(self, e);
		});
	}
});