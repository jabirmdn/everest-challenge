# Coding Challenge 1

## Overview
Calculates delivery costs, applies discounts, and estimates delivery times for shipments based on vehicle capacity, speed, and package characteristics.

## Features
- **Cost Estimation**: Calculate delivery costs with applicable discounts based on offer codes
- **Time Estimation**: Estimate delivery times based on distance, vehicle speed, and optimal shipment allocation
- **Shipment Optimization**: Create optimal shipments to maximize vehicle capacity utilization
- **Vehicle Management**: Configure and manage multiple delivery vehicles

## Project Structure
```
├── entry-points/           # Application entry points
│   ├── cost-estimate.js    # Entry point for cost estimation
│   └── time-estimate.js    # Entry point for time estimation
├── services/               # Core business logic
│   ├── offer-service.js    # Discount offer management
│   ├── package-service.js  # Package management and cost calculation
│   ├── shipment-service.js # Shipment creation and optimization
│   └── vehicle-service.js  # Vehicle configuration and management
└── tests/                  # Test suite
    ├── cost-estimation.test.js
    ├── shipment-service.test.js
    ├── time-estimation.test.js
    └── vehicle-service.test.js
```

## Usage

### Cost Estimation
Calculate delivery costs and applicable discounts for packages:

```bash
npm run cost-estimate
```

Input format:
```
<base_delivery_cost> <number_of_packages>
<pkg_id> <pkg_weight_in_kg> <distance_in_km> <offer_code>
...
```

Example:
```
100 3
PKG1 5 5 OFR001
PKG2 15 5 OFR002
PKG3 10 100 OFR003
```

### Time Estimation
Estimate delivery times based on vehicle configuration and package details:

```bash
npm run time-estimate
```

Input format:
```
<base_delivery_cost> <number_of_packages>
<pkg_id> <pkg_weight_in_kg> <distance_in_km> <offer_code>
...
<number_of_vehicles> <max_speed> <max_weight_capacity>
```

Example:
```
100 3
PKG1 50 30 OFR001
PKG2 75 125 OFR002
PKG3 175 100 OFR003
2 70 200
```

## Testing

Run the test suite to verify all functionality:

```bash
npm test
```

## Core Algorithms

### Shipment Optimization
The system uses a backtracking algorithm to create optimal shipments that maximize vehicle capacity utilization. The key functions include:

- `createMaximumCapacityShipments`: Generates all possible shipments with the maximum number of packages that don't exceed the vehicle weight capacity
- `createOptimalShipment`: Selects the optimal shipment based on weight and delivery time
- not ideal for large number of packages(>20). Need to implement a better algorithm

### Delivery Time Estimation
Delivery time is calculated based on:

- Distance to destination
- Vehicle speed
- Vehicle availability
- Package prioritization based on weight and distance

### Cost Calculation
Delivery cost is calculated using:

- Base delivery cost
- Package weight
- Distance to destination
- Applicable discount based on offer codes

