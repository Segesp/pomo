declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB_URI: string
    NEXTAUTH_URL: string
    NEXTAUTH_SECRET: string
    HUGGINGFACE_API_KEY: string
    NODE_ENV: 'development' | 'production' | 'test'
    VERCEL_URL?: string
  }
} 