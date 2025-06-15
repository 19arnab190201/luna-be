"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTP = exports.generateOTP = void 0;
const OTPSession_model_1 = require("../models/OTPSession.model");
// Generate a random 5-digit OTP
const generateRandomOTP = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
};
// Generate and save OTP for a phone number
const generateOTP = async (phoneNumber) => {
    // Delete any existing OTP sessions for this phone number
    await OTPSession_model_1.OTPSession.deleteMany({ phoneNumber });
    // Generate new OTP
    const otp = generateRandomOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    // Save OTP session
    await OTPSession_model_1.OTPSession.create({
        phoneNumber,
        otp,
        expiresAt,
    });
    // Send OTP via Twilio SMS
    try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        myHeaders.append("Authorization", "Basic QUMxYzdkNTM2MTdiMjIyMmY0MDkxYjY0OTI3MjYxOWEyMDo1YmIxOTc1YWQwZDdhYWViYjQ1YjI5NDM5MDFkMjdlOQ==");
        const urlencoded = new URLSearchParams();
        urlencoded.append("To", `+91${phoneNumber}`);
        urlencoded.append("Channel", "sms");
        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: urlencoded,
            redirect: "follow",
        };
        const response = await fetch("https://verify.twilio.com/v2/Services/VAeb48e601487df1927db9c03860990d84/Verifications", requestOptions);
        if (!response.ok) {
            console.error(`Failed to send OTP via SMS to +91${phoneNumber}`);
        }
        else {
            console.log(`OTP sent to +91${phoneNumber} via SMS`);
        }
    }
    catch (error) {
        console.error("Error sending OTP:", error);
    }
    return otp;
};
exports.generateOTP = generateOTP;
// Verify OTP for a phone number
const verifyOTP = async (phoneNumber, otp) => {
    // Master OTP check
    if (otp === "12312") {
        return true;
    }
    const otpSession = await OTPSession_model_1.OTPSession.findOne({
        phoneNumber,
        otp,
        expiresAt: { $gt: new Date() },
    });
    if (!otpSession) {
        return false;
    }
    // Delete the OTP session after successful verification
    await OTPSession_model_1.OTPSession.deleteOne({ _id: otpSession._id });
    return true;
};
exports.verifyOTP = verifyOTP;
//# sourceMappingURL=otp.service.js.map