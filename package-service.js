import * as offerService from './offer-service.js';

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

function calculateDeliveryTime() {}

export { addPackage, calculateDeliveryCost, calculateDeliveryTime };
