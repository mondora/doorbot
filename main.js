var tessel = require("tessel");
var relaylib = require("relay-mono");
var http = require("http");
var url = require("url");
var querystring = require("querystring");

// Authorization token
var TOKEN = process.env.TOKEN || "testToken";
// How long to "hold the button down"
var DURATION = process.env.DURATION || 4 * 1000;
// Status of the relay: true open, false closed
var RELAY_STATUS = false;

// Blinking lights and relay
var blink = {
	led: tessel.led[1],
	relay: relaylib.use(tessel.port.A)
};
blink.start = function () {
	var self = this;
	self.interval = setInterval(function () {
		self.led.toggle();
		self.relay.toggle(1);
		self.relay.toggle(2);
	}, 500);
};
blink.stop = function () {
	clearInterval(this.interval);
	this.led.output(0);
	this.relay.turnOff(1);
	this.relay.turnOff(2);
};

// Request handler
var handler = function (req, res) {
	console.log("REQUEST RECEIVED");
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
	res.writeHead(200, "OK");
	res.end();
	// If we're already opening the door, do nothing
	if (RELAY_STATUS) {
		console.log("RELAY ALREADY OPEN");
		return;
	}
	// Otherwise, open the door
	console.log("START BLINKING");
	RELAY_STATUS = true;
	blink.start();
	setTimeout(function () {
		console.log("STOP BLINKING");
		RELAY_STATUS = false;
		blink.stop();
	}, DURATION);
};

// Set up the server
var init = function () {
	var srv = http.createServer();
	srv.on("request", handler);
	console.log("STARTING HTTP SERVER");
	srv.listen(80);
};

// Wait for the relay to be ready
relay.on("ready", function () {
	console.log("RELAY READY");
	// Wait 10 seconds to give time to the
	// tessel to connect to the wifi network
	setTimeout(init, 10000);
});
