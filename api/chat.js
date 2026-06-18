import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { message } = req.body;

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: message,
    });

    return res.status(200).json({
      text: result.text,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}