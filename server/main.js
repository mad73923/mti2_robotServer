var robotServer = require("./index.js");
var UIServer = require("./UIServer.js");

robotServer.startServer();
UIServer.startServer();

// Exit program
process.on('SIGINT', () => {
	robotServer.stopServer();
	UIServer.stopServer();
	console.log("Stopping Mission Control, bye!");
	process.exit();
});
