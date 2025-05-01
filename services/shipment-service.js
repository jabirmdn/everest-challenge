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
	if (!packages || packages.length === 0) return null;

	const shipments = createMaximumCapacityShipments(packages);
	if (shipments.length === 0) return null;

	if (shipments.length === 1) return shipments[0];

	const heaviestShipments = selectHeaviestShipments(shipments);

	// If only one heaviest shipment, return it
	if (heaviestShipments.length === 1) return heaviestShipments[0];

	// 2. From heaviest shipments, select the one with minimum delivery time
	return selectShipmentWithMinDeliveryTime(heaviestShipments);
}

/**
 * Generates all possible shipments with the maximum number of packages
 * that don't exceed the vehicle weight capacity
 *
 * @param {Package[]} packages - Available packages to allocate
 * @param {number} targetShipmentSize - Target number of packages per shipment
 * @returns {Shipment[]} Array of valid shipments
 */
function createMaximumCapacityShipments(packages, targetShipmentSize = packages.length) {
	const maxVehicleCapacity = vehicleService.config.maxWeight;
	// Sort packages by weight in ascending order for efficient packing
	const weightSortedPackages = [...packages].sort((a, b) => a.weight - b.weight);
	const possibleShipments = [];

	/**
	 * Recursively find all valid shipment combinations using backtracking
	 * @param {Array} candidatePackages - Current packages being considered for the shipment
	 * @param {Number} startIndex - Index to start considering packages from
	 * @param {Number} totalWeight - Current accumulated weight of the shipment
	 */
	function findValidShipments(candidatePackages, startIndex, totalWeight) {
		// Base case: we've reached our target shipment size
		if (candidatePackages.length === targetShipmentSize) {
			const validShipment = {
				packages: [...candidatePackages],
				weight: totalWeight
			};
			setDeliveryTimeForShipment(validShipment);
			possibleShipments.push(validShipment);
			return;
		}

		// Try adding each remaining package to our shipment
		for (let i = startIndex; i < weightSortedPackages.length; i++) {
			const packageToAdd = weightSortedPackages[i];
			const newTotalWeight = totalWeight + packageToAdd.weight;

			// Skip if adding this package would exceed vehicle capacity
			if (newTotalWeight > maxVehicleCapacity) break;

			// Add package to shipment and continue recursion
			candidatePackages.push(packageToAdd);
			findValidShipments(candidatePackages, i + 1, newTotalWeight);

			// Backtrack: remove the package to try other combinations
			candidatePackages.pop();
		}
	}

	// Start the recursive process with empty shipment
	findValidShipments([], 0, 0);

	// If no valid shipments found with current size, try with smaller size
	if (possibleShipments.length === 0 && targetShipmentSize > 1) {
		return createMaximumCapacityShipments(packages, targetShipmentSize - 1);
	}

	return possibleShipments;
}

function selectHeaviestShipments(shipments) {
	let maxWeight = 0;
	for (const shipment of shipments) {
		if (shipment.weight > maxWeight) {
			maxWeight = shipment.weight;
		}
	}

	const heaviestShipments = shipments.filter((shipment) => shipment.weight === maxWeight);
	return heaviestShipments;
}

function selectShipmentWithMinDeliveryTime(shipments) {
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

export { createOptimalShipment, estimateDeliveredAt };
