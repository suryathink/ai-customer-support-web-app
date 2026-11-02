import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import HttpStatusCodes from "@src/constants/HttpStatusCodes";

/**
 * Validates and normalises req.body against a Joi schema.
 */
export const validateBody =
  (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body ?? {}, {
      abortEarly: true,
      stripUnknown: true,
    });
    if (error) {
      return res.status(HttpStatusCodes.BAD_REQUEST).send({
        statusCode: HttpStatusCodes.BAD_REQUEST,
        message: error.details[0].message.replace(/"/g, ""),
      });
    }
    req.body = value;
    return next();
  };
