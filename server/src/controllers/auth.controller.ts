import { Request, Response } from "express";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";
import { UserService } from "../services";
import { sendApiError } from "@src/helper/apiLoggerUtils";
import { ApiError } from "@src/helper/apiError";
import { clearAuthCookie, setAuthCookie, signToken } from "@src/helper/token";

const issueSession = (
  res: Response,
  user: { _id: unknown; name: string; email: string }
) => {
  const token = signToken({ userId: String(user._id), email: user.email });
  setAuthCookie(res, token);
  return UserService.toPublic(user);
};

export class AuthController {
  public static async signup(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      const existing = await UserService.getByEmail(email);
      if (existing) {
        throw new ApiError(
          HttpStatusCodes.CONFLICT,
          "An account with this email already exists"
        );
      }

      const user = await UserService.createUser({ name, email, password });
      const data = issueSession(res, user);
      return res
        .status(HttpStatusCodes.CREATED)
        .send({ statusCode: HttpStatusCodes.CREATED, data });
    } catch (error) {
      return sendApiError(req, res, error);
    }
  }

  public static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await UserService.getByEmail(email, true);
      const isValid =
        user && (await UserService.verifyPassword(password, user.password));
      if (!user || !isValid) {
        throw new ApiError(
          HttpStatusCodes.UNAUTHORIZED,
          "Invalid email or password"
        );
      }

      const data = issueSession(res, user);
      return res.send({ statusCode: HttpStatusCodes.OK, data });
    } catch (error) {
      return sendApiError(req, res, error);
    }
  }

  public static async logout(req: Request, res: Response) {
    clearAuthCookie(res);
    return res.send({
      statusCode: HttpStatusCodes.OK,
      message: "Logged out successfully",
    });
  }

  public static async me(req: Request, res: Response) {
    try {
      const user = await UserService.getById(req.user!.userId);
      if (!user) {
        clearAuthCookie(res);
        throw new ApiError(HttpStatusCodes.UNAUTHORIZED, "User not found");
      }
      return res.send({
        statusCode: HttpStatusCodes.OK,
        data: UserService.toPublic(user),
      });
    } catch (error) {
      return sendApiError(req, res, error);
    }
  }
}
