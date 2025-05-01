import readline from 'readline';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

let baseDeliveryCost = 0;
let numberOfPackages = 0;
let packagesRead = 0;

let lineCount = 0;

rl.on('line', (line) => {
	if (lineCount === 0) {
		const [cost, count] = line.trim().split(' ').map(Number);
		baseDeliveryCost = cost;
		numberOfPackages = count;
		lineCount++;
	} else {
		if (packagesRead === numberOfPackages) {
			const [id, weight, distance, offerCode] = line.trim().split(' ');
			packagesRead++;
		}
	}
});
