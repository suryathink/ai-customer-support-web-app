import bcrypt from "bcryptjs";
import { User } from "../models";

const SALT_ROUNDS = 10;

interface ICreateUserDTO {
  name: string;
  email: string;
  password: string;
}

export class UserService {
  public static async getByEmail(email: string, withPassword = false) {
    const query = User.findOne({ email: email.toLowerCase() });
    if (withPassword) query.select("+password");
    return await query;
  }

  public static async getById(id: string) {
    return await User.findById(id).lean();
  }

  public static async createUser({ name, email, password }: ICreateUserDTO) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return await User.create({ name, email, password: hashedPassword });
  }

  public static async verifyPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  public static toPublic(user: { _id: unknown; name: string; email: string }) {
    return { id: String(user._id), name: user.name, email: user.email };
  }
}
