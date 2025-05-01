import * as offerService from './offer-service.js';
import * as shipmentService from './shipment-service.js';
import * as vehicleService from './vehicle-service.js';

const packages = [];

function addPackage(pkg) {
	packages.push(pkg);
}

function calculateDeliveryCost(baseDeliveryCost) {
	for (const pkg of packages) {
		//Delivery cost formula: base_delivery_cost + (package_weight * 10) + (distance * 5)
		const deliveryCost = baseDeliveryCost + pkg.weight * 10 + pkg.distance * 5;

		// Check if offer is applicable
		let discount = 0;
		const offer = offerService.getOffer(pkg.offerCode);

		if (offer && offerService.isApplicable(offer, pkg)) {
			discount = Math.floor(deliveryCost * (offer.discount / 100));
		}
		pkg.discount = discount;
		pkg.deliveryCost = deliveryCost;
		pkg.totalCost = deliveryCost - discount;
	}
	return packages;
}

function calculateDeliveryTime(currentTime = 0) {
	const packagesRemaining = getRemainingPackages();

	// No packages remaining to be estimated
	if (packagesRemaining.length === 0) return;

	// if all vehicles are out for delivery, wait for atleast one to return
	if (!vehicleService.hasAvailableVehicles()) {
		const nextAvailableTime = vehicleService.waitForNextAvailability();
		return calculateDeliveryTime(nextAvailableTime);
	}

	// Build a shipment based on the rules
	const shipment = shipmentService.createOptimalShipment(packagesRemaining);
	if (!shipment) {
		return `The following packages were not delivered: ${JSON.stringify(packagesRemaining)}`;
	}
	shipmentService.estimateDeliveredAt(shipment, currentTime);
	vehicleService.allocateShipment(shipment, currentTime);
	return calculateDeliveryTime(currentTime);
}

function getRemainingPackages() {
	return packages.filter((pkg) => !pkg.deliveredAt);
}

export { addPackage, calculateDeliveryCost, calculateDeliveryTime };
