import { model } from "../../config/geminiAI.js";
import Product from "../../models/productModel.js";
import ServicePackage from "../../models/servicepackageModel.js";
import Category from "../../models/categoryModel.js";
import Order from "../../models/orderModel.js";
import Booking from "../../models/bookingModel.js";
import Feedback from "../../models/feedbackModel.js";
import OldVehicle from "../../models/oldvehicleModel.js";

const cleanJsonString = (str) => str.replace(/```json/g, "").replace(/```/g, "").trim();

export const AiChatController = {
  askPricing: async (req, res) => {
    try {
      const { message } = req.body;
      const currentUser = req.user;

      if (!message) return res.status(400).json({ success: false, error: "Empty message" });

      const schemaPrompt = `
        Bạn là chuyên gia Query Database của CarsShop.
        Nhiệm vụ: Chuyển câu hỏi tự nhiên thành JSON Object.

        CẤU TRÚC JSON BẮT BUỘC:
        {
           "intent": "product_search" | "service_search" | "category_check" | "order_tracking" | "booking_tracking" | "tradein_check",
           "mode": "list_all" | "search", 
           "keyword": string | null,
           "max_price": number | null
        }

        QUY TẮC LOGIC (QUAN TRỌNG):
        1. Nếu khách hỏi "Danh mục", "Mục sản phẩm", "Loại sản phẩm" -> intent: "category_check", mode: "list_all".
        2. Nếu khách hỏi tổng quát về sản phẩm ("Bán gì?", "Có xe gì?") -> intent: "product_search", mode: "list_all".
        3. Nếu khách hỏi cụ thể ("Tìm xe SUV", "Thay lọc gió"):
           -> mode: "search".
           -> keyword: TRÍCH XUẤT DANH TỪ CỐT LÕI (Bỏ động từ "thay", "mua", "tìm").
           (Ví dụ: "Tôi muốn thay lọc gió" -> keyword: "lọc gió").

        VÍ DỤ HUẤN LUYỆN:
        - "Shop có những dịch vụ nào?" -> { "intent": "service_search", "mode": "list_all" }
        - "Có các mục sản phẩm gì?" -> { "intent": "category_check", "mode": "list_all" }
        - "Tôi muốn thay lọc gió" -> { "intent": "service_search", "mode": "search", "keyword": "lọc gió" }
        - "Có xe SUV nào không?" -> { "intent": "product_search", "mode": "search", "keyword": "SUV" }

        INPUT: "${message}"
        OUTPUT JSON:
      `;

      const result = await model.generateContent(schemaPrompt);
      let q = { intent: "general" };
      try {
        q = JSON.parse(cleanJsonString(result.response.text()));
      } catch (e) {
        console.error("JSON Parse Fail:", e);
      }

      
      let dbContext = "Không tìm thấy dữ liệu.";

      if (q.intent === "category_check") {
        const categories = await Category.find().limit(10);
        if (categories.length > 0) {
          dbContext = "Các danh mục sản phẩm tại CarsShop:\n" +
            categories.map(c => `📂 ${c.category_name}`).join("\n\n");
        } else {
          dbContext = "Hiện chưa có danh mục nào.";
        }
      }

      else if (q.intent === "product_search") {
        let filter = {};

        if (q.mode === "list_all") {
          filter = {};
        } else {
          const { keyword, max_price } = q;
          const andConditions = [];

          if (keyword) {
            const regex = { $regex: keyword, $options: "i" };
            const categories = await Category.find({ category_name: regex }).select('_id');
            const categoryIds = categories.map(c => c._id);

            const orConditions = [
              { product_name: regex },
              { type: regex },
              { description: regex }
            ];
            if (categoryIds.length > 0) orConditions.push({ category_id: { $in: categoryIds } });
            andConditions.push({ $or: orConditions });
          }

          if (max_price) andConditions.push({ price: { $lte: max_price } });
          if (andConditions.length > 0) filter = { $and: andConditions };
        }

        const products = await Product.find(filter)
          .populate("category_id", "category_name")
          .limit(6)
          .sort({ createdAt: -1 });

        if (products.length > 0) {
          dbContext = (q.mode === "list_all" ? "Danh sách sản phẩm nổi bật:\n" : "Kết quả tìm kiếm:\n") +
            products.map(p => `- [${p.type || p.category_id?.category_name}] ${p.product_name}: ${p.price.toLocaleString()} VND.\n  Mô tả: ${p.description}`).join("\n\n");
        } else {
          dbContext = "Không tìm thấy sản phẩm nào phù hợp.";
        }
      }

      else if (q.intent === "service_search") {
        let services = [];

        if (q.mode === "list_all") {
          services = await ServicePackage.find().limit(10);
        } else {
          const { keyword, max_price } = q;
          const conditions = [];
          if (keyword) {
            const regex = { $regex: keyword, $options: "i" };
            conditions.push({ $or: [{ service_name: regex }, { description: regex }] });
          }
          if (max_price) conditions.push({ price: { $lte: max_price } });

          const filter = conditions.length > 0 ? { $and: conditions } : {};
          services = await ServicePackage.find(filter).limit(5);
        }

        if (services.length > 0) {
          dbContext = "Các gói dịch vụ:\n" +
            services.map(s => `🔧 ${s.service_name}: ${s.price.toLocaleString()} VND.\n   (Chi tiết: ${s.description})`).join("\n\n");
        } else {
          dbContext = "Không tìm thấy dịch vụ nào.";
        }
      }

      else if (q.intent === "order_tracking") {
        if (!currentUser) dbContext = "Vui lòng đăng nhập để tra cứu đơn hàng.";
        else {
          let filter = { user_id: currentUser._id };

          if (q.mode === "search" && q.keyword) {
            const regex = { $regex: q.keyword, $options: "i" };
            if (q.keyword.length === 24) filter._id = q.keyword;
            else filter.status = regex;
          }

          const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(5).populate("items.product_id", "product_name");

          if (orders.length > 0) {
            dbContext = orders.map(o => {
              const names = o.items.map(i => i.product_id?.product_name).join(', ');
              return `📦 Đơn ${o._id}: [${o.status}] - ${o.total_amount.toLocaleString()} VND.\n   Gồm: ${names}`;
            }).join("\n\n");
          } else {
            dbContext = "Không tìm thấy đơn hàng nào.";
          }
        }
      }

      else if (q.intent === "booking_tracking") {
        if (!currentUser) dbContext = "Vui lòng đăng nhập để xem lịch hẹn.";
        else {
          const bookings = await Booking.find({ user_id: currentUser._id })
            .populate("service_id", "service_name")
            .sort({ booking_date: -1 })
            .limit(5);

          let results = bookings;
          if (q.mode === "search" && q.keyword) {
            const k = q.keyword.toLowerCase();
            results = bookings.filter(b =>
              b.status.toLowerCase().includes(k) ||
              (b.service_id && b.service_id.service_name.toLowerCase().includes(k))
            );
          }

          if (results.length > 0) {
            dbContext = results.map(b =>
              `📅 ${b.service_id?.service_name || 'Dịch vụ'} ngày ${new Date(b.booking_date).toLocaleDateString()} (${b.time_slot}): [${b.status}]`
            ).join("\n\n");
          } else {
            dbContext = "Không tìm thấy lịch hẹn nào.";
          }
        }
      }

      else if (q.intent === "tradein_check") {
        if (!currentUser) dbContext = "Vui lòng đăng nhập để kiểm tra xe cũ.";
        else {
          let filter = { user_id: currentUser._id };
          if (q.mode === "search" && q.keyword) {
            const regex = { $regex: q.keyword, $options: "i" };
            filter.$or = [
              { "vehicle_info.make": regex },
              { "vehicle_info.model": regex },
              { status: regex }
            ];
          }

          const trades = await OldVehicle.find(filter).limit(5);
          if (trades.length > 0) {
            dbContext = trades.map(t =>
              `🚘 Xe ${t.vehicle_info.make} ${t.vehicle_info.model}: [${t.status}].\n   Giá đề nghị: ${t.price_offered ? t.price_offered.toLocaleString() : 'Đang định giá'}`
            ).join("\n\n");
          } else {
            dbContext = "Không tìm thấy yêu cầu bán xe cũ nào.";
          }
        }
      }

      else {
        dbContext = "Thông tin chung: CarsShop chuyên mua bán xe mới/cũ, phụ kiện và dịch vụ bảo dưỡng uy tín.";
      }


      const finalPrompt = `
        Vai trò: Nhân viên tư vấn CarsShop chuyên nghiệp, thân thiện.
        
        SỰ THẬT TỪ DATABASE:
        """
        ${dbContext}
        """
        
        CÂU HỎI KHÁCH: "${message}"

        YÊU CẦU:
        1. Trả lời dựa trên SỰ THẬT.
        2. Liệt kê đầy đủ danh sách nếu có (Tên + Giá).
        3. Văn phong: tự nhiên, chuyên nghiệp.
        4. KHÔNG sử dụng định dạng Markdown (như **bold**, ## header, * list).
        5. Thay vì dùng dấu *, hãy dùng Emoji để liệt kê (Ví dụ: 🚗, 🔧, ✅, 📌).
        6. BẮT BUỘC phải xuống dòng (\n) giữa các mục để dễ đọc.
        7. Với giá tiền: Viết rõ "VND" (Ví dụ: 500.000 VND).

        MẪU TRẢ LỜI MONG MUỐN:
        "Chào bạn ạ! CarsShop hiện có các dịch vụ sau:
        
        🔧 Bảo dưỡng định kỳ: 200.000 VND - Giúp xe vận hành êm ái.
        
        🚿 Rửa xe cao cấp: 50.000 VND - Sạch từ trong ra ngoài.
        
        Bạn muốn đặt lịch cho dịch vụ nào không ạ?"
      `;

      const aiRes = await model.generateContent(finalPrompt);
      let answer = aiRes.response.text();
      answer = answer.replace(/\*\*/g, "").replace(/\*/g, "-").replace(/#/g, "");
      return res.json({ success: true, answer: answer });

    } catch (err) {
      console.error("AI Error:", err);
      return res.status(500).json({ success: false, error: "Lỗi hệ thống AI" });
    }
  }
};