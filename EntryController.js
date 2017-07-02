class EntryController {
	constructor() {
		console.log("I'm going mainstream");

		setTimeout(() => {
			process.exit(1);
		}, 2000);
	}
}

module.exports = new EntryController();
