var WebSocketServer = require('ws').Server;
var serverOptions = {
	host: "192.168.0.146",
	port: 8989,
	noServer: true
}
var wss = new WebSocketServer(serverOptions);

// A list of WebSocket objects representing connected clients.
var connections = [];

wss.on('connection', function (ws) {
	
	// Tell new player about existing movable items.
	// Create a complete list of all movers from all connections.
	var allMovers = [];
	for (var i=0; i<connections.length; i++) {
		
		var moverList = connections[i].movers;
		for (var item in moverList) {
			allMovers.push(moverList[item]);
		}
	}
	
	// !!! DEBUG !!! //
	console.log("Sending entire movers list: ", allMovers)
	
	// If there's at least one mover here, tell everyone about it.
	if (allMovers.length > 0) {
		var announceEvent = {
			"type": "announce_movers",
			"movers": allMovers,
			"initial": "true"
		};
		ws.send(JSON.stringify(announceEvent));
	}
	
	// A place to store movers for this connection.
	ws.movers = {};
	
	// When the server recieves a message from this connection...
    ws.on('message', function(message) {
        console.log('Received: %s', message);
		
		// Inspect data.
		var data = JSON.parse(message);
		
		// Store movers list so we can update players that join later.
		if (data.type == "announce_movers") {
			for (var item in data.movers) {
				var curMover = data.movers[item];
				ws.movers[curMover.id] = data.movers[item];
			}
		}
		
		// Keep track of where movers are.
		if (data.type == "movement") {
			var moved = ws.movers[data.id];
			moved.x = data.destination.x;
			moved.y = data.destination.y;
		}
		
		// Broadcast the message.
		for (var i = 0; i<connections.length; i++) {
			// Don't bounce messages back to origin.
			if (connections[i] != ws) {
				connections[i].send(message);
			}
		}
    });
	
	ws.on('close', function (code, data) {
		for(var i = 0; i<connections.length; i++) {
			if (connections[i] == ws) {
				connections.splice(i, i+1);
			}
		}
		console.log("Connection Closed: (", code, ")", data);
	});
	
	// Add 'er to the heap!
	connections.push(ws);
	
	// Debug.
	console.log("Open connections: ", connections.length);
	
});