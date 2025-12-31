import bcrypt from "bcrypt";

export async function hashear_password(password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
}
