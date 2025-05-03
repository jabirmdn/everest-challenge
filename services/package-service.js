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
		handleEstimationCompleted();
		return;
	}

	// if all vehicles are out for delivery, wait for atleast one to return
	if (!vehicleService.hasAvailableVehicles()) {
		handleNoVehicleAvailability();
		return;
	}

	// Build a shipment based on the rules
	const shipment = shipmentService.createOptimalShipment(packagesRemaining);

	if (!shipment) {
		handleNoValidShipments(packagesRemaining);
		return;
	}

	// Estimate delivery time for the shipment
	shipmentService.estimateDeliveryAt(shipment, currentTime);

	// Find available vehicle and allocate shipment
	const allocated = handleShipmentAllocation(shipment, currentTime);

	// Recursively calculate delivery time for the remaining packages
	if (allocated) {
		estimateDeliveryTime(currentTime);
	}
}

function handleEstimationCompleted() {
	packages.forEach(logDeliveryTimeEstimation);
}

function handleShipmentAllocation(shipment, currentTime) {
	try {
		vehicleService.allocateShipment(shipment, currentTime);
		return true;
	} catch (error) {
		console.error(`Error allocating shipment: ${error.message}`);
		// Mark packages in this shipment as failed
		shipment.packages.forEach((pkg) => {
			delete pkg.deliveryAt; // Remove any partial delivery time calculation
			logDeliveryTimeEstimationFailed(pkg);
		});
		return false;
	}
}

function handleNoValidShipments(packagesRemaining) {
	getEstimatedPackages().forEach(logDeliveryTimeEstimation);
	packagesRemaining.forEach(logDeliveryTimeEstimationFailed);
}

function handleNoVehicleAvailability() {
	const nextAvailableTime = vehicleService.waitForNextAvailability();
	estimateDeliveryTime(nextAvailableTime);
}

function getRemainingPackages() {
	return packages.filter((pkg) => !pkg.deliveryAt);
}

function getEstimatedPackages() {
	return packages.filter((pkg) => pkg.deliveryAt);
}

function logDeliveryTimeEstimation(pkg) {
	console.log(`${pkg.id} ${pkg.discount} ${pkg.totalCost} ${pkg.deliveryAt}`);
}

function logDeliveryTimeEstimationFailed(pkg) {
	console.log(
		`${pkg.id} ${pkg.discount} ${pkg.totalCost} Could not be estimated because of invalid shipments`
	);
}

function logDeliveryCostEstimation(pkg) {
	console.log(`${pkg.id} ${pkg.discount} ${pkg.totalCost}`);
}

export {
	addPackage,
	estimateDeliveryCostAndDiscounts,
	estimateDeliveryTime,
	clearPackages,
	getPackages,
	getEstimatedPackages
};
