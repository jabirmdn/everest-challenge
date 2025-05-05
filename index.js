import readline from 'readline';
import * as packageService from './services/package-service.js';
import * as vehicleService from './services/vehicle-service.js';
import { loadSampleOffers } from './services/offer-service.js';
import {
	validateInput,
	packageConfigInputValidator,
	packageInputValidator,
	vehicleConfigInputValidator
} from './utils/input-validator.js';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

let baseDeliveryCost = 0;
let numberOfPackages = 0;
let packagesRead = 0;

let lineCount = 0;

await loadSampleOffers();

const mode = process.argv[2];

rl.on('line', (line) => {
	if (lineCount === 0) {
		// First line, reads base delivery cost and number of packages
		handlePackageConfigInput(line);
		return;
	}
	if (hasReceivedAllPackages() && mode === 'time') {
		// All packages read, handle vehicle config
		handleVehicleConfigInput(line);
		process.exit();
	}

	// Handle each package input
	handlePackageInput(line);

	if (hasReceivedAllPackages()) {
		// Calculate discount and delivery cost
		packageService.estimateDeliveryCostAndDiscounts(baseDeliveryCost, mode === 'cost');

		// If cost mode, no need to calculate delivery time
		if (mode === 'cost') {
			process.exit();
		}
	}
});

function handlePackageConfigInput(line) {
	// Parse base delivery cost and number of packages
	const config = validateInput(line, packageConfigInputValidator);
	baseDeliveryCost = config.baseDeliveryCost;
	numberOfPackages = config.numberOfPackages;
	lineCount++;
}

function handleVehicleConfigInput(line) {
	// Parse vehicle configurations and initialize vehicle configurations
	const vehicleConfig = validateInput(line, vehicleConfigInputValidator);
	vehicleService.init(vehicleConfig.count, vehicleConfig.speed, vehicleConfig.weight);

	// Calculate and log delivery time, discount and total cost
	packageService.setDeliveryTimeForPackages();
	packageService.estimateDeliveryTime();
}

function handlePackageInput(line) {
	const pkg = validateInput(line, packageInputValidator);
	packageService.addPackage(pkg);
	packagesRead++;
}

function hasReceivedAllPackages() {
	return packagesRead === numberOfPackages;
}
