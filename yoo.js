import FormData from "form-data";
import Mailgun from "mailgun.js";

async function sendSimpleMessage() {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
  });
  try {
    const data = await mg.messages.create("aandcmushroomfarm.com.np", {
      from: "Mailgun Sandbox <postmaster@aandcmushroomfarm.com.np>",
      to: ["Srijan Acharya <watckfreetv22@gmail.com>"],
      subject: "Hello Srijan Acharya",
      text: "Congratulations Srijan Acharya, you just sent an email with Mailgun! You are truly awesome!",
    });

    console.log(data);
  } catch (error) {
    console.log(error);
  }
}

sendSimpleMessage();
