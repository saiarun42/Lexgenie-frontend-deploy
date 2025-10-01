import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Only POST requests allowed" });
    }
  
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }
  
    try {
      const response = await axios.post("https://api.languagetool.org/v2/check", {
        text,
        language: "en-US",
      });
  
      console.log("LanguageTool API Response:", response.data); // ✅ Log response
  
      return res.status(200).json(response.data);
    } catch (error) {
      console.error("LanguageTool API Error:", error);
      return res.status(500).json({ message: "Error analyzing text" });
    }
  }
  