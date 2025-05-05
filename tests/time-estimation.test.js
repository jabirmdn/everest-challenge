import * as packageService from '../services/package-service.js';
import * as vehicleService from '../services/vehicle-service.js';

describe('Time Estimation Tests', () => {
	beforeEach(() => {
		// Re-initialize with default values
		packageService.clearPackages();
	});

	test('should calculate delivery time for the given sample in the challenge', () => {
		vehicleService.init(2, 70, 200);
		packageService.addPackage({ id: 'PKG1', weight: 50, distance: 30, offerCode: 'OFR001' });
		packageService.addPackage({ id: 'PKG2', weight: 75, distance: 125, offerCode: 'OFR0008' });
		packageService.addPackage({ id: 'PKG3', weight: 175, distance: 100, offerCode: 'OFR003' });
		packageService.addPackage({ id: 'PKG4', weight: 110, distance: 60, offerCode: 'OFR002' });
		packageService.addPackage({ id: 'PKG5', weight: 155, distance: 95, offerCode: 'NA' });
		packageService.setDeliveryTimeForPackages();
		packageService.estimateDeliveryTime();
		const estimatedPackages = packageService.getEstimatedPackages();
		estimatedPackages.forEach((pkg) => {
			expect(pkg.deliveryAt).toBeGreaterThan(0);
		});
		expect(estimatedPackages.length).toBe(5);
		expect(estimatedPackages[0].deliveryAt).toBe(4);
		expect(estimatedPackages[1].deliveryAt).toBe(1.79);
		expect(estimatedPackages[2].deliveryAt).toBe(1.43);
		expect(estimatedPackages[3].deliveryAt).toBe(0.86);
		expect(estimatedPackages[4].deliveryAt).toBe(4.21);
	});

	test('should handle no packages scenario', () => {
		vehicleService.init(2, 70, 200);

		packageService.setDeliveryTimeForPackages();
		packageService.estimateDeliveryTime();

		const estimatedPackages = packageService.getEstimatedPackages();
		expect(estimatedPackages.length).toBe(0);
	});

	test('should handle single package delivery', () => {
		vehicleService.init(1, 70, 200);
		packageService.addPackage({ id: 'PKG1', weight: 50, distance: 70, offerCode: 'OFR001' });
		packageService.setDeliveryTimeForPackages();

		packageService.estimateDeliveryTime();

		const estimatedPackages = packageService.getEstimatedPackages();
		expect(estimatedPackages.length).toBe(1);
		expect(estimatedPackages[0].deliveryAt).toBe(1); // 70km / 70km/h = 1 hour
	});

	test('should handle packages exceeding vehicle capacity', () => {
		vehicleService.init(1, 70, 50); // Vehicle can only carry 50kg
		packageService.addPackage({ id: 'PKG1', weight: 60, distance: 30, offerCode: 'OFR001' }); // Too heavy
		packageService.addPackage({ id: 'PKG2', weight: 40, distance: 40, offerCode: 'OFR002' }); // Can be delivered

		packageService.setDeliveryTimeForPackages();
		packageService.estimateDeliveryTime();

		const estimatedPackages = packageService.getEstimatedPackages();
		expect(estimatedPackages.length).toBe(1);
		expect(estimatedPackages[0].id).toBe('PKG2');
		expect(estimatedPackages[0].deliveryAt).toBe(0.57);
	});

	test('should handle multiple vehicles with varying delivery times', () => {
		vehicleService.init(3, 70, 100); // 3 vehicles, each with 100kg capacity
		// Add packages with varying distances
		packageService.addPackage({ id: 'PKG1', weight: 50, distance: 70, offerCode: 'OFR001' });
		packageService.addPackage({ id: 'PKG2', weight: 50, distance: 140, offerCode: 'OFR002' });
		packageService.addPackage({ id: 'PKG3', weight: 50, distance: 210, offerCode: 'OFR003' });

		packageService.setDeliveryTimeForPackages();
		packageService.estimateDeliveryTime();

		const estimatedPackages = packageService.getEstimatedPackages();
		expect(estimatedPackages.length).toBe(3);
		// All packages should be delivered in parallel since we have 3 vehicles
		const pkg1 = estimatedPackages.find((p) => p.id === 'PKG1');
		const pkg2 = estimatedPackages.find((p) => p.id === 'PKG2');
		const pkg3 = estimatedPackages.find((p) => p.id === 'PKG3');
		expect(pkg1.deliveryAt).toBe(1);
		expect(pkg2.deliveryAt).toBe(2);
		expect(pkg3.deliveryAt).toBe(3);
	});

	test('should handle priority based on distance when weights are equal', () => {
		vehicleService.init(1, 70, 100); // 1 vehicle with 100kg capacity
		// Add packages with same weight but different distances
		packageService.addPackage({ id: 'PKG1', weight: 50, distance: 100, offerCode: 'OFR001' });
		packageService.addPackage({ id: 'PKG2', weight: 50, distance: 50, offerCode: 'OFR002' }); // Shorter distance

		packageService.setDeliveryTimeForPackages();
		packageService.estimateDeliveryTime();

		const estimatedPackages = packageService.getEstimatedPackages();
		expect(estimatedPackages.length).toBe(2);
		// Package with shorter distance should be delivered first
		const pkg1 = estimatedPackages.find((p) => p.id === 'PKG1');
		const pkg2 = estimatedPackages.find((p) => p.id === 'PKG2');
		expect(pkg2.deliveryAt).toBeLessThan(pkg1.deliveryAt);
	});

	test('should handle multiple packages with varying weights and distances', () => {
		vehicleService.init(2, 70, 150);
		packageService.addPackage({ id: 'PKG1', weight: 30, distance: 50, offerCode: 'OFR001' });
		packageService.addPackage({ id: 'PKG2', weight: 40, distance: 70, offerCode: 'OFR002' });
		packageService.addPackage({ id: 'PKG3', weight: 50, distance: 90, offerCode: 'OFR003' });
		packageService.addPackage({ id: 'PKG4', weight: 60, distance: 110, offerCode: 'OFR004' });

		packageService.setDeliveryTimeForPackages();
		packageService.estimateDeliveryTime();

		const estimatedPackages = packageService.getEstimatedPackages();
		expect(estimatedPackages.length).toBe(4);
		// Verify all packages have delivery times
		estimatedPackages.forEach((pkg) => {
			expect(pkg.deliveryAt).toBeGreaterThan(0);
		});
	});

	test('should handle packages with extreme distance values', () => {
		vehicleService.init(1, 70, 200);
		packageService.addPackage({ id: 'PKG1', weight: 50, distance: 700, offerCode: 'OFR001' }); // 10 hours delivery time

		packageService.setDeliveryTimeForPackages();
		packageService.estimateDeliveryTime();

		const estimatedPackages = packageService.getEstimatedPackages();
		expect(estimatedPackages.length).toBe(1);
		expect(estimatedPackages[0].deliveryAt).toBe(10); // 700km / 70km/h = 10 hours
	});

	test('should handle packages with same delivery time but different weights', () => {
		vehicleService.init(2, 70, 200);
		packageService.addPackage({ id: 'PKG1', weight: 100, distance: 70, offerCode: 'OFR001' }); // 1 hour delivery time
		packageService.addPackage({ id: 'PKG2', weight: 50, distance: 70, offerCode: 'OFR002' }); // 1 hour delivery time

		packageService.setDeliveryTimeForPackages();
		packageService.estimateDeliveryTime();

		const estimatedPackages = packageService.getEstimatedPackages();
		expect(estimatedPackages.length).toBe(2);
		// Both packages should have the same delivery time
		const pkg1 = estimatedPackages.find((p) => p.id === 'PKG1');
		const pkg2 = estimatedPackages.find((p) => p.id === 'PKG2');
		expect(pkg1.deliveryAt).toBe(1);
		expect(pkg2.deliveryAt).toBe(1);
	});

	test('should handle maximum vehicle capacity with exact weight packages', () => {
		vehicleService.init(1, 70, 100); // 1 vehicle with exactly 100kg capacity
		packageService.addPackage({ id: 'PKG1', weight: 100, distance: 70, offerCode: 'OFR001' }); // Exactly matches capacity
		packageService.addPackage({ id: 'PKG2', weight: 50, distance: 70, offerCode: 'OFR002' }); // For second trip
		packageService.setDeliveryTimeForPackages();
		packageService.estimateDeliveryTime();

		const estimatedPackages = packageService.getEstimatedPackages();
		expect(estimatedPackages.length).toBe(2);
		// First package should be delivered at time = 1 hour
		// Second package should be delivered after vehicle returns (2 hours) + delivery time (1 hour) = 3 hours
		const pkg1 = estimatedPackages.find((p) => p.id === 'PKG1');
		const pkg2 = estimatedPackages.find((p) => p.id === 'PKG2');
		expect(pkg1.deliveryAt).toBe(1);
		expect(pkg2.deliveryAt).toBe(3);
	});

	test('should handle complex scenario with multiple vehicles and varied packages', () => {
		vehicleService.init(3, 100, 100); // 3 vehicles, 100 km/h, 100kg capacity
		// Add a mix of packages with different characteristics
		packageService.addPackage({ id: 'PKG1', weight: 50, distance: 100, offerCode: 'OFR001' }); // 1 hour delivery
		packageService.addPackage({ id: 'PKG2', weight: 50, distance: 200, offerCode: 'OFR002' }); // 2 hours delivery
		packageService.addPackage({ id: 'PKG3', weight: 100, distance: 300, offerCode: 'OFR003' }); // 3 hours delivery
		packageService.addPackage({ id: 'PKG4', weight: 100, distance: 400, offerCode: 'OFR004' }); // 4 hours delivery
		packageService.addPackage({ id: 'PKG5', weight: 50, distance: 500, offerCode: 'OFR005' }); // 5 hours delivery

		packageService.setDeliveryTimeForPackages();
		packageService.estimateDeliveryTime();

		const estimatedPackages = packageService.getEstimatedPackages();
		expect(estimatedPackages.length).toBe(5);

		// With 3 vehicles, first 3 packages should be delivered in parallel
		// Then the remaining 2 packages after vehicles return
		const deliveryTimes = estimatedPackages.map((pkg) => pkg.deliveryAt).sort((a, b) => a - b);

		// Verify we have the expected delivery times (not necessarily in order)
		expect(deliveryTimes.length).toBe(5);
		expect(deliveryTimes).toContain(1); // First vehicle with PKG1
		expect(deliveryTimes).toContain(2); // Second vehicle with PKG2
		expect(deliveryTimes).toContain(3); // Third vehicle with PKG3
	});

	test('should handle packages where each package weigh more than vehicle capacity', () => {
		vehicleService.init(2, 70, 150); // Vehicle can only carry 50kg
		packageService.addPackage({ id: 'PKG1', weight: 200, distance: 30, offerCode: 'OFR001' }); // Too heavy
		packageService.addPackage({ id: 'PKG2', weight: 420, distance: 40, offerCode: 'OFR002' }); // Can be delivered

		packageService.setDeliveryTimeForPackages();
		packageService.estimateDeliveryTime();

		const estimatedPackages = packageService.getEstimatedPackages();
		expect(estimatedPackages.length).toBe(0);
	});
});
