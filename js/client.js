/*
 * Client-side Networking Code
 */
Crafty.c("WebSocketClient", {
	// WebSocket Object.
	_ws: null,
	
	_onConnect: function (event) {
		console.log("Connection Established: ", event);
		// TODO
		
		// Announce local Movers to server.
		var announceEvent = {
			type: Event.ANNOUNCE_MOVERS,
			movers: this._serializeLocalMovers()
		};
			
		this._ws.send(JSON.stringify(announceEvent));
	},
	
	_onMessage: function (event) {
		// TODO
		
		// !!! DEBUG !!! //
		console.log("Message Recieved: ", event);
		
		// Parse the incoming data back into JSON.
		var data = JSON.parse(event.data);
		
		// Determine what kind of message this is:
		// - Initial user/player list?
		if (data.type == Event.ANNOUNCE_MOVERS) {
			console.log(data);
			this._initRemoteMovers(data.movers);
		}
		
		// - User movement update (movement)?
		else if (data.type == Event.MOVE) {
			this._remoteMovers[data.id].updatePosition(data);
		}
		
		// - Request for interaction?
		else if (data.type == Event.INTERACT) {
			// TODO
		}
		// - ...etc.
	},
	
	_onError: function (event) {
		console.log("Connection Error: ", event);
	},
	
	_onClose: function (event) {
		console.log("Connection Closed!");
	},
	
	/**
	 * Keep track of where this local mover object is.
	 */
	_localMovers: null,
	add: function (localMover) {
		// TODO: Check to see if item was added previously so we don't get dups.
		if (this._localMovers[localMover.id] == undefined) {
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
				"id": cur.id,
				"x": pos.x,
				"y": pos.y,
				"color": cur._color
			});
		}
		
		return list;
	 },
	
	/**
	 * Remote movers.
	 */
	_remoteMovers: null,
	_initRemoteMovers: function (list) {
		for (var a in list) {
			var mover = Crafty.e("RemoteMover")
				.remoteMover(list[a]);
				
			// Add it to the pile!
			this._remoteMovers[mover.id] = mover;
		}
	},
	_addRemoteMover: function (data) {
		// TODO
	},
	_removeRemoteMover: function (id) {
		// TODO
	},
	
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
	
	send: function (msg) {
		this._ws.send(msg);
	},
	
	init: function () {
		this._localMovers = {};
		this._remoteMovers = {};
	}
});