/*
 * Client-side Networking Code
 */
Crafty.c("WebSocketClient", {
	// Information about this player/client.
	_player: {
		// Unique identifier for this client.
		id: "",
		// The display name for this player/client.
		name: ""
	},
	
	// WebSocket Object.
	_ws: null,
	
	/* 
	 * ------------------------------------------------------------------------
	 *  General Connection Events.
	 * ------------------------------------------------------------------------
	 */
	
	_onConnect: function (event) {
		console.log("Connection Established: ", event);
		
		// Send join information.
		var localMovers = this._serializeLocalMovers();
		var joinEvent = {
			type: Event.JOIN,
			player: this._player,
			movers: localMovers
		}
									
		this.send(joinEvent);
	},
	
	_onMessage: function (event) {
		
		// !!! DEBUG !!! //
		console.log("Message Recieved: ", event);
		
		// Parse the incoming data back into JSON.
		var data = JSON.parse(event.data);
		
		// Determine what kind of message this is:
		// - User movement update (movement)?
		if (data.type == Event.MOVE) {
			this._onRemoteMove(data);
		}
		
		// - Initial user/player list from server.
		else if (data.type == Event.ANNOUNCE_MOVERS) {
			this._onRemoteAnnounceMovers(data);
		}
		
		// - A new player has joined the server.
		else if (data.type == Event.JOIN) {
			this._onRemoteJoin(data);
		}
		
		// - An existing player has left the server.
		else if (data.type == Event.LEAVE) {
			this._onRemoteLeave(data);
		}
		
		// - A player has requested an interaction with me.
		else if (data.type == Event.INTERACT) {
			// TODO
		}
		
		// - ...etc.
		else {
			console.log("Unrecognized Network Event: ", data);
		}
	},
	
	_onError: function (event) {
		console.log("Connection Error: ", event);
	},
	
	_onClose: function (event) {
		console.log("Connection Closed!");
	},
	
	/* 
	 * ------------------------------------------------------------------------
	 *  Remote Events.
	 * ------------------------------------------------------------------------
	 */
	 
	// A player/client joined.
	_onRemoteJoin: function (data) {
		console.log("Player '", data.player, "' has joined.");
		this._initRemoteMovers(data.movers);
	},
	
	// A player/client left.
	_onRemoteLeave: function (data) {
		console.log("Player '", data.player, "' has left.");
		this._unInitRemoteMovers(data.movers);
	},
	
	// Server announces current movers.
	_onRemoteAnnounceMovers: function (data) {
		this._initRemoteMovers(data.movers);
	},
	
	// When a remote mover has changed position.
	_onRemoteMove: function (data) {
		this._remoteMovers[data.id].updatePosition(data);
	},
	
	/**
	 * Remote movers.
	 */
	_remoteMovers: null,
	_initRemoteMovers: function (list) {
		for (var a in list) {
			this._addRemoteMover(list[a]);
		}
	},
	
	_unInitRemoteMovers: function (list) {
		for (var a in list) {
			this._removeRemoteMover(list[a]);
		}
	},
	
	_addRemoteMover: function (data) {
		// Create a new RemoteMover component to represent the mover.
		var mover = Crafty.e("RemoteMover").remoteMover(data);
		
		// Add it to the pile!
		this._remoteMovers[mover.id] = mover;
	},
	
	_removeRemoteMover: function (data) {
		if (this._remoteMovers[data.id]) {
			this._remoteMovers[data.id].destroy();
		}
	},
	
	/* 
	 * ------------------------------------------------------------------------
	 *  Local Events.
	 * ------------------------------------------------------------------------
	 */
	
	_onMove: function (event) {
		this.send(event);
	},
	
	_onArrive: function (event) {
		this.send(event);
	},
	
	/**
	 * Keep track of where this local mover object is.
	 */
	_localMovers: null,
	add: function (localMover) {
		if (this._localMovers[localMover.id] == undefined) {
			// Listen for events.
			localMover.bind(Event.MOVE, Utils.bindScope(this, this._onMove));
			localMover.bind(Event.ARRIVE, Utils.bindScope(this, this._onArrive));
			
			this._localMovers[localMover.id] = localMover;
		}
	},
	remove: function (localMover) {
		this._localMovers[localMover.id] = undefined;
	},
	
	/**
	 * Create a version of the local mover's data that is suitable for passage
	 * to the server.
	 */
	_serializeLocalMovers: function () {
		var list = [];
		for (var a in this._localMovers) {
			var cur = this._localMovers[a];
			var pos = cur._toCell({
				"x": cur.x,
				"y": cur.y
			});
			list.push({
				"player": this._player,
				"id": cur.id,
				"x": pos.x,
				"y": pos.y,
				"color": cur._color
			});
		}
		return list;
	},
	
	/* 
	 * ------------------------------------------------------------------------
	 *  Public Methods.
	 * ------------------------------------------------------------------------
	 */
	
	/**
	 * Connect to the server and assign callbacks to the resulting connection.
	 *
	 * @param url
	 * @param port
	 * @return Void
	 */
	connect: function (url, port) {
		var self = this;
		this._ws = new WebSocket(url + ":" + port);
		
		// Assign event handlers.
		this._ws.onopen = function (event) { 
			self._onConnect.call(self, event); 
		};
		this._ws.onmessage = function (event) { 
			self._onMessage.call(self, event);
		};
		this._ws.onerror = function (event) {
			self._onError.call(self, event);
		};
		this._ws.onclose = function (event) {
			self._onClose.call(self, event);
		};
	},
	
	/**
	 * If a connection to the server is open, send a message to it.
	 *
	 * @param data
	 * @return Void
	 */
	send: function (data) {
		// Add additional information.
		data.player = this._player;
		this._ws.send(JSON.stringify(data));
	},
	
	/**
	 * Pre-initialization stuff.
	 */
	init: function () {
		this._localMovers = {};
		this._remoteMovers = {};
	}
});