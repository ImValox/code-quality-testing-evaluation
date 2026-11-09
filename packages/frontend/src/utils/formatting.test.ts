import { formatDate, formatPrice, formatSearchTerm, formatStock, formatUserName } from './formatting';

describe('formatDate', () => {
  it('formats a date as D/M/YYYY', () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe('5/1/2026');
  });

  it('accepts timestamps and date strings', () => {
    expect(formatDate(new Date(2026, 10, 9).getTime())).toBe('9/11/2026');
    expect(formatDate('2026-03-15T12:00:00')).toBe('15/3/2026');
  });

  it.each([null, undefined, '', 0])('returns "Invalid Date" for empty value %p', (value) => {
    expect(formatDate(value)).toBe('Invalid Date');
  });

  it('returns "Invalid Date" for an unparsable string', () => {
    expect(formatDate('not a date')).toBe('Invalid Date');
  });
});

describe('formatPrice', () => {
  it.each([
    [0.5, '$0.50'],
    [999.99, '$999.99'],
    [1234.5, '$1,234.50'],
    [1_234_567.891, '$1,234,567.89']
  ])('formats %p as %p', (price, expected) => {
    expect(formatPrice(price)).toBe(expected);
  });

  it('parses numeric strings', () => {
    expect(formatPrice('49.9')).toBe('$49.90');
  });

  it.each([null, undefined, '', 'abc'])('returns "$0.00" for invalid value %p', (value) => {
    expect(formatPrice(value)).toBe('$0.00');
  });
});

describe('formatStock', () => {
  it.each([
    [0, 'Out of Stock'],
    [3, 'Low Stock (3 left)'],
    [7, 'Limited Stock (7 available)'],
    [10, 'In Stock (10)'],
    [4.9, 'Low Stock (4 left)'],
    ['12', 'In Stock (12)']
  ])('formats %p as %p', (stock, expected) => {
    expect(formatStock(stock)).toBe(expected);
  });

  it.each([null, undefined, 'n/a'])('returns "Out of Stock" for invalid value %p', (value) => {
    expect(formatStock(value)).toBe('Out of Stock');
  });
});

describe('formatUserName', () => {
  it('capitalizes and joins first and last names', () => {
    expect(formatUserName('ada', 'lovelace')).toBe('Ada Lovelace');
  });

  it('trims surrounding whitespace', () => {
    expect(formatUserName('  ada ', ' lovelace  ')).toBe('Ada Lovelace');
  });

  it('handles a single provided name', () => {
    expect(formatUserName('ada', null)).toBe('Ada');
    expect(formatUserName(undefined, 'lovelace')).toBe('Lovelace');
  });

  it('returns "Unknown User" when no usable name is given', () => {
    expect(formatUserName(null, undefined)).toBe('Unknown User');
    expect(formatUserName('   ', '  ')).toBe('Unknown User');
  });
});

describe('formatSearchTerm', () => {
  it('title-cases words and collapses extra spaces', () => {
    expect(formatSearchTerm('  gaming   LAPTOP ')).toBe('Gaming Laptop');
  });

  it.each([null, undefined, ''])('returns an empty string for %p', (value) => {
    expect(formatSearchTerm(value)).toBe('');
  });
});
