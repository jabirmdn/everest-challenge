import * as packageService from '../services/package-service.js';
import * as offerService from '../services/offer-service.js';

describe('Cost Estimation Tests', () => {
	beforeEach(() => {
		packageService.clearPackages();
		offerService.clearOffers();
	});

	test('should calculate cost for the given sample in the challenge', async () => {
		const baseDeliveryCost = 100;
		await offerService.loadSampleOffers();
		packageService.addPackage({ id: 'PKG1', weight: 5, distance: 5, offerCode: 'OFR001' });
		packageService.addPackage({ id: 'PKG2', weight: 15, distance: 5, offerCode: 'OFR002' });
		packageService.addPackage({ id: 'PKG3', weight: 10, distance: 100, offerCode: 'OFR003' });
		packageService.estimateDeliveryCostAndDiscounts(baseDeliveryCost);
		const packages = packageService.getPackages();
		expect(packages.length).toBe(3);
		expect(packages[0].discount).toBe(0);
		expect(packages[1].discount).toBe(0);
		expect(packages[2].discount).toBe(35);
		expect(packages[0].deliveryCost).toBe(175);
		expect(packages[1].deliveryCost).toBe(275);
		expect(packages[2].deliveryCost).toBe(700);
		expect(packages[0].totalCost).toBe(175);
		expect(packages[1].totalCost).toBe(275);
		expect(packages[2].totalCost).toBe(665);
	});

	test('should apply OFR001 discount correctly', () => {
		const baseDeliveryCost = 100;
		offerService.addOffer({
			code: 'OFR001',
			discount: 10,
			distance: {
				max: 200,
				minInclusive: false,
				maxInclusive: false
			},
			weight: {
				min: 70,
				max: 200,
				minInclusive: true,
				maxInclusive: true
			}
		});
		// OFR001: 10% discount for weight 70-200kg, distance < 200km
		packageService.addPackage({ id: 'PKG1', weight: 80, distance: 100, offerCode: 'OFR001' });
		packageService.estimateDeliveryCostAndDiscounts(baseDeliveryCost);
		const packages = packageService.getPackages();

		// Delivery cost = 100 + 80*10 + 100*5 = 1400
		// Discount = 10% of 1400 = 140
		expect(packages[0].deliveryCost).toBe(1400);
		expect(packages[0].discount).toBe(140);
		expect(packages[0].totalCost).toBe(1260);
	});

	test('should apply OFR002 discount correctly', () => {
		const baseDeliveryCost = 100;
		offerService.addOffer({
			code: 'OFR002',
			discount: 7,
			distance: {
				min: 50,
				max: 150,
				minInclusive: true,
				maxInclusive: true
			},
			weight: {
				min: 100,
				max: 250,
				minInclusive: true,
				maxInclusive: true
			}
		});
		// OFR002: 7% discount for weight 100-250kg, distance 50-150km
		packageService.addPackage({ id: 'PKG1', weight: 110, distance: 60, offerCode: 'OFR002' });
		packageService.estimateDeliveryCostAndDiscounts(baseDeliveryCost);
		const packages = packageService.getPackages();

		// Delivery cost = 100 + 110*10 + 60*5 = 1500
		// Discount = 7% of 1500 = 105
		expect(packages[0].deliveryCost).toBe(1500);
		expect(packages[0].discount).toBe(105);
		expect(packages[0].totalCost).toBe(1395);
	});

	test('should apply OFR003 discount correctly', () => {
		const baseDeliveryCost = 100;
		offerService.addOffer({
			code: 'OFR003',
			discount: 5,
			distance: {
				min: 50,
				max: 250,
				minInclusive: true,
				maxInclusive: true
			},
			weight: {
				min: 10,
				max: 150,
				minInclusive: true,
				maxInclusive: true
			}
		});
		// OFR003: 5% discount for weight 10-150kg, distance 50-250km
		packageService.addPackage({ id: 'PKG1', weight: 15, distance: 120, offerCode: 'OFR003' });
		packageService.estimateDeliveryCostAndDiscounts(baseDeliveryCost);
		const packages = packageService.getPackages();

		// Delivery cost = 100 + 15*10 + 120*5 = 850
		// Discount = 5% of 850 = 42.5 = 42 (floor)
		expect(packages[0].deliveryCost).toBe(850);
		expect(packages[0].discount).toBe(42);
		expect(packages[0].totalCost).toBe(808);
	});

	test('should not apply discount when offer code is NA', () => {
		const baseDeliveryCost = 100;
		packageService.addPackage({ id: 'PKG1', weight: 80, distance: 100, offerCode: 'NA' });
		packageService.estimateDeliveryCostAndDiscounts(baseDeliveryCost);
		const packages = packageService.getPackages();

		// Delivery cost = 100 + 80*10 + 100*5 = 1400
		// No discount
		expect(packages[0].deliveryCost).toBe(1400);
		expect(packages[0].discount).toBe(0);
		expect(packages[0].totalCost).toBe(1400);
	});

	test('should not apply discount when weight is outside range', () => {
		const baseDeliveryCost = 100;
		// OFR001: 10% discount for weight 70-200kg, distance < 200km
		// Weight 50kg is below minimum 70kg for OFR001
		packageService.addPackage({ id: 'PKG1', weight: 50, distance: 100, offerCode: 'OFR001' });
		packageService.estimateDeliveryCostAndDiscounts(baseDeliveryCost);
		const packages = packageService.getPackages();

		// Delivery cost = 100 + 50*10 + 100*5 = 1100
		// No discount as weight is outside range
		expect(packages[0].deliveryCost).toBe(1100);
		expect(packages[0].discount).toBe(0);
		expect(packages[0].totalCost).toBe(1100);
	});

	test('should not apply discount when distance is outside range', () => {
		const baseDeliveryCost = 100;
		// OFR002: 7% discount for weight 100-250kg, distance 50-150km
		// Distance 200km is above maximum 150km for OFR002
		packageService.addPackage({ id: 'PKG1', weight: 120, distance: 200, offerCode: 'OFR002' });
		packageService.estimateDeliveryCostAndDiscounts(baseDeliveryCost);
		const packages = packageService.getPackages();

		// Delivery cost = 100 + 120*10 + 200*5 = 2300
		// No discount as distance is outside range
		expect(packages[0].deliveryCost).toBe(2300);
		expect(packages[0].discount).toBe(0);
		expect(packages[0].totalCost).toBe(2300);
	});

	test('should handle packages with zero weight or distance', () => {
		const baseDeliveryCost = 100;
		packageService.addPackage({ id: 'PKG1', weight: 0, distance: 100, offerCode: 'OFR001' });
		packageService.addPackage({ id: 'PKG2', weight: 50, distance: 0, offerCode: 'OFR002' });
		packageService.estimateDeliveryCostAndDiscounts(baseDeliveryCost);
		const packages = packageService.getPackages();

		// PKG1: Delivery cost = 100 + 0*10 + 100*5 = 600
		// PKG2: Delivery cost = 100 + 50*10 + 0*5 = 600
		expect(packages[0].deliveryCost).toBe(600);
		expect(packages[1].deliveryCost).toBe(600);
		// No discounts should apply as they're outside offer ranges
		expect(packages[0].discount).toBe(0);
		expect(packages[1].discount).toBe(0);
	});

	test('should handle packages with invalid offer codes', () => {
		const baseDeliveryCost = 100;
		packageService.addPackage({ id: 'PKG1', weight: 80, distance: 100, offerCode: 'OFR009' });
		packageService.estimateDeliveryCostAndDiscounts(baseDeliveryCost);
		const packages = packageService.getPackages();

		// Delivery cost = 100 + 80*10 + 100*5 = 1400
		// No discount for invalid offer code
		expect(packages[0].deliveryCost).toBe(1400);
		expect(packages[0].discount).toBe(0);
		expect(packages[0].totalCost).toBe(1400);
	});

	test('should handle edge case with maximum possible values', () => {
		const baseDeliveryCost = 100;
		// Using very large numbers to test edge cases
		packageService.addPackage({ id: 'PKG1', weight: 1000, distance: 1000, offerCode: 'OFR002' });
		packageService.estimateDeliveryCostAndDiscounts(baseDeliveryCost);
		const packages = packageService.getPackages();

		// Delivery cost = 100 + 1000*10 + 1000*5 = 15100
		// No discount as values are outside all offer ranges
		expect(packages[0].deliveryCost).toBe(15100);
		expect(packages[0].discount).toBe(0);
		expect(packages[0].totalCost).toBe(15100);
	});
});
