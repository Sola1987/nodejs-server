'use strict';

const Server = require('./server');

const SERVER = { host: 'localhost', port: 3000 };

const server = new Server(SERVER.host, SERVER.port);

server.on('ready', () => {
	console.log('✅  Server started, listening port: 3000');
});