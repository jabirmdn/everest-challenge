import * as shipmentService from '../services/shipment-service.js';
import * as vehicleService from '../services/vehicle-service.js';

describe('Shipment Service Tests', () => {
	beforeEach(() => {
		// Initialize vehicle service with default values for testing
		vehicleService.init(2, 70, 200);
	});

	describe('optimal shipment creation', () => {
		// test('should return null when no packages are provided', () => {
		// 	const result = shipmentService.createOptimalShipment([]);
		// 	expect(result).toBeNull();
		// });

		// test('should return null when no valid shipments can be created', () => {
		// 	// Set vehicle capacity too low for any package
		// 	vehicleService.init(2, 70, 10);

		// 	const packages = [
		// 		{ id: 'PKG1', weight: 50, distance: 30 },
		// 		{ id: 'PKG2', weight: 75, distance: 125 }
		// 	];

		// 	const result = shipmentService.createOptimalShipment(packages);
		// 	expect(result).toBeNull();
		// });

		// test('should return the only shipment when only one is possible', () => {
		// 	vehicleService.init(2, 70, 200);

		// 	const packages = [
		// 		{ id: 'PKG1', weight: 50, distance: 30 },
		// 		{ id: 'PKG2', weight: 75, distance: 125 }
		// 	];

		// 	const result = shipmentService.createOptimalShipment(packages);

		// 	expect(result).toBeDefined();
		// 	expect(result.packages.length).toBe(2);
		// 	expect(result.weight).toBe(125); // 50 + 75
		// });

		// test('should select the heaviest shipment when multiple shipments are possible', () => {
		// 	vehicleService.init(2, 70, 100);

		// 	const packages = [
		// 		{ id: 'PKG1', weight: 40, distance: 30 },
		// 		{ id: 'PKG2', weight: 60, distance: 125 }, // Heavier package
		// 		{ id: 'PKG3', weight: 30, distance: 100 }
		// 	];

		// 	// Should create multiple shipments: [PKG1+PKG2=100kg] and [PKG2=60kg]
		// 	const result = shipmentService.createOptimalShipment(packages);
		// 	// Should select the heaviest shipment (PKG1+PKG2=100kg)
		// 	expect(result.weight).toBe(100);
		// 	expect(result.packages.length).toBe(2);

		// 	// Verify the shipment contains PKG1 and PKG2
		// 	const packageIds = result.packages.map((pkg) => pkg.id).sort();
		// 	expect(packageIds).toEqual(['PKG1', 'PKG2'].sort());
		// });

		// test('should select the shipment with minimum delivery time when multiple heaviest shipments exist', () => {
		// 	vehicleService.init(2, 10, 100); // Speed 10 km/h for easy calculation

		// 	const packages = [
		// 		{ id: 'PKG1', weight: 50, distance: 50 }, // 5 hours one-way
		// 		{ id: 'PKG2', weight: 50, distance: 20 }, // 2 hours one-way
		// 		{ id: 'PKG3', weight: 50, distance: 30 }, // 3 hours one-way
		// 		{ id: 'PKG4', weight: 50, distance: 10 } // 1 hour one-way
		// 	];

		// 	// With 100kg capacity, we can create several shipments with 2 packages each (all 100kg)
		// 	// PKG1+PKG2, PKG1+PKG3, PKG1+PKG4, PKG2+PKG3, PKG2+PKG4, PKG3+PKG4
		// 	// All have same weight (100kg), so should select the one with minimum delivery time
		// 	// PKG2+PKG4 has shortest max delivery time (2 hours one-way)
		// 	const result = shipmentService.createOptimalShipment(packages);

		// 	expect(result.weight).toBe(100);
		// 	expect(result.packages.length).toBe(2);

		// 	// The fastest shipment should contain PKG2 and PKG4
		// 	const packageIds = result.packages.map((pkg) => pkg.id).sort();
		// 	expect(packageIds).toEqual(['PKG2', 'PKG4'].sort());
		// });

		// test('should handle packages with same weight but different delivery times', () => {
		// 	vehicleService.init(2, 10, 200); // Speed 10 km/h for easy calculation

		// 	const packages = [
		// 		{ id: 'PKG1', weight: 50, distance: 100 }, // 10 hours one-way
		// 		{ id: 'PKG2', weight: 50, distance: 50 }, // 5 hours one-way
		// 		{ id: 'PKG3', weight: 50, distance: 20 } // 2 hours one-way
		// 	];

		// 	const result = shipmentService.createOptimalShipment(packages);

		// 	expect(result.packages.length).toBe(3); // All packages fit within 200kg capacity

		// 	// Delivery time should be based on the package with longest delivery time (PKG1)
		// 	expect(result.deliveryTime).toBe(20); // 10 hours * 2 (round trip)
		// });

		// test('should handle edge case with exact vehicle capacity', () => {
		// 	vehicleService.init(2, 70, 100);

		// 	const packages = [
		// 		{ id: 'PKG1', weight: 100, distance: 30 }, // Exactly matches capacity
		// 		{ id: 'PKG2', weight: 50, distance: 20 },
		// 		{ id: 'PKG3', weight: 50, distance: 10 }
		// 	];

		// 	const result = shipmentService.createOptimalShipment(packages);

		// 	// Should select the heaviest shipment (PKG1=100kg) over PKG2+PKG3 (also 100kg)
		// 	// If both have the same weight, it should select the one with minimum delivery time
		// 	expect(result.weight).toBe(100);
		// });

		test('should handle a large number of packages efficiently', () => {
			// Set vehicle capacity to accommodate multiple packages
			vehicleService.init(2, 70, 500);

			// Create a large array of packages with varying weights and distances
			const packages = [];
			for (let i = 1; i <= 50; i++) {
				packages.push({
					id: `PKG${i}`,
					weight: 20 + (i % 5) * 5, // Weights between 20-40kg
					distance: 10 + i * 5 // Distances between 15-110km
				});
			}

			// Measure execution time
			const startTime = performance.now();
			const result = shipmentService.createOptimalShipment(packages);
			const endTime = performance.now();

			// Verify the result is valid
			expect(result).toBeDefined();
			expect(result.packages.length).toBeGreaterThan(0);

			// Verify all packages in the shipment have delivery times set
			result.packages.forEach(pkg => {
				expect(pkg.deliveryTime).toBeGreaterThan(0);
			});

			// Verify the shipment weight doesn't exceed vehicle capacity
			expect(result.weight).toBeLessThanOrEqual(500);

			// Log performance metrics (optional)
			console.log(`Optimal shipment selection for ${packages.length} packages took ${(endTime - startTime).toFixed(2)}ms`);
			console.log(`Selected ${result.packages.length} packages with total weight ${result.weight}kg`);
		});

	});
});
