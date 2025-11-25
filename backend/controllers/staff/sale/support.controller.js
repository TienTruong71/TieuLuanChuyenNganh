import SupportRequest from '../../../models/supportRequestModel.js';

// Lấy tất cả yêu cầu hỗ trợ
export const getAllSupportRequests = async (req, res) => {
  try {
    const requests = await SupportRequest.find().populate('user', 'username email');
    if (!requests.length) {
      return res.status(404).json({ message: 'Không có yêu cầu hỗ trợ' });
    }
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết yêu cầu theo ID
export const getSupportRequestById = async (req, res) => {
  try {
    const request = await SupportRequest.findById(req.params.id).populate('user', 'username email');
    if (!request) {
      return res.status(404).json({ message: 'Yêu cầu không tồn tại' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Trả lời và đóng yêu cầu
export const replyAndResolveSupportRequest = async (req, res) => {
  try {
    const { replyMessage } = req.body; // nội dung trả lời của Sale Staff
    const request = await SupportRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Yêu cầu không tồn tại' });
    }

    // Cập nhật trạng thái và lưu reply
    request.status = 'resolved';
    request.reply = replyMessage; // bạn có thể thêm trường reply trong model nếu muốn lưu
    request.updatedAt = Date.now();

    await request.save();
    res.json({ message: 'Đã trả lời và đóng yêu cầu', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
