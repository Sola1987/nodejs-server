'use strict';

const
	Events = require('events'),
	http = require('http'),
	Promise = require('bluebird'),
	mongoose = require('mongoose'),						// for storage
	querystring = require('querystring'),
	schemas = require('./schemas'),						// defines model schema
	myObject = require('./models/myObject'),			// main model, to store object
	changeLog = require('./models/changeLog');			// change log, used to store object create and change history

const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

class Server extends Events{
	constructor(host, port) {
		super();

		// connect to test database
		mongoose.createConnection('mongodb://' + host + '/vaultdragon', {
			useMongoClient: true,
		}).then(db => {
			this.db = db;
			// init object & changelog model
			this.object = db.model('object', new Schema(schemas.object));
			this.changelog = db.model('changelog', new Schema(schemas.changelog));

			// create server & listen
			this.server = http.createServer(this._listener.bind(this));
			this.server.listen(port);

			this.emit('ready');
		});
	}

	stop() {
		return new Promise((resolve) => {
			this.server.close(() => resolve());
		});
	}

	_listener(req, res) {
		const errorReturn = '<!doctype html><html><head><title>404</title></head><body>404: Resource Not Found</body></html>';

		if(req.method === "POST") {
		    if (req.url === "/object") {
		    	this.getData(req).then(data => {
		    		res.writeHead(200, { 'Content-Type': 'application/json' });
		    		const object = new myObject(this);
					object.save(data).then((obj) => {
						res.end(JSON.stringify(this.format(obj)));
					});
		    	});
		    } else {
		      	res.writeHead(404, {'Content-Type': 'text/html'});
      			res.end(errorReturn);
		    }
	  	} else if (req.method === "GET") {
	  		const urlParts = this.parseUrl(req.url);
	  		if (urlParts.objectName === 'object' &&  urlParts.objectKey) {
	  			let timestamp = 0;
	  			if (urlParts.params) timestamp = urlParts.params.timestamp;
	    		const object = new myObject(this);
	    		object.getByKey(urlParts.objectKey, timestamp).then(obj => {
	    			if (obj) {
	    				res.writeHead(200, { 'Content-Type': 'application/json' });
	    				res.end(JSON.stringify(this.format(obj, 'get')));
	    			} else {
	    				res.writeHead(404, {'Content-Type': 'text/html'});
      					res.end(errorReturn);
	    			}
	    		});
		    } else {
		      	res.writeHead(404, {'Content-Type': 'text/html'});
      			res.end(errorReturn);
		    }
	  	} else {
	  		res.writeHead(404, {'Content-Type': 'text/html'});
  			res.end(errorReturn);
	  	}
	}

	getData(res) {
		const self = this,
			contentType = res.headers['content-type'];

		return new Promise((resolve, reject) => {
			res.setEncoding('utf8');
			let rawData = '';
			res.on('data', (chunk) => { rawData += chunk; });
			res.on('end', () => {
				try {
					const data = (contentType === 'application/json') ? JSON.parse(rawData) : rawData;
					resolve(data);
				} catch (e) {
					reject(e.message);
				}
			});
		});
	}

	parseUrl(url) {
		const urlParts = { objectName: null, objectKey: null, params: null };
		const parsedUrl = url.split('?');
  		if (parsedUrl[0]) {
  			const parsedSubUrl = parsedUrl[0].split('/');
  			if (parsedSubUrl.length >= 2) {
  				urlParts.objectName = parsedSubUrl[1];
  				if (parsedSubUrl[2]) urlParts.objectKey = parsedSubUrl[2];
  			}
  		}
  		if (parsedUrl[1]) urlParts.params = querystring.parse(parsedUrl[1]);

  		return urlParts;
	}

	format(obj, method) {
		obj = JSON.parse(JSON.stringify(obj));
		if (obj.hasOwnProperty('_id')) delete obj._id;
		if (obj.hasOwnProperty('__v')) delete obj.__v;
		if (method === 'get') {
			delete obj.key;
			delete obj.timestamp;
		}
		return obj;
	}
}

module.exports = Server;