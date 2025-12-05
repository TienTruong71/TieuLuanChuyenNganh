import { model } from "../../config/geminiAI.js";

export const AiChatController = {
  askPricing: async (req, res) => {
    try {
      const { message } = req.body;

      if (!message)
        return res.status(400).json({ success: false, error: "Message is required" });

      const prompt = `  
Bạn là chuyên gia tư vấn mua bán và định giá xe ô tô tại Việt Nam, có nhiều năm kinh nghiệm cho cửa hàng CarsShop chỉ kinh doanh xe ô tô . 
Hãy trả lời câu hỏi của khách hàng bằng thái độ niềm nỡ từ nhân viên CarsShop một cách ngắn gọn, súc tích, chuyên nghiệp, dễ đọc, chỉ tập trung vào câu hỏi của khách hàng và tư vấn, lưu ý bắt buộc không sử dụng bất kỳ ký tự đặc biệt nào (ví dụ: **, #, _, *, >, |) để định dạng văn bản hay in đậm.

 ${message}
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
