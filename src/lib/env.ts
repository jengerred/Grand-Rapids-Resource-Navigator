interface Env {
  MONGODB_URI: string;
}

export const env = {
  MONGODB_URI: process.env.MONGODB_URI || ''
} as Env;
