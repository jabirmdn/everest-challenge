const packages = [];

function addPackage(pkg) {
	packages.push(pkg);
}

function calculateDeliveryCost() {
	console.log(packages);
}

export { addPackage, calculateDeliveryCost };
