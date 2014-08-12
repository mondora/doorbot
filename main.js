var tessel = require("tessel");
var relaylib = require("relay-mono");
var relay = relaylib.use(tessel.port.A);	
var http = require("http");
var url = require("url");
var querystring = require("querystring");

// Authorization token
var TOKEN = require("./token.js").token;
// How long to "hold the button down"
var DURATION = 2 * 1000;
// Status of the relay: true open, false closed
var RELAY_STATUS = false;

// Wait for the relay to be ready
relay.on("ready", function () {
	console.log("RELAY READY");
	// Wait 10 seconds to give time to the
	// tessel to connect to the wifi network
	setTimeout(function () {
		var srv = http.createServer();
		srv.on("request", function (req, res) {
			var url = url.parse(req.url);
			// Only accept requests to the /open route
			if (url.pathname !== "/open") {
				console.log("UNAUTHORIZED");
				res.writeHead(401, "UNAUTHORIZED");
				res.end();
				return;
			}
			// Get the token from the request
			var token;
			try {
				token = querystring.parse(url.query).token;
			} catch (e) {
				console.log("BAD REQUEST");
				res.writeHead(400, "BAD REQUEST");
				res.end();
				return;
			}
			// The request needs to be authorized
			if (token !== TOKEN) {
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
		console.log("STARTING HTTP SERVER");
		srv.listen(80);
	}, 10000);
});
