export interface ValidationResult {
  errors: Record<string, string | string[]>;
  isValid: boolean;
}

export interface PasswordValidationResult {
  errors: string[];
  isValid: boolean;
}

export interface ProductValidationResult {
  errors: Record<string, string | string[]>;
  valid: boolean;
}

export const validateEmail = (email: string): boolean => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase');
  if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase');
  if (!/[0-9]/.test(password)) errors.push('Password must contain number');

  return {
    errors,
    isValid: errors.length === 0
  };
};

export const validateUser = (user: {
  firstname?: string;
  lastname?: string;
  password?: string;
  username?: string;
}): ValidationResult => {
  const errors: Record<string, string | string[]> = {};

  if (!user.firstname) errors.firstname = 'First name is required';
  if (!user.lastname) errors.lastname = 'Last name is required';
  if (!user.username) errors.username = 'Username is required';
  if (user.username && user.username.length < 3) errors.username = 'Username too short';

  if (user.password) {
    const passwordValidation = validatePassword(user.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors;
    }
  } else {
    errors.password = 'Password is required';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

export const validateProduct = (product: {
  name?: string;
  price?: number;
  stock?: number;
}): ProductValidationResult => {
  let valid = true;
  const errors: Record<string, string | string[]> = {};

  if (!product.name || product.name.trim() === '') {
    valid = false;
    errors.name = 'Name is required';
  }

  if (product.price === undefined || product.price === null || Number.isNaN(product.price)) {
    valid = false;
    errors.price = 'Valid price is required';
  }

  if (product.price !== undefined && product.price < 0) {
    valid = false;
    errors.price = 'Price must be positive';
  }

  if (product.stock === undefined || product.stock === null || Number.isNaN(product.stock)) {
    valid = false;
    errors.stock = ['Stock must be a number'];
  }

  if (product.stock !== undefined && product.stock < 0) {
    if (!errors.stock) errors.stock = [];
    if (Array.isArray(errors.stock)) {
      errors.stock.push('Stock cannot be negative');
    }
  }

  return { errors, valid };
};
