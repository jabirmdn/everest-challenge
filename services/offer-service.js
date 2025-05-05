import { readFile } from 'fs/promises';

const offers = [];

function addOffer(offer) {
	offers.push(offer);
}

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

async function loadSampleOffers() {
	const data = await readFile('data/sample-offers.json', 'utf-8');
	const sampleOffers = JSON.parse(data);
	sampleOffers.forEach((offer) => addOffer(offer));
}

function clearOffers() {
	offers.length = 0;
}

export { getOffer, isApplicable, addOffer, loadSampleOffers, clearOffers };
