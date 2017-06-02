var robotServer = require("./robotServer.js");
var UIServer = require("./UIServer.js");

robotServer.startServer();
UIServer.startServer(robotServer);

// Exit program
process.on('SIGINT', () => {
	robotServer.stopServer();
	UIServer.stopServer();
	console.log("Stopping Mission Control, bye!");
	process.exit();
});
