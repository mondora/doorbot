var tessel = require("tessel");
var relaylib = require("relay-mono");
var relay = relaylib.use(tessel.port.A);	
var http = require("http");

relay.on("ready", function relayReady () {
	var srv = http.createServer();
	srv.on("request", function (req, res) {
		if (req.url !== "/open") {
			res.end("Non-valid route");
			return;
		}
		res.end("Opening door...");
		relay.turnOn(1);
		relay.turnOn(2);
		setTimeout(function () {
			relay.turnOff(1);
			relay.turnOff(2);
		}, 2 * 1000);
		res.end();
	});
	srv.listen("80");
});
