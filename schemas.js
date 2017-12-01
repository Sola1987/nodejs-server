const schemas = {
    object: {
        key: String,
        value: String,
        timestamp: Number
    },
    changelog: {
    	id: String,
        key: String,
        value: String,
        timestamp: Number
    }
};

module.exports = schemas;