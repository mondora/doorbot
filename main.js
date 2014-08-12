var tessel = require("tessel");
var relaylib = require("relay-mono");
var relay = relaylib.use(tessel.port.A);	
var http = require("http");

// Authorization token
var TOKEN = require("./token.js").token;
// How long to "hold the button down"
var DURATION = 2 * 1000;
// Status of the relay: true open, false closed
var RELAY_STATUS = false;

// Wait for the relay to be ready
relay.on("ready", function () {
	// Wait 10 seconds to give time to the
	// tessel to connect to the wifi network
	setTimeout(function () {
		var srv = http.createServer();
		srv.on("request", function (req, res) {
			// Only accept requests to the /open route
			if (req.url !== "/open") {
				console.log("UNAUTHORIZED");
				res.writeHead(401, "UNAUTHORIZED");
				res.end();
				return;
			}
			// Collect the body of the request
			var body = "";
			req.on("data", function (chunk) {
				body += chunk;
			});
			req.on("end", function () {
				// The body must be a JSON message
				try {
					body = JSON.parse(body);
				} catch (e) {
					console.log("BAD REQUEST");
					res.writeHead(400, "BAD REQUEST");
					res.end();
					return;
				}
				// The request needs to be authorized
				if (body.token !== TOKEN) {
					console.log("UNAUTHORIZED");
					res.writeHead(401, "UNAUTHORIZED");
					res.end();
					return;
				}
				// If we're already opening the door, do nothing
				if (RELAY_STATUS) {
					console.log("RELAY ALREADY OPEN");
					res.writeHead(200, "OK");
					res.end();
					return;
				}
				// Otherwise, open the door
				console.log("OPENING RELAY");
				RELAY_STATUS = true;
				relay.turnOn(1);
				setTimeout(function () {
					console.log("CLOSING RELAY");
					RELAY_STATUS = false;
					relay.turnOff(1);
					res.writeHead(200, "OK");
					res.end();
				}, DURATION);
			});
		});
		srv.listen(80);
	}, 10000);
});
