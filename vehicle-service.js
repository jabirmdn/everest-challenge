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

export { init };
