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
			res.writeHead(401, "UNAUTHORIZED");
			res.end();
			return;
		}
		if (open) {
			res.writeHead(200, "OK");
			res.end();
			return;
		}
		open = true;
		relay.turnOn(1);
		setTimeout(function () {
			open = false;
			relay.turnOff(1);
			res.writeHead(200, "OK");
			res.end();
		}, DURATION);
	});
	srv.listen("80");
});
