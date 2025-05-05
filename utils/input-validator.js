function processInput(line, fn) {
	try {
		return fn(line);
	} catch (error) {
		console.error(error.message);
		process.exit(1);
	}
}

function handleVehicleInput(line) {
	const parts = line.trim().split(' ');

	// Validate input format
	if (parts.length !== 3) {
		throw new Error(
			'Error: Vehicle configuration should contain count, speed, and max weight separated by spaces'
		);
	}

	const [count, speed, weight] = parts.map(Number);

	// Validate numeric values
	if (isNaN(count) || isNaN(speed) || isNaN(weight)) {
		throw new Error('Error: Vehicle count, speed, and max weight must be valid numbers');
	}

	// Validate positive values
	if (count <= 0 || speed <= 0 || weight <= 0) {
		throw new Error('Error: Vehicle count, speed, and max weight must be positive');
	}

	// Validate count is an integer
	if (!Number.isInteger(count)) {
		throw new Error('Error: Vehicle count must be an integer');
	}

	// Return validated configuration instead of initializing vehicles
	return { count, speed, weight };
}

function handlePackageInput(line) {
	// Parse package lines: pkg_id pkg_weight_in_kg distance_in_km offer_code
	const parts = line.trim().split(' ');

	// Validate input format
	if (parts.length !== 4) {
		throw new Error(
			`Error: Package information should contain ID, weight, distance, and offer code separated by spaces (line: ${line})`
		);
	}

	const [id, weight, distance, offerCode] = parts;
	const weightNum = Number(weight);
	const distanceNum = Number(distance);

	// Validate package ID format
	if (!id || !id.trim()) {
		throw new Error('Error: Package ID cannot be empty');
	}

	// Validate numeric values
	if (isNaN(weightNum) || isNaN(distanceNum)) {
		throw new Error(`Error: Package weight and distance must be valid numbers (line: ${line})`);
	}

	// Validate positive values
	if (weightNum <= 0 || distanceNum <= 0) {
		throw new Error('Error: Package weight and distance must be positive');
	}

	return {
		id,
		weight: weightNum,
		distance: distanceNum,
		offerCode
	};
}

function handlePackageConfigInput(line) {
	const parts = line.trim().split(' ');

	// Validate input format
	if (parts.length !== 2) {
		throw new Error(
			'Error: First line should contain base delivery cost and number of packages separated by space'
		);
	}

	const [cost, count] = parts.map(Number);

	// Validate numeric values
	if (isNaN(cost) || isNaN(count)) {
		throw new Error('Error: Base delivery cost and number of packages must be valid numbers');
	}

	// Validate positive values
	if (cost < 0 || count < 0) {
		throw new Error('Error: Base delivery cost and number of packages cannot be negative');
	}

	// Validate package count is an integer
	if (!Number.isInteger(count)) {
		throw new Error('Error: Number of packages must be an integer');
	}

	return {
		baseDeliveryCost: cost,
		numberOfPackages: count
	};
}

export { processInput, handlePackageConfigInput, handlePackageInput, handleVehicleInput };
