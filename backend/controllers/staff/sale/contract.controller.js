import Contract from "../../../models/contractmodel.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";


export const getContracts = async (req, res) => {
  try {
    const contracts = await Contract
      .find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: contracts
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * POST /staff/sale/contracts
 * Tạo hợp đồng mới
 */
export const createContract = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order
      .findById(orderId)
      .populate("customer items.product");

    if (!order) {
      return res.status(404).json({ message: "Order không tồn tại" });
    }

    // Nếu order đã có contract → chặn
    const existed = await Contract.findOne({ order_id: order._id });
    if (existed) {
      return res.status(400).json({ message: "Order đã có hợp đồng" });
    }

    const contract = await Contract.create({
      order_id: order._id,
      contract_number: `HD-${Date.now()}`,

      customer_snapshot: {
        full_name: order.customer.full_name,
        phone: order.customer.phone,
        email: order.customer.email,
        address: order.customer.address,
      },

      order_snapshot: {
        total_amount: order.total_amount,
        payment_method: order.payment_method,
        createdAt: order.createdAt,
      },

      items_snapshot: order.items.map(i => ({
        product_name: i.product.name,
        quantity: i.quantity,
        price: i.price,
      })),

      status: "issued",
    });

    res.status(201).json({
      success: true,
      data: contract
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/**
 * GET /staff/sale/contracts/:id/print
 * In & tải PDF hợp đồng
 */
export const printContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
    }

    const outputDir = path.resolve("outputs/contracts");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, `${contract.contract_number}.pdf`);

    // Nếu file đã tồn tại → trả luôn
    if (fs.existsSync(filePath)) {
      return res.download(filePath);
    }

    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // ===== HEADER =====
    doc.fontSize(20).text("HỢP ĐỒNG MUA HÀNG", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Số hợp đồng: ${contract.contract_number}`);
    doc.moveDown(2);

    // ===== CUSTOMER =====
    doc.fontSize(14).text("1. Thông tin khách hàng");
    doc.fontSize(12)
      .text(`Họ tên: ${contract.customer_snapshot?.full_name || ""}`)
      .text(`Điện thoại: ${contract.customer_snapshot?.phone || ""}`)
      .text(`Email: ${contract.customer_snapshot?.email || ""}`)
      .text(`Địa chỉ: ${contract.customer_snapshot?.address || ""}`);
    doc.moveDown();

    // ===== ORDER =====
    doc.fontSize(14).text("2. Thông tin đơn hàng");
    doc.fontSize(12)
      .text(`Ngày tạo: ${new Date(contract.order_snapshot?.createdAt).toLocaleString()}`)
      .text(`Thanh toán: ${contract.order_snapshot?.payment_method || ""}`)
      .text(
        `Tổng tiền: ${Number(
          contract.order_snapshot?.total_amount || 0
        ).toLocaleString()} VND`
      );
    doc.moveDown();

    // ===== ITEMS =====
    doc.fontSize(14).text("3. Danh sách sản phẩm");
    doc.moveDown();

    contract.items_snapshot?.forEach((item, index) => {
      doc.text(
        `${index + 1}. ${item.product_name} | SL: ${item.quantity} | Giá: ${Number(item.price).toLocaleString()} VND`
      );
    });

    doc.moveDown(3);
    doc.text("ĐẠI DIỆN BÊN MUA", { align: "left" });
    doc.text("ĐẠI DIỆN BÊN BÁN", { align: "right" });

    doc.end();

    stream.on("finish", () => {
      contract.generated_file_url = filePath;
      contract.save();
      res.download(filePath);
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
