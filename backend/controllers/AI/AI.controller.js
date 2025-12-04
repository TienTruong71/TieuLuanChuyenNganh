import { model } from "../../config/geminiAI.js";

export const AiChatController = {
  askPricing: async (req, res) => {
    try {
      const { message } = req.body;

      if (!message)
        return res.status(400).json({ success: false, error: "Message is required" });

      const prompt = `
Bạn là một chuyên gia tư vấn định giá xe tại Việt Nam.
Hãy trả lời câu hỏi của khách một cách chuyên nghiệp, rõ ràng và dễ hiểu.
Câu hỏi của khách: ${message}
      `;

      const result = await model.generateContent(prompt);

      const aiText = result.response.text() || "Tôi chưa có đủ thông tin để trả lời.";

      return res.json({
        success: true,
        answer: aiText,
      });

    } catch (err) {
      console.error("Gemini AI Error FULL:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "AI system error",
      });
    }
  }
};
