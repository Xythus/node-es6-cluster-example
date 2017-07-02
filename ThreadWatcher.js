const cluster = require('cluster');
const path    = require('path');
const express = require('express');

class ThreadWatcher {
	constructor() {
		this.consecutiveDeaths = 0;
		this.consecutiveDeathMs = 5000;
		this.maxConsecutiveDeaths = 5;
		this.consecutiveDeathTimeout = null;

		cluster.setupMaster({
			exec: './EntryController.js'
		});
	}

	forkWorker() {

		let worker = cluster.fork();
		worker.on('exit', (code, signal) => this.handleWorkerDeath(worker, code, signal));
	}

	handleWorkerDeath(worker, code, signal) {
		console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);

		let canFork = this.handleConsecutiveDeath();

		if (code === 0) {
			console.log(`Worker died peacefully, shutting down master`);
			process.exit(0);
		} else if (!canFork) {
			console.log(`Too many consecutive worker deaths - Entering panic mode`);
			this.enterPanicMode();
		} else {
			console.log(`Worker died with an error, restarting worker`);
			this.forkWorker();
		}
	}

	handleConsecutiveDeath() {
		this.consecutiveDeaths++;

		if (this.consecutiveDeathTimeout != null)
			clearTimeout(this.consecutiveDeathTimeout);

		this.consecutiveDeathTimeout = setTimeout(() => {
			this.consecutiveDeaths = 0;
			this.consecutiveDeathTimeout = null;
		}, this.consecutiveDeathMs);

		console.log(`Consecutive death ${this.consecutiveDeaths}/${this.maxConsecutiveDeaths}`);

		return this.consecutiveDeaths <= this.maxConsecutiveDeaths;
	}

	enterPanicMode() {
		let app = express();

		app.use('/', express.static(path.join(__dirname, 'panic-mode')));

		app.listen(1903, function() {
			console.log(`Panic mode static files online`);
		});
	}
}

module.exports = ThreadWatcher;
