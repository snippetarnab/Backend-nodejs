import { asynchandler } from "../utils/asynchandler.js";
import { Apierror } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";

const registerUser = asynchandler(async (req, res) => {
  const { fullname, email, password, username } = req.body;
  if (
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new Apierror(400, "fullname is required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new Apierror(409, "user already exists");
  }
  //console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  console.log(avatarLocalPath, coverImageLocalPath);
  if (!avatarLocalPath) {
    throw new Apierror(400, "avatar is required");
  }
  const avatar = await uploadCloudinary(avatarLocalPath);
  const coverImage = await uploadCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new Apierror(400, "avatar file is required");
  }
  const user = await User.create({
    fullname,
    email,
    password,
    username,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });
  const creteduser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!creteduser) {
    throw new Apierror(500, "something went wrong while creating user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, creteduser, "user created successfully"));
});

export { registerUser };
