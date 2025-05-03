import * as vehicleService from '../services/vehicle-service.js';

describe('Vehicle Service Tests', () => {
	test('should handle zero and negative speed vehicle (edge case)', () => {
		expect(() => vehicleService.init(1, 0, 200)).toThrow('Speed must be greater than 0');
		expect(() => vehicleService.init(1, -1, 200)).toThrow('Speed must be greater than 0');
	});
	test('should handle zero and negative weight vehicle (edge case)', () => {
		expect(() => vehicleService.init(1, 70, 0)).toThrow('Weight must be greater than 0');
		expect(() => vehicleService.init(1, 70, -1)).toThrow('Weight must be greater than 0');
	});
	test('should handle zero and negative vehicle count (edge case)', () => {
		expect(() => vehicleService.init(0, 70, 200)).toThrow('Count must be greater than 0');
		expect(() => vehicleService.init(-1, 70, 200)).toThrow('Count must be greater than 0');
	});
	
	beforeEach(() => {
		// Re-initialize with default values
		vehicleService.init(2, 70, 200);
	});

	test('should initialize vehicles correctly', () => {
		const vehicles = vehicleService.getVehicles();

		expect(vehicles).toHaveLength(2);
		expect(vehicles[0].returningIn).toBe(0);
		expect(vehicles[0].outForDelivery).toBe(false);
	});

	test('should allocate shipment to available vehicle', () => {
		const shipment = {
			packages: [{ id: 'PKG1', weight: 50, distance: 100 }],
			weight: 50,
			deliveryTime: 2
		};

		const vehicle = vehicleService.allocateShipment(shipment);

		expect(vehicle).toBeDefined();
		expect(vehicle.outForDelivery).toBe(true);
		expect(vehicle.shipment).toBe(shipment);
		expect(vehicle.returningIn).toBe(2);
	});

	test('should handle no available vehicles', () => {
		const shipment1 = {
			packages: [{ id: 'PKG1', weight: 50, distance: 100 }],
			weight: 50,
			deliveryTime: 0
		};
		const shipment2 = {
			packages: [{ id: 'PKG2', weight: 50, distance: 100 }],
			weight: 50,
			deliveryTime: 0
		};
		vehicleService.allocateShipment(shipment1);
		vehicleService.allocateShipment(shipment2);

		const shipment3 = {
			packages: [{ id: 'PKG3', weight: 50, distance: 100 }],
			weight: 50,
			deliveryTime: 0
		};

		expect(() => vehicleService.allocateShipment(shipment3)).toThrow('No vehicles available');
	});

	test('should handle weight exceeding vehicle capacity', () => {
		const shipment = {
			packages: [{ id: 'PKG1', weight: 250, distance: 100 }],
			weight: 250, // Exceeds max weight of 200
			deliveryTime: 0
		};

		expect(() => vehicleService.allocateShipment(shipment)).toThrow('Shipment weight exceeds vehicle capacity');
	});

	test('should update vehicle availability after simulating wait time', () => {
		const shipment = {
			packages: [{ id: 'PKG1', weight: 50, distance: 70 }],
			weight: 50,
			deliveryTime: 2
		};
		vehicleService.allocateShipment(shipment);

		vehicleService.waitForNextAvailability();
		const vehicle = vehicleService.getNextAvailableVehicle();

		expect(vehicle.returningIn).toBe(0);
		expect(vehicle.outForDelivery).toBe(false);
		expect(vehicle.shipment).toBeNull();
	});
});
