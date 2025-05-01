const offers = [
	{
		code: 'OFR001',
		discount: 10,
		distance: { min: undefined, max: 200, minInclusive: false, maxInclusive: false },
		weight: { min: 70, max: 200, minInclusive: true, maxInclusive: true }
	},
	{
		code: 'OFR002',
		discount: 7,
		distance: { min: 50, max: 150, minInclusive: true, maxInclusive: true },
		weight: { min: 100, max: 250, minInclusive: true, maxInclusive: true }
	},
	{
		code: 'OFR003',
		discount: 5,
		distance: { min: 50, max: 250, minInclusive: true, maxInclusive: true },
		weight: { min: 10, max: 150, minInclusive: true, maxInclusive: true }
	}
];

function getOffer(code) {
	return offers.find((offer) => offer.code === code);
}

function isInRange(range, value) {
	const minCheck = range.min === undefined || (range.minInclusive ? value >= range.min : value > range.min);

	const maxCheck = range.max === undefined || (range.maxInclusive ? value <= range.max : value < range.max);

	return minCheck && maxCheck;
}

function isApplicable(offer, pkg) {
	return isInRange(offer.distance, pkg.distance) && isInRange(offer.weight, pkg.weight);
}

export { getOffer, isApplicable };
