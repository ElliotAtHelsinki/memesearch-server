declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_PORT: string;
      WEAVIATE_URL: string;
      FRONTEND_ORIGIN: string;
    }
  }
}

export {}
