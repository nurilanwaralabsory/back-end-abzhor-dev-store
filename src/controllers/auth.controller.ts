import { Request, Response } from "express";
import * as Yup from "yup";

import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";

type TRegister = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type TLogin = {
  identifier: string;
  password: string;
};

const registerValidateSchema = Yup.object({
  fullName: Yup.string().required(),
  username: Yup.string().required(),
  email: Yup.string().required(),
  password: Yup.string().required(),
  confirmPassword: Yup.string()
    .required()
    .oneOf([Yup.ref("password"), ""], "Password not match"),
});

export default {
  async register(req: Request, res: Response) {
    const { fullName, username, email, password, confirmPassword } =
      req.body as unknown as TRegister;

    try {
      await registerValidateSchema.validate({
        fullName,
        username,
        email,
        password,
        confirmPassword,
      });

      const result = await UserModel.create({
        fullName,
        username,
        email,
        password,
      });

      res.status(200).json({
        message: "Success registration",
        data: result,
      });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },
  async login(req: Request, res: Response) {
    const { identifier, password } = req.body as unknown as TLogin;

    try {
      const userByIdentifier = await UserModel.findOne({
        $or: [{ username: identifier }, { email: identifier }],
      });
      if (!userByIdentifier) {
        res.status(403).json({
          message: "User not found",
          data: null,
        });
      }
      const validatePassword: boolean =
        encrypt(password) === userByIdentifier?.password;

      if (!validatePassword) {
        res.status(403).json({
          message: "Password not match",
          data: null,
        });
      }

      res.status(200).json({
        message: "Login success",
        data: userByIdentifier,
      });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(403).json({
        message: err.message,
        data: null,
      });
    }
  },
};
