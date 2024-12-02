import { Apierror } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";

export const verifyJWT = asynchandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new Apierror(401, "Unauthorized access");
  }
});
