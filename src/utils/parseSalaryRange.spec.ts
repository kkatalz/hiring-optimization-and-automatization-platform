import { expect } from 'chai';
import { parseSalaryRange } from './parseSalaryRange';

describe('parseSalaryRange', () => {
  it('should return null for undefined input', () => {
    expect(parseSalaryRange(undefined)).to.be.null;
  });

  it('should return null for empty string', () => {
    expect(parseSalaryRange('')).to.be.null;
  });

  it('should return null for non-numeric string', () => {
    expect(parseSalaryRange('competitive')).to.be.null;
  });

  it('should parse a single number', () => {
    const result = parseSalaryRange('5000');
    expect(result).to.deep.equal({ min: 5000, max: 5000 });
  });

  it('should parse a range like "1000-1100 USD"', () => {
    const result = parseSalaryRange('1000-1100 USD');
    expect(result).to.deep.equal({ min: 1000, max: 1100 });
  });

  it('should parse a range with commas like "50,000 - 70,000"', () => {
    const result = parseSalaryRange('50,000 - 70,000');
    expect(result).to.deep.equal({ min: 50000, max: 70000 });
  });

  it('should parse "500-700 USD"', () => {
    const result = parseSalaryRange('500-700 USD');
    expect(result).to.deep.equal({ min: 500, max: 700 });
  });

  it('should handle reversed order and return correct min/max', () => {
    const result = parseSalaryRange('7000-3000');
    expect(result).to.deep.equal({ min: 3000, max: 7000 });
  });

  it('should parse decimal values', () => {
    const result = parseSalaryRange('1500.50-2000.75');
    expect(result).to.deep.equal({ min: 1500.5, max: 2000.75 });
  });
});
