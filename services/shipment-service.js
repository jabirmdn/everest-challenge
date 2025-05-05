import * as vehicleService from './vehicle-service.js';

/**
 *  1. Should contain max packages
 *  2. If multiple shipments are of the same size, choose the heaviest shipment
 *  3. If multiple shipments are of the same weight, prefer packages with lesser delivery time
 *  4. Total weight of the shipment should not exceed the vehicle's max weight
 */

/**
 *  Shipment is an object with the following properties:
 *  - packages: Array of packages
 *  - weight: Total weight of the shipment
 *  - deliveryTime: Total delivery time of the shipment
 */

function createOptimalShipment(packages) {
	const capacity = vehicleService.getConfig('maxWeight');
	const shipmentTable = Array(capacity + 1).fill(null);
	shipmentTable[0] = {
		count: 0,
		weight: 0,
		deliveryTime: 0,
		packages: []
	};

	for (const pkg of packages) {
		for (let w = capacity - pkg.weight; w >= 0; w--) {
			const current = shipmentTable[w];
			if (!current) continue;

			const newWeight = w + pkg.weight;
			const newCount = current.count + 1;
			const newDeliveryTime = Math.max(current.deliveryTime, 2 * pkg.deliveryTime);
			const newPackages = [...current.packages, pkg];

			const existing = shipmentTable[newWeight];

			if (
				!existing ||
				newCount > existing.count ||
				(newCount === existing.count && newWeight > existing.weight) ||
				(newCount === existing.count && newWeight === existing.weight && newDeliveryTime < existing.deliveryTime)
			) {
				shipmentTable[newWeight] = {
					count: newCount,
					weight: newWeight,
					deliveryTime: newDeliveryTime,
					packages: newPackages
				};
			}
		}
	}

	// Select the optimal shipment across all possible weights
	let optimal = null;
	for (const entry of shipmentTable) {
		if (!entry) continue;
		if (
			!optimal ||
			entry.count > optimal.count ||
			(entry.count === optimal.count && entry.weight > optimal.weight) ||
			(entry.count === optimal.count &&
				entry.weight === optimal.weight &&
				entry.deliveryTime * 2 < optimal.deliveryTime * 2)
		) {
			optimal = entry;
		}
	}

	return optimal && optimal.count > 0 ? optimal : null;
}

function estimateDeliveryAt(shipment, currentTime) {
	shipment.packages.forEach((pkg) => {
		pkg.deliveryAt = parseFloat((pkg.deliveryTime + currentTime).toFixed(2));
	});
}

// [50, 75, 175, 110, 155];

export { estimateDeliveryAt, createOptimalShipment };
