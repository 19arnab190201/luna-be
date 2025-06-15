import { OTPSession } from "../models/OTPSession.model";
import { AppError } from "../middleware/error-handler.middleware";

// Generate a random 5-digit OTP
const generateRandomOTP = (): string => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

// Generate and save OTP for a phone number
export const generateOTP = async (phoneNumber: string): Promise<string> => {
  // Delete any existing OTP sessions for this phone number
  await OTPSession.deleteMany({ phoneNumber });

  // Generate new OTP
  const otp = generateRandomOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  // Save OTP session
  await OTPSession.create({
    phoneNumber,
    otp,
    expiresAt,
  });

  // Send OTP via Twilio SMS
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    myHeaders.append(
      "Authorization",
      "Basic QUMxYzdkNTM2MTdiMjIyMmY0MDkxYjY0OTI3MjYxOWEyMDo1YmIxOTc1YWQwZDdhYWViYjQ1YjI5NDM5MDFkMjdlOQ=="
    );

    const urlencoded = new URLSearchParams();
    urlencoded.append("To", `+91${phoneNumber}`);
    urlencoded.append("Channel", "sms");

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow" as const,
    };

    const response = await fetch(
      "https://verify.twilio.com/v2/Services/VAeb48e601487df1927db9c03860990d84/Verifications",
      requestOptions
    );

    if (!response.ok) {
      throw new AppError("Failed to send OTP via SMS", 500);
    }

    console.log(`OTP sent to +91${phoneNumber} via SMS`);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Error sending OTP", 500);
  }

  return otp;
};

// Verify OTP for a phone number
export const verifyOTP = async (
  phoneNumber: string,
  otp: string
): Promise<boolean> => {
  // Master OTP check
  if (otp === "12312") {
    return true;
  }

  const otpSession = await OTPSession.findOne({
    phoneNumber,
    otp,
    expiresAt: { $gt: new Date() },
  });

  if (!otpSession) {
    return false;
  }

  // Delete the OTP session after successful verification
  await OTPSession.deleteOne({ _id: otpSession._id });

  return true;
};
