'use strict';

class changeLog {
	constructor(server) {
		this.server = server,
		this.model = this.server.changelog;
	}

	create(obj) {
		return this.model.create(obj);
	}

	findLastChange(key, timestamp) {
		const filter = { key: key };
		if (timestamp > 0) filter.timestamp = { $lte: timestamp };
		return this.model.findOne(filter).sort({timestamp: -1});
	}
}

module.exports = changeLog;