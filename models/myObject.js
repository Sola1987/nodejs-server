'use strict';

const Promise = require('bluebird');
const changeLog = require('./changeLog');

class myObject {
	constructor(server) {
		this.server = server;
		this.changelog = new changeLog(server),
		this.model = this.server.object;
	}

	save(obj) {
		const key = Object.keys(obj)[0],
			value = obj[key];

		return this._find(key).then(existing => {
			const updated = { key: key, value: value, timestamp: Math.floor(new Date().getTime() / 1000) };
			if (existing) return this._update(existing, updated);
			else return this._create(updated);
		});
	}

	getByKey(key, timestamp) {
		timestamp = parseInt(timestamp) || 0;
		const filter = { key: key };
		if (timestamp > 0) filter.timestamp = { $lte: timestamp };
		return this.model.findOne(filter).then(existing => {
			if (existing) return existing;
			else return this.changelog.findLastChange(key, timestamp);
		});
	}

	_create(obj) {
		return this.model.create(obj).then(data => {
			this.save2Changelog(obj);
			return data;
		});
	}

	_update(obj, changes) {
		for (const i in changes) {
			obj[i] = changes[i];
		}
		return obj.save().then((data) => {
			this.save2Changelog(changes);
			return data;
		});
	}

	_find(key) {
		return new Promise((resolve, reject) => {
			this.model.findOne({key: key}, (err, obj) => {
				if (err) reject(err);
				else resolve(obj);
			});
		});
	}

	save2Changelog(change) {
		this.changelog.create(change);
	}

}

module.exports = myObject;