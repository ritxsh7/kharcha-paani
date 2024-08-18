import { StatusCodes } from "http-status-codes";

export default {
  ok: (res, data, message) =>
    res.status(StatusCodes.OK).json({
      message: message || "Success",
      data,
    }),
  serverError: (res, message) =>
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: message || "Something went wrong, please try again",
    }),
  unAuthorized: (res, message) =>
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: message || "Access denied",
    }),
};
