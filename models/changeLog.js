class changeLog {
	constructor(server) {
		this.server = server,
		this.model = this.server.changelog;
	}

	create(obj) {
		return this.model.create(obj);
	}

	findLastChange(key, timestamp) {
		return this.model.findOne({key: key, timestamp: {$lte: timestamp}}).sort({timestamp: -1});
	}
}

module.exports = changeLog;