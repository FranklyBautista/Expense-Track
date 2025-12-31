import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const TOKEN_EXPIRES_IN = "7d";

export function signAccesToken(userId: string) {
  return jwt.sign({}, JWT_SECRET, {
    subject: userId,
    expiresIn: TOKEN_EXPIRES_IN,
  });
}

export function verifyAccesToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
}
