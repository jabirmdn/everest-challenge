import { jest } from '@jest/globals';
import {
  validateInput,
  packageConfigInputValidator,
  packageInputValidator,
  vehicleConfigInputValidator
} from '../utils/input-validator.js';

describe('Input Validator', () => {
  // Mock console.error and process.exit for validateInput tests
  let consoleErrorSpy;
  let processExitSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('validateInput', () => {
    test('should process valid input correctly', () => {
      const mockFn = jest.fn(line => `Processed: ${line}`);
      const result = validateInput('test input', mockFn);
      
      expect(mockFn).toHaveBeenCalledWith('test input');
      expect(result).toBe('Processed: test input');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    test('should handle errors and exit process', () => {
      const mockFn = jest.fn(() => {
        throw new Error('Test error');
      });
      
      validateInput('test input', mockFn);
      
      expect(mockFn).toHaveBeenCalledWith('test input');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Test error');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('packageConfigInputValidator', () => {
    test('should parse valid package config correctly', () => {
      const result = packageConfigInputValidator('100 5');
      
      expect(result).toEqual({
        baseDeliveryCost: 100,
        numberOfPackages: 5
      });
    });

    test('should handle decimal base delivery cost', () => {
      const result = packageConfigInputValidator('100.5 5');
      
      expect(result).toEqual({
        baseDeliveryCost: 100.5,
        numberOfPackages: 5
      });
    });

    test('should throw error for incorrect format', () => {
      expect(() => packageConfigInputValidator('100')).toThrow(
        'Error: First line should contain base delivery cost and number of packages separated by space'
      );

      expect(() => packageConfigInputValidator('100 5 extra')).toThrow(
        'Error: First line should contain base delivery cost and number of packages separated by space'
      );
    });

    test('should throw error for non-numeric values', () => {
      expect(() => packageConfigInputValidator('abc 5')).toThrow(
        'Error: Base delivery cost and number of packages must be valid numbers'
      );

      expect(() => packageConfigInputValidator('100 xyz')).toThrow(
        'Error: Base delivery cost and number of packages must be valid numbers'
      );
    });

    test('should throw error for negative values', () => {
      expect(() => packageConfigInputValidator('-100 5')).toThrow(
        'Error: Base delivery cost and number of packages cannot be negative'
      );

      expect(() => packageConfigInputValidator('100 -5')).toThrow(
        'Error: Base delivery cost and number of packages cannot be negative'
      );
    });

    test('should throw error for non-integer package count', () => {
      expect(() => packageConfigInputValidator('100 5.5')).toThrow(
        'Error: Number of packages must be an integer'
      );
    });

    test('should allow zero values', () => {
      const result = packageConfigInputValidator('0 0');
      
      expect(result).toEqual({
        baseDeliveryCost: 0,
        numberOfPackages: 0
      });
    });
  });

  describe('packageInputValidator', () => {
    test('should parse valid package input correctly', () => {
      const result = packageInputValidator('PKG1 5 5 OFR001');
      
      expect(result).toEqual({
        id: 'PKG1',
        weight: 5,
        distance: 5,
        offerCode: 'OFR001'
      });
    });

    test('should handle decimal weight and distance', () => {
      const result = packageInputValidator('PKG1 5.5 10.5 OFR001');
      
      expect(result).toEqual({
        id: 'PKG1',
        weight: 5.5,
        distance: 10.5,
        offerCode: 'OFR001'
      });
    });

    test('should handle NA offer code', () => {
      const result = packageInputValidator('PKG1 5 5 NA');
      
      expect(result).toEqual({
        id: 'PKG1',
        weight: 5,
        distance: 5,
        offerCode: 'NA'
      });
    });

    test('should throw error for incorrect format', () => {
      expect(() => packageInputValidator('PKG1 5 5')).toThrow(
        'Error: Package information should contain ID, weight, distance, and offer code separated by spaces'
      );

      expect(() => packageInputValidator('PKG1 5 5 OFR001 extra')).toThrow(
        'Error: Package information should contain ID, weight, distance, and offer code separated by spaces'
      );
    });

    test('should throw error for non-numeric weight or distance', () => {
      expect(() => packageInputValidator('PKG1 abc 5 OFR001')).toThrow(
        'Error: Package weight and distance must be valid numbers'
      );

      expect(() => packageInputValidator('PKG1 5 xyz OFR001')).toThrow(
        'Error: Package weight and distance must be valid numbers'
      );
    });

    test('should throw error for non-positive weight or distance', () => {
      expect(() => packageInputValidator('PKG1 0 5 OFR001')).toThrow(
        'Error: Package weight and distance must be positive'
      );

      expect(() => packageInputValidator('PKG1 5 0 OFR001')).toThrow(
        'Error: Package weight and distance must be positive'
      );

      expect(() => packageInputValidator('PKG1 -5 5 OFR001')).toThrow(
        'Error: Package weight and distance must be positive'
      );

      expect(() => packageInputValidator('PKG1 5 -5 OFR001')).toThrow(
        'Error: Package weight and distance must be positive'
      );
    });
  });

  describe('vehicleConfigInputValidator', () => {
    test('should parse valid vehicle input correctly', () => {
      const result = vehicleConfigInputValidator('2 70 200');
      
      expect(result).toEqual({
        count: 2,
        speed: 70,
        weight: 200
      });
    });

    test('should handle decimal speed and weight', () => {
      const result = vehicleConfigInputValidator('2 70.5 200.5');
      
      expect(result).toEqual({
        count: 2,
        speed: 70.5,
        weight: 200.5
      });
    });

    test('should throw error for incorrect format', () => {
      expect(() => vehicleConfigInputValidator('2 70')).toThrow(
        'Error: Vehicle configuration should contain count, speed, and max weight separated by spaces'
      );

      expect(() => vehicleConfigInputValidator('2 70 200 extra')).toThrow(
        'Error: Vehicle configuration should contain count, speed, and max weight separated by spaces'
      );
    });

    test('should throw error for non-numeric values', () => {
      expect(() => vehicleConfigInputValidator('abc 70 200')).toThrow(
        'Error: Vehicle count, speed, and max weight must be valid numbers'
      );

      expect(() => vehicleConfigInputValidator('2 abc 200')).toThrow(
        'Error: Vehicle count, speed, and max weight must be valid numbers'
      );

      expect(() => vehicleConfigInputValidator('2 70 abc')).toThrow(
        'Error: Vehicle count, speed, and max weight must be valid numbers'
      );
    });

    test('should throw error for non-positive values', () => {
      expect(() => vehicleConfigInputValidator('0 70 200')).toThrow(
        'Error: Vehicle count, speed, and max weight must be positive'
      );

      expect(() => vehicleConfigInputValidator('2 0 200')).toThrow(
        'Error: Vehicle count, speed, and max weight must be positive'
      );

      expect(() => vehicleConfigInputValidator('2 70 0')).toThrow(
        'Error: Vehicle count, speed, and max weight must be positive'
      );

      expect(() => vehicleConfigInputValidator('-2 70 200')).toThrow(
        'Error: Vehicle count, speed, and max weight must be positive'
      );
    });

    test('should throw error for non-integer count', () => {
      expect(() => vehicleConfigInputValidator('2.5 70 200')).toThrow(
        'Error: Vehicle count must be an integer'
      );
    });

    test('should handle edge case values', () => {
      const result = vehicleConfigInputValidator('1 1 1');
      
      expect(result).toEqual({
        count: 1,
        speed: 1,
        weight: 1
      });
    });
  });
});
