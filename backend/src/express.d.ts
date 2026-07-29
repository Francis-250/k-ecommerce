declare namespace Express {
  interface Request {
    auth?: {
      sub: string;
      role?: string;
    };
  }
}
