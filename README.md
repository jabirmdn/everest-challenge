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
├── index.js                # Unified entry point for both cost and time estimation
├── services/               # Core business logic
│   ├── offer-service.js    # Discount offer management
│   ├── package-service.js  # Package management and cost calculation
│   ├── shipment-service.js # Shipment creation and optimization
│   └── vehicle-service.js  # Vehicle configuration and management
├── utils/                  # Utility functions
│   └── input-validator.js  # Input validation functions
└── tests/                  # Test suite
    ├── cost-estimation.test.js
    ├── input-validator.test.js
    ├── shipment-service.test.js
    ├── time-estimation.test.js
    └── vehicle-service.test.js
```

## Usage

The application provides a unified entry point with different modes of operation:

```bash
# For cost estimation only
npm run cost-estimate

# For time estimation
npm run time-estimate

# For both cost and time estimation
npm run delivery-estimate both
```

### Cost Estimation Mode
Calculate delivery costs and applicable discounts for packages:

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

### Time Estimation Mode
Estimate delivery times based on vehicle configuration and package details:

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
The system uses a dynamic programming approach to create optimal shipments that maximize vehicle capacity utilization.

#### Dynamic Programming Approach

The algorithm uses a shipment table (1D array) where each index represents a weight capacity, and the value at that index stores the best shipment configuration possible for that weight.

##### Example: 3 Packages with Weight Limit of 6

Consider these packages:
- Package A: Weight = 2, Delivery Time = 1 hour
- Package B: Weight = 3, Delivery Time = 2 hours
- Package C: Weight = 4, Delivery Time = 1.5 hours

The shipment table would be initialized as follows:

| Weight Capacity | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|----------------|---|---|---|---|---|---|---|
| Initial State  | {} | null | null | null | null | null | null |

Where `{}` represents an empty shipment with count=0, weight=0, deliveryTime=0, packages=[]

After processing Package A (weight=2):

| Weight Capacity | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|----------------|---|---|---|---|---|---|---|
| After Package A | {} | null | {A} | null | null | null | null |

After processing Package B (weight=3):

| Weight Capacity | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|----------------|---|---|---|---|---|---|---|
| After Package B | {} | null | {A} | {B} | null | {A,B} | null |

After processing Package C (weight=4):

| Weight Capacity | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|----------------|---|---|---|---|---|---|---|
| Final State    | {} | null | {A} | {B} | {C} | {A,B} | {A,C} |

The algorithm then selects the optimal shipment by comparing all non-null entries based on:
1. Maximum package count
2. Maximum weight (if counts are equal)
3. Minimum delivery time (if counts and weights are equal)

In this example, both {A,B} and {A,C} have 2 packages, but {A,C} has a higher weight (6 vs 5), so {A,C} would be selected as the optimal shipment.

This approach efficiently handles large numbers of packages and scales well with increasing vehicle capacity.

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

