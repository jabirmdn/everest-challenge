const offers = [
  {
    code: 'OFR001',
    discount: 10,
    minDistance: undefined,
    maxDistance:200,
    minWeight: 70,
    maxWeight: 200, 
  },
  {
    code: 'OFR002',
    discount: 7,
    minDistance: 50,
    maxDistance:150,
    minWeight: 100,
    maxWeight: 250, 
  },
  {
    code: 'OFR003',
    discount: 5,
    minDistance: 50,
    maxDistance:250,
    minWeight: 10,
    maxWeight: 150, 
  }
]

function getOffer(code){
  return offers.find((offer) => offer.code === code);
}

function isApplicable(offer, pkg){
  if(offer.minDistance && pkg.distance < offer.minDistance) return false;
  if(offer.maxDistance && pkg.distance > offer.maxDistance) return false;
  if(offer.minWeight && pkg.weight < offer.minWeight) return false;
  if(offer.maxWeight && pkg.weight > offer.maxWeight) return false;
  return true;
}

export { getOffer, isApplicable };