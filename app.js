'use strict';

const Server = require('./server');

const SERVER = { host: 'localhost', port: 80 };

const server = new Server(SERVER.host, SERVER.port);

server.on('ready', () => {
	console.log('✅  Server started, listening port: ' + SERVER.port);
});