import * as offerService from './offer-service.js';
import * as shipmentService from './shipment-service.js';
import * as vehicleService from './vehicle-service.js';

const packages = [];

function addPackage(pkg) {
	packages.push(pkg);
}

function clearPackages() {
	packages.length = 0;
}

function getPackages() {
	return packages;
}

function estimateDeliveryCostAndDiscounts(baseDeliveryCost, log = false) {
	packages.forEach((pkg) => {
		const deliveryCost = calculateDeliveryCost(pkg, baseDeliveryCost);
		const discount = calculateDiscount(pkg, deliveryCost);
		updatePackageCostInfo(pkg, deliveryCost, discount);
	});

	if (log) {
		packages.forEach(logDeliveryCostEstimation);
	}
}

function calculateDeliveryCost(pkg, baseDeliveryCost) {
	return baseDeliveryCost + pkg.weight * 10 + pkg.distance * 5;
}

function calculateDiscount(pkg, deliveryCost) {
	if (!pkg.offerCode || pkg.offerCode === 'NA') {
		return 0;
	}

	const offer = offerService.getOffer(pkg.offerCode);

	if (offer && offerService.isApplicable(offer, pkg)) {
		return Math.floor(deliveryCost * (offer.discount / 100));
	}

	return 0;
}

function updatePackageCostInfo(pkg, deliveryCost, discount) {
	pkg.discount = discount;
	pkg.deliveryCost = deliveryCost;
	pkg.totalCost = deliveryCost - discount;
}

function estimateDeliveryTime(currentTime = 0) {
	const packagesRemaining = getRemainingPackages();

	// No packages remaining to be estimated
	if (packagesRemaining.length === 0) {
		packages.forEach(logDeliveryTimeEstimation);
		return;
	}

	// if all vehicles are out for delivery, wait for atleast one to return
	if (!vehicleService.hasAvailableVehicles()) {
		const nextAvailableTime = vehicleService.waitForNextAvailability();
		estimateDeliveryTime(nextAvailableTime);
		return;
	}

	// Build a shipment based on the rules
	const shipment = shipmentService.createOptimalShipment(packagesRemaining);

	// No valid shipment could be created
	if (!shipment) {
		getDeliveredPackages().forEach(logDeliveryTimeEstimation);
		packagesRemaining.forEach(logDeliveryTimeEstimationFailed);
		return;
	}

	// Estimate delivery time for the shipment
	shipmentService.estimateDeliveredAt(shipment, currentTime);

	// Find available vehicle and allocate shipment
	vehicleService.allocateShipment(shipment, currentTime);

	// Recursively calculate delivery time for the remaining packages
	estimateDeliveryTime(currentTime);
}

function getRemainingPackages() {
	return packages.filter((pkg) => !pkg.deliveredAt);
}

function getDeliveredPackages() {
	return packages.filter((pkg) => pkg.deliveredAt);
}

function logDeliveryTimeEstimation(pkg) {
	console.log(`${pkg.id} ${pkg.discount} ${pkg.totalCost} ${pkg.deliveredAt}`);
}

function logDeliveryTimeEstimationFailed(pkg) {
	console.log(
		`${pkg.id} ${pkg.discount} ${pkg.totalCost} Could not be estimated because of invalid shipments`
	);
}

function logDeliveryCostEstimation(pkg) {
	console.log(`${pkg.id} ${pkg.discount} ${pkg.totalCost}`);
}

export { addPackage, estimateDeliveryCostAndDiscounts, estimateDeliveryTime, clearPackages, getPackages };
