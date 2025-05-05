import readline from 'readline';
import * as packageService from '../services/package-service.js';
import * as vehicleService from '../services/vehicle-service.js';
import {
	processInput,
	handlePackageConfigInput,
	handlePackageInput,
	handleVehicleInput
} from '../utils/input-validator.js';

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
		const config = processInput(line, handlePackageConfigInput);
		baseDeliveryCost = config.baseDeliveryCost;
		numberOfPackages = config.numberOfPackages;
		lineCount++;
	} else {
		if (packagesRead === numberOfPackages) {
			// Calculate discount and delivery cost
			packageService.estimateDeliveryCostAndDiscounts(baseDeliveryCost);

			// Parse vehicle configurations and initialize vehicle configurations
			const vehicleConfig = processInput(line, handleVehicleInput);
			vehicleService.init(vehicleConfig.count, vehicleConfig.speed, vehicleConfig.weight);

			// Calculate and log delivery time, discount and total cost
			packageService.estimateDeliveryTime();
			process.exit();
		}
		const pkg = processInput(line, handlePackageInput);
		packageService.addPackage(pkg);
		packagesRead++;
	}
});
