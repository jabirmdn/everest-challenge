import readline from 'readline';
import * as packageService from '../services/package-service.js';
import { handlePackageConfigInput, handlePackageInput, processInput } from '../utils/input-validator.js';
import { loadSampleOffers } from '../services/offer-service.js';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

let baseDeliveryCost = 0;
let numberOfPackages = 0;
let packagesRead = 0;

let lineCount = 0;

loadSampleOffers();

rl.on('line', (line) => {
	if (lineCount === 0) {
		// Parse base delivery cost and number of packages
		const config = processInput(line, handlePackageConfigInput);
		baseDeliveryCost = config.baseDeliveryCost;
		numberOfPackages = config.numberOfPackages;
		lineCount++;
	} else {
		// Parse package lines: pkg_id pkg_weight_in_kg distance_in_km offer_code
		const pkg = processInput(line, handlePackageInput);
		packageService.addPackage(pkg);
		packagesRead++;

		// If all packages are read, calculate delivery cost and log results
		if (packagesRead === numberOfPackages) {
			packageService.estimateDeliveryCostAndDiscounts(baseDeliveryCost, true);
			rl.close();
		}
	}
});
