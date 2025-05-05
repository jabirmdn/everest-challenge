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
	// console.log('HEAVIEST', heaviestShipments[0]);
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
function createMaximumCapacityShipments(packages) {
	// Handle empty packages array
	if (!packages || packages.length === 0) {
		return [];
	}

	const maxVehicleCapacity = vehicleService.getConfig('maxWeight');
	// Sort packages by weight in ascending order for efficient packing
	const weightSortedPackages = [...packages].sort((a, b) => a.weight - b.weight);

	// Get the maximum number of packages that can fit in a shipment
	const targetShipmentSize = getTargetShipmentSize(weightSortedPackages, maxVehicleCapacity);

	// If no packages can fit within capacity, return empty array
	if (targetShipmentSize === 0) {
		return [];
	}

	const possibleShipments = [];

	const cache = {};

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
			const cacheKey = `${candidatePackages.map((pkg) => pkg.id).join('-')}-${i + 1}-${newTotalWeight}`;
			if (!cache[cacheKey]) {
				cache[cacheKey] = true;
				findValidShipments(candidatePackages, i + 1, newTotalWeight);
			}
			// Backtrack: remove the package to try other combinations
			candidatePackages.pop();
		}
	}

	// Start the recursive process with empty shipment
	findValidShipments([], 0, 0);

	// If no valid shipments found with current size, try with smaller size
	// if (possibleShipments.length === 0 && targetShipmentSize > 1) {
	// 	return createMaximumCapacityShipments(packages, targetShipmentSize - 1);
	// }
	// console.log(possibleShipments);
	return possibleShipments;
}

/**
 * Calculates the maximum number of packages that can fit within the vehicle capacity
 * @param {Array} weightSortedPackages - Array of packages sorted by weight in ascending order
 * @param {Number} maxVehicleCapacity - Maximum weight capacity of the vehicle
 * @returns {Number} The maximum number of packages that can fit
 */
function getTargetShipmentSize(weightSortedPackages, maxVehicleCapacity) {
	// Handle empty packages array
	if (!weightSortedPackages || weightSortedPackages.length === 0) {
		return 0;
	}

	// Check if even the lightest package exceeds capacity
	if (weightSortedPackages[0].weight > maxVehicleCapacity) {
		return 0;
	}

	// If only one package, and it fits, return 1
	if (weightSortedPackages.length === 1) {
		return 1;
	}

	// Start with the lightest package
	let sum = weightSortedPackages[0].weight;
	let count = 1;

	// Keep adding packages until we exceed capacity or run out of packages
	for (let i = 1; i < weightSortedPackages.length; i++) {
		const nextPackage = weightSortedPackages[i];
		const newSum = sum + nextPackage.weight;

		// If adding this package would exceed capacity, stop here
		if (newSum > maxVehicleCapacity) {
			break;
		}

		// Otherwise, add it to our count and continue
		sum = newSum;
		count++;
	}

	return count;
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
	pkg.deliveryTime = pkg.distance / vehicleService.getConfig('maxSpeed');
}

function estimateDeliveryAt(shipment, currentTime) {
	shipment.packages.forEach((pkg) => {
		pkg.deliveryAt = parseFloat((pkg.deliveryTime + currentTime).toFixed(2));
	});
}

// [50, 75, 175, 110, 155];

export { createOptimalShipment, estimateDeliveryAt };

/** 
100 5
PKG1 50 30 OFR001
PKG2 75 125 OFFR0008
PKG3 175 100 OFFR003
PKG4 110 60 OFFR002
PKG5 155 95 NA
2 70 200
*/
