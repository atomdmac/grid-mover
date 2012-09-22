var WebSocketServer = require('ws').Server;

var serverOptions = {
	host: "192.168.0.146",
	port: 8989,
	noServer: true
}
var wss = new WebSocketServer(serverOptions);

// A list of WebSocket objects representing connected clients.
var connections = [];

/** 
 * Create a list of all movers that have been reported by connected players and
 * send it to the specified WebSocket connection/player.
 */
function announceMovers (ws) {
	// Tell new player about existing movable items.
	// Create a complete list of all movers from all connections.
	var allMovers = [];
	for (var i=0; i<connections.length; i++) {
		
		// Don't tell this connection about itself.
		if (connections[i] == ws) continue;
		
		var moverList = connections[i].movers;
		for (var item in moverList) {
			allMovers.push(moverList[item]);
		}
	}
	
	// If there's at least one mover here, tell everyone about it.
	if (allMovers.length > 0) {
		var announceEvent = {
			"type"   : "announce_movers",
			"movers" : allMovers,
			"initial": "true"
		};
		ws.send(JSON.stringify(announceEvent));
	}
}

/**
 * Alert other players that a new player has joined and tell them about the
 * new player.
 */
function handleClientJoin (ws, data) {
	// A place to store movers for this connection.
	ws.movers = {};
	
	// Store player information.
	ws.player = data.player;
	
	// Store movers list so we can update players that join later.
	for (var item in data.movers) {
		var curMover = data.movers[item];
		ws.movers[curMover.id] = data.movers[item];
	}
}

function handleClientLeave (ws, data, code) {
	// Create a "leave" event to alert other players that a connection
	// has been dropped.
	var leaveMovers = [];
	for (var m in ws.movers) {
		leaveMovers.push(ws.movers[m]);
	}
	var leaveEvent = {
		type: "leave",
		player: ws.player,
		movers: leaveMovers
	};
	var leaveEventString = JSON.stringify(leaveEvent);
	
	// !!! DEBUG !!! //
	console.log("Player Leaves: ", leaveEventString);
	
	for(var i=0; i<connections.length; i++) {
		// Make a note of where the leaver connection is in our array so we can
		// remove it when we're done alerting connected players.
		if (connections[i] == ws) {
			var leaverIndex = Number(i);
		}
		
		// If we're not dealing with the connection that just left,
		// broadcast a "leave" event.
		else {
			connections[i].send(leaveEventString);
		}
	}
	
	// Remove the leaver connection.
	connections.splice(leaverIndex, leaverIndex+1);
}

function broadcastMessage(ws, message) {
	for (var i = 0; i<connections.length; i++) {
		// Don't bounce messages back to origin.
		if (connections[i] != ws) {
			connections[i].send(message);
		}
	}
}

wss.on('connection', function (ws) {
	
	// When the server recieves a message from this connection...
    ws.on('message', function(message) {
	
		// !!! DEBUG !!! //
        console.log('Received: %s', message);
		
		// Inspect data.
		var data = JSON.parse(message);
		
		// --------------------------------------------------------------------
		// Keep track of where movers are.
		if (data.type == "movement") {
			var moved = ws.movers[data.id];
			moved.x = data.destination.x;
			moved.y = data.destination.y;
		}
		
		// --------------------------------------------------------------------
		// Player has joined.
		else if (data.type == "join") {
			// Initialize the player.
			handleClientJoin(ws, data);
			
			// Send a list of all movers to new player.
			announceMovers(ws);
		}
		
		// --------------------------------------------------------------------
		// Player has left.
		else if (data.type == "leave") {
			handleClientLeave(ws, data);
		}
		
		// --------------------------------------------------------------------
		// Broadcast the message.
		broadcastMessage(ws, message);
    });
	
	ws.on('close', function (code, data) {
		handleClientLeave(ws, data, code);
		console.log("Connection Closed: (", code, ")", data);
	});
	
	// Add 'er to the heap!
	connections.push(ws);
	
	// Debug.
	console.log("Open connections: ", connections.length);
	
});