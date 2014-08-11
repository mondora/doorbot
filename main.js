var tessel = require("tessel");
var relaylib = require("relay-mono");
var relay = relaylib.use(tessel.port.A);	
var http = require("http");

var DURATION = 2 * 1000;

var open = false;

relay.on("ready", function relayReady () {
	var srv = http.createServer();
	srv.on("request", function (req, res) {
		if (req.url !== "/open") {
			console.log("UNAUTHORIZED");
			res.writeHead(401, "UNAUTHORIZED");
			res.end();
			return;
		}
		if (open) {
			console.log("RELAY ALREADY OPEN");
			res.writeHead(200, "OK");
			res.end();
			return;
		}
		console.log("OPENING RELAY");
		open = true;
		relay.turnOn(1);
		setTimeout(function () {
			console.log("CLOSING RELAY");
			open = false;
			relay.turnOff(1);
			res.writeHead(200, "OK");
			res.end();
		}, DURATION);
	});
	srv.listen(80);
});
