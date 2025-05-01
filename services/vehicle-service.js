const config = {
	numberOfVehicles: 0,
	maxSpeed: 0,
	maxWeight: 0
};

let vehicles = [];

function init(count, speed, weight) {
	config.numberOfVehicles = count;
	config.maxSpeed = speed;
	config.maxWeight = weight;
	Object.freeze(config);
	for (let i = 0; i < count; i++) {
		vehicles.push({
			id: i,
			returningIn: 0,
			outForDelivery: false,
			shipment: null
		});
	}
}

function allocateShipment(shipment, currentTime) {
	const vehicle = getNextAvailableVehicle();
	vehicle.outForDelivery = true;
	vehicle.shipment = shipment;
	vehicle.returningIn = currentTime + shipment.deliveryTime;
}

function getNextAvailableVehicle() {
	return vehicles.find((vehicle) => !vehicle.outForDelivery);
}

function hasAvailableVehicles() {
	return vehicles.some((vehicle) => !vehicle.outForDelivery);
}

function getNextAvailableTime() {
	let lowestReturnTime = vehicles[0]?.returningIn;

	for (const vehicle of vehicles) {
		if (vehicle.returningIn < lowestReturnTime) {
			lowestReturnTime = vehicle.returningIn;
		}
	}
	return lowestReturnTime;
}

function waitForNextAvailability() {
	let nextAvailableTime = getNextAvailableTime();
	vehicles.forEach((vehicle) => {
		if (vehicle.returningIn === nextAvailableTime) {
			vehicle.returningIn = 0;
			vehicle.outForDelivery = false;
		}
	});
	return nextAvailableTime;
}

export { config, init, hasAvailableVehicles, waitForNextAvailability, allocateShipment };
