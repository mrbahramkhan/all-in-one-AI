// Environment configuration with validation
const getEnv = (key: string, fallback?: string): string => {
  const value = typeof window !== 'undefined' 
    ? (window as any)[`__ENV_${key}`]
    : process.env[key];
  
  if (!value && !fallback) {
    console.warn(`Missing environment variable: ${key}`);
  }
  return value || fallback || '';
};

export const env = {
  API_URL: getEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001'),
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  isDev: getEnv('NODE_ENV', 'development') === 'development',
  isProd: getEnv('NODE_ENV', 'development') === 'production',
} as const;

export default env;
