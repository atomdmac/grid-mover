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
	var movers = [];
	for (var i=0; i<connections.length; i++) {
		movers = movers.concat(connections[i].movers);
	}
	if (movers.length > 0) {
		var announceEvent = {
			"type": "announce_movers",
			"movers": movers,
			"initial": "true"
		};
		ws.send(JSON.stringify(announceEvent));
	}
	console.log("Sending entire movers list: ", movers)
	
    ws.on('message', function(message) {
        console.log('Received: %s', message);
		
		// Inspect data.
		var data = JSON.parse(message);
		
		// Store movers list so we can update players that join later.
		if (data.type == "announce_movers") {
			ws.movers = data.movers;
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