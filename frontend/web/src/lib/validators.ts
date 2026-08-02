// Input validation utilities
export const validators = {
  email: (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  password: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Min 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('Need uppercase');
    if (!/[a-z]/.test(password)) errors.push('Need lowercase');
    if (!/[0-9]/.test(password)) errors.push('Need digit');
    return { valid: errors.length === 0, errors };
  },

  name: (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 50;
  },

  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  creditCard: (cc: string): boolean => {
    const re = /^(\d{4}[\s-]?){3}\d{4}$/;
    return re.test(cc.replace(/\s/g, ''));
  },

  notEmpty: (str: string): boolean => {
    return str.trim().length > 0;
  },

  minLength: (str: string, min: number): boolean => {
    return str.length >= min;
  },

  maxLength: (str: string, max: number): boolean => {
    return str.length <= max;
  },

  isNumber: (val: any): boolean => {
    return !isNaN(parseFloat(val)) && isFinite(val);
  },
};
