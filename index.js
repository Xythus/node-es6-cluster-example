let ThreadWatcher = require('./src/ThreadWatcher'),
	threadWatcher = new ThreadWatcher();

threadWatcher.forkWorker();
