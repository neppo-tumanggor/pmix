declare namespace NodeJS {
  interface ProcessEnv {
    DB_HOST?: string;
    DB_PORT?: string;
    DB_USERNAME?: string;
    DB_PASSWORD?: string;
    DB_DATABASE?: string;
    DB_LOGGING?: string;
    [key: string]: string | undefined;
  }
}

declare var process: {
  env: NodeJS.ProcessEnv;
  exit(code?: number): void;
};
