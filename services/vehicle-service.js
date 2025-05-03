const config = {
	numberOfVehicles: 0,
	maxSpeed: 0,
	maxWeight: 0
};

let vehicles = [];

function init(count, speed, weight) {
	if (count <= 0) {
		throw new Error('Count must be greater than 0');
	}
	if (speed <= 0) {
		throw new Error('Speed must be greater than 0');
	}
	if (weight <= 0) {
		throw new Error('Weight must be greater than 0');
	}
	config.numberOfVehicles = count;
	config.maxSpeed = speed;
	config.maxWeight = weight;
	// Object.freeze(config);
	vehicles.length = 0;
	for (let i = 0; i < count; i++) {
		vehicles.push({
			id: i,
			returningIn: 0,
			outForDelivery: false,
			shipment: null
		});
	}
}

function allocateShipment(shipment, currentTime = 0) {
	if (shipment.weight > config.maxWeight) {
		throw new Error('Shipment weight exceeds vehicle capacity');
	}

	const vehicle = getNextAvailableVehicle();
	if (!vehicle) {
		throw new Error('No vehicles available');
	}

	vehicle.outForDelivery = true;
	vehicle.shipment = shipment;
	vehicle.returningIn = currentTime + shipment.deliveryTime;
	return vehicle;
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
			vehicle.shipment = null;
		}
	});
	return nextAvailableTime;
}

function getVehicles() {
	return vehicles;
}

function getConfig(key) {
	return config[key];
}

export {
	getConfig,
	init,
	hasAvailableVehicles,
	waitForNextAvailability,
	allocateShipment,
	getVehicles,
	getNextAvailableVehicle
};
