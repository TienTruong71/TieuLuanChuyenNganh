import Contract from "../../../models/contractmodel.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// Tạo hợp đồng mới (sau khi tạo Order)
export const createContract = async (req, res) => {
  try {
    const {
      order_id,
      contract_number,
      created_by,
      customer_snapshot,
      order_snapshot,
      items_snapshot,
    } = req.body;

    const contract = await Contract.create({
      order_id,
      contract_number,
      created_by,
      customer_snapshot,
      order_snapshot,
      items_snapshot,
      status: "issued",
    });

    res.status(201).json({
      success: true,
      message: "Tạo hợp đồng thành công",
      data: contract,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// In & Xuất PDF
export const printContract = async (req, res) => {
  try {
    const contractId = req.params.id;
    const contract = await Contract.findById(contractId);

    if (!contract) {
      return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
    }

    // Tạo thư mục lưu file
    const outputDir = path.resolve("outputs/contracts");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const filePath = path.join(
      outputDir,
      `${contract.contract_number}.pdf`
    );

    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // ===== HEADER =====
    doc.fontSize(20).text("HỢP ĐỒNG MUA HÀNG", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Số: ${contract.contract_number}`);
    doc.moveDown(2);

    // ===== INFO KHÁCH HÀNG =====
    doc.fontSize(14).text("1. Thông tin khách hàng");
    doc.fontSize(12)
      .text(`Họ tên: ${contract.customer_snapshot.full_name}`)
      .text(`Điện thoại: ${contract.customer_snapshot.phone}`)
      .text(`Email: ${contract.customer_snapshot.email}`)
      .text(`Địa chỉ: ${contract.customer_snapshot.address}`);
    doc.moveDown();

    // ===== INFO ĐƠN HÀNG =====
    doc.fontSize(14).text("2. Thông tin đơn hàng");
    doc.fontSize(12)
      .text(`Ngày tạo: ${new Date(contract.order_snapshot.createdAt).toLocaleString()}`)
      .text(`Hình thức thanh toán: ${contract.order_snapshot.payment_method}`)
      .text(
        `Tổng tiền: ${Number(contract.order_snapshot.total_amount).toLocaleString()} VND`
      );
    doc.moveDown();

    // ===== DANH SÁCH SẢN PHẨM =====
    doc.fontSize(14).text("3. Danh sách sản phẩm");
    doc.moveDown();

    contract.items_snapshot.forEach((item, index) => {
      doc
        .fontSize(12)
        .text(
          `${index + 1}. ${item.product_name} - SL: ${
            item.quantity
          } - Giá: ${Number(item.price).toLocaleString()} VND`
        );
    });
    doc.moveDown(2);

    // ===== SIGN =====
    doc.fontSize(14).text("4. Đại diện hai bên ký tên");
    doc.moveDown(3);
    doc.text("ĐẠI DIỆN BÊN MUA", { align: "left" });
    doc.text("ĐẠI DIỆN BÊN BÁN", { align: "right" });

    doc.end();

    writeStream.on("finish", async () => {
      contract.generated_file_url = filePath;
      await contract.save();

      res.download(filePath);
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
