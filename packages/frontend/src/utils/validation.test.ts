import { validateEmail, validatePassword, validateProduct, validateUser } from './validation';

describe('validateEmail', () => {
  it.each(['ada@example.com', 'first.last@sub.domain.org', '"quoted"@example.com', 'user@[192.168.0.1]'])(
    'accepts %p',
    (email) => {
      expect(validateEmail(email)).toBe(true);
    }
  );

  it.each(['', 'plainaddress', 'missing-at.com', 'user@', 'user@domain', 'a b@example.com'])('rejects %p', (email) => {
    expect(validateEmail(email)).toBe(false);
  });
});

describe('validatePassword', () => {
  it('accepts a strong password', () => {
    expect(validatePassword('Str0ngPass')).toEqual({ errors: [], isValid: true });
  });

  it('lists every failed rule', () => {
    expect(validatePassword('abc')).toEqual({
      errors: [
        'Password must be at least 8 characters',
        'Password must contain uppercase',
        'Password must contain number'
      ],
      isValid: false
    });
  });

  it('requires a lowercase letter', () => {
    expect(validatePassword('ABCDEFG1').errors).toEqual(['Password must contain lowercase']);
  });
});

describe('validateUser', () => {
  const validUser = { firstname: 'Ada', lastname: 'Lovelace', password: 'Str0ngPass', username: 'ada' };

  it('accepts a complete user', () => {
    expect(validateUser(validUser)).toEqual({ errors: {}, isValid: true });
  });

  it('reports every missing field', () => {
    expect(validateUser({})).toEqual({
      errors: {
        firstname: 'First name is required',
        lastname: 'Last name is required',
        password: 'Password is required',
        username: 'Username is required'
      },
      isValid: false
    });
  });

  it('rejects a username shorter than 3 characters', () => {
    expect(validateUser({ ...validUser, username: 'ad' }).errors).toEqual({ username: 'Username too short' });
  });

  it('exposes the password rule errors', () => {
    const result = validateUser({ ...validUser, password: 'weakpass' });

    expect(result.isValid).toBe(false);
    expect(result.errors.password).toEqual(['Password must contain uppercase', 'Password must contain number']);
  });
});

describe('validateProduct', () => {
  it('accepts a valid product', () => {
    expect(validateProduct({ name: 'Laptop', price: 999.99, stock: 10 })).toEqual({ errors: {}, valid: true });
  });

  it('reports missing name, price and stock', () => {
    expect(validateProduct({ name: '   ' })).toEqual({
      errors: {
        name: 'Name is required',
        price: 'Valid price is required',
        stock: ['Stock must be a number']
      },
      valid: false
    });
  });

  it('rejects NaN price and stock', () => {
    const result = validateProduct({ name: 'Laptop', price: Number.NaN, stock: Number.NaN });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual({ price: 'Valid price is required', stock: ['Stock must be a number'] });
  });

  it('rejects a negative price', () => {
    const result = validateProduct({ name: 'Laptop', price: -1, stock: 1 });

    expect(result.valid).toBe(false);
    expect(result.errors.price).toBe('Price must be positive');
  });

  it('reports a negative stock', () => {
    expect(validateProduct({ name: 'Laptop', price: 1, stock: -2 }).errors.stock).toEqual(['Stock cannot be negative']);
  });
});
