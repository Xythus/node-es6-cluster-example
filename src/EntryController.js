const path    = require('path');
const express = require('express');

class EntryController {
	constructor() {
		console.log("Worker constructor reached, worker rigged to die in 2 seconds...");

		let app = express();
		app.use('/', express.static(path.join(__dirname, 'regular-mode')));
		app.listen(process.env.PORT || 8080, () => {
			console.log(`Worker listening for connections`);
		});

		setTimeout(() => {
			process.exit(1);
		}, 2000);
	}
}

module.exports = new EntryController();
