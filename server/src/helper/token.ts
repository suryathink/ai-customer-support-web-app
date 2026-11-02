import jwt, { SignOptions } from "jsonwebtoken";
import { Response } from "express";
import EnvVars from "@src/constants/EnvVars";

export interface TokenPayload {
  userId: string;
  email: string;
}

export const signToken = (payload: TokenPayload) =>
  jwt.sign(payload, EnvVars.Jwt.Secret, {
    expiresIn: EnvVars.Jwt.ExpiresIn as SignOptions["expiresIn"],
  });

export const verifyJwt = (token: string) =>
  jwt.verify(token, EnvVars.Jwt.Secret) as TokenPayload;

const cookieOptions = {
  httpOnly: true,
  secure: EnvVars.Cookie.Secure,
  sameSite: "strict" as const,
  path: "/",
};

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie(EnvVars.Cookie.Name, token, {
    ...cookieOptions,
    maxAge: EnvVars.Cookie.MaxAgeMs,
  });
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie(EnvVars.Cookie.Name, cookieOptions);
};
