import { model } from "../../config/geminiAI.js";

export const AiChatController = {
  askPricing: async (req, res) => {
    try {
      const { message } = req.body;

      if (!message)
        return res.status(400).json({ success: false, error: "Message is required" });

      const prompt = `
Bạn là chuyên gia tư vấn mua bán và định giá xe ô tô tại Việt Nam, có nhiều năm kinh nghiệm. 
Hãy trả lời câu hỏi của khách ngắn gọn, súc tích, chuyên nghiệp, dễ đọc, chỉ tập trung vào tư vấn xe, không sử dụng ký hiệu đặc biệt nào như ** hoặc _. để im đậm  Bắt buộc xuất ra:
1. Danh sách các lựa chọn xe phổ biến phù hợp ngân sách của khách, kèm giá tham khảo.
2. Ưu điểm và khuyết điểm ngắn gọn của từng xe, dùng gạch đầu dòng.
3. Lời khuyên nếu muốn bán nhanh hoặc nâng giá trị xe.
4. Lưu ý quan trọng: kiểm tra xe và thương lượng giá.
5. Dùng tiêu đề và phân mục rõ ràng, dễ đọc trên điện thoại hoặc web.
6. Không viết các câu chào kiểu marketing hay giới thiệu chung chung.

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
