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
		// Parse base delivery cost and number of packages
		const [cost, count] = line.trim().split(' ').map(Number);
		baseDeliveryCost = cost;
		numberOfPackages = count;
		lineCount++;
	} else {
		if (packagesRead === numberOfPackages) {
			// Calculate discount and delivery cost
			packageService.estimateDeliveryCostAndDiscounts(baseDeliveryCost);

			// Parse vehicle configurations: count speed_in_kmph max_weight_in_kg
			const [count, speed, weight] = line.trim().split(' ').map(Number);

			// Initialize vehicles
			vehicleService.init(count, speed, weight);

			// Calculate and log delivery time, discount and total cost
			packageService.estimateDeliveryTime();

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
