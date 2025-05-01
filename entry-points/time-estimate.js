import readline from 'readline';
import * as packageService from '../services/package-service.js';
import * as vehicleService from '../services/vehicle-service.js';

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
			const results = packageService.calculateDeliveryCost(baseDeliveryCost);
			const [count, speed, weight] = line.trim().split(' ').map(Number);

			// Initialize vehicles
			vehicleService.init(count, speed, weight);

			packageService.calculateDeliveryTime();

			// Log output
			results.forEach((result) => {
				console.log(`${result.id} ${result.discount} ${result.totalCost} ${result.deliveryTime}`);
			});
			rl.close();
		}
		// Parse package lines: pkg_id pkg_weight_in_kg distance_in_km offer_code
		const [id, weight, distance, offerCode] = line.trim().split(' ');

		packageService.addPackage({
			id,
			weight: Number(weight),
			distance: Number(distance),
			offerCode
		});

		packagesRead++;
	}
});
