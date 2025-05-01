import * as vehicleService from './vehicle-service.js';

// 1. Should contain max packages
// 2. If multiple shipments are of the same size, choose the heaviest shipment
// 3. If multiple shipments are of the same weight, prefer packages with lesser delivery time
// 4. Total weight of the shipment should not exceed the vehicle's max weight
// Shipment is an object with the following properties:
// - packages: Array of packages
// - weight: Total weight of the shipment
// - deliveryTime: Total delivery time of the shipment

function buildShipment(packages) {
	if (!packages || packages.length === 0) return null;

	const shipments = buildShipmentsOfMaxSize(packages);
	if (shipments.length === 0) return null;

	if (shipments.length === 1) return shipments[0];


	const heaviestShipments = selectHeaviestShipments(shipments);

	// If only one heaviest shipment, return it
	if (heaviestShipments.length === 1) return heaviestShipments[0];

	// 2. From heaviest shipments, select the one with minimum delivery time
	return selectFastestShipment(heaviestShipments);
}

function buildShipmentsOfMaxSize(packages, size = packages.length) {
	const MAX_WEIGHT = vehicleService.config.maxWeight;
	const sortedPackages = [...packages].sort((a, b) => a.weight - b.weight);
	const shipments = [];

	function backtrack(currentPackages, start, currentWeight) {
		if (currentPackages.length === size) {
			const shipment = {
				packages: [...currentPackages],
				weight: currentWeight
			};
			setDeliveryTimeForShipment(shipment);
			shipments.push(shipment);
			return;
		}
		for (let i = start; i < sortedPackages.length; i++) {
			const pkg = sortedPackages[i];
			if (pkg.weight + currentWeight > MAX_WEIGHT) break;
			currentPackages.push(pkg);
			backtrack(currentPackages, i + 1, pkg.weight + currentWeight);
			currentPackages.pop();
		}
	}
	backtrack([], 0, 0);
	if (shipments.length === 0) {
		return buildShipmentsOfMaxSize(packages, size - 1);
	}
	return shipments;
}

function selectHeaviestShipments(shipments) {
	let maxWeight = 0;
	for (const shipment of shipments) {
		if (shipment.weight > maxWeight) {
			maxWeight = shipment.weight;
		}
	}
	
	const heaviestShipments = shipments.filter(shipment => shipment.weight === maxWeight);
	return heaviestShipments;
}

function selectFastestShipment(shipments) {
	let fastestShipment = shipments[0];
	for (let i = 1; i < shipments.length; i++) {
		if (shipments[i].deliveryTime < fastestShipment.deliveryTime) {
			fastestShipment = shipments[i];
		}
	}
	return fastestShipment;
}

function setDeliveryTimeForShipment(shipment) {
	let maxTime = 0;
	for (const pkg of shipment.packages) {
		setDeliveryTimeForPackage(pkg);
		if (pkg.deliveryTime > maxTime) {
			maxTime = pkg.deliveryTime;
		}
	}
	shipment.deliveryTime = maxTime * 2;
}

function setDeliveryTimeForPackage(pkg) {
	pkg.deliveryTime = pkg.distance / vehicleService.config.maxSpeed;
}

function estimateDeliveredAt(shipment, currentTime) {
	shipment.packages.forEach((pkg) => {
		pkg.deliveredAt = parseFloat((pkg.deliveryTime + currentTime).toFixed(2));
	});
}

// [50, 75, 175, 110, 155];

export { buildShipment, estimateDeliveredAt };
