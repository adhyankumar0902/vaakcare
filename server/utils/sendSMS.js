const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);

const sendSMS = async (to, message) => {
  try {
    const res = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: to,
    });

    console.log("✅ SMS sent:", res.sid);
  } catch (error) {
    console.error("❌ SMS failed:", error.message);
  }
};

module.exports = { sendSMS };