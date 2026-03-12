import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import colors from 'colors';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Cho phép mọi origin trong lúc dev
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  // 🛡️ Middleware: Yêu cầu Token hợp lệ để kết nối Socket
  io.use(async (socket, next) => {
    try {
      // Nhận token từ auth lúc kết nối (hoặc header auth)
      const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Chưa đăng nhập: Thiếu Token'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password').populate('role_id');
      
      if (!user) {
        return next(new Error('Hồ sơ lỗi: Không tìm thấy User'));
      }

      // Lưu user vào socket object để dùng xuyên suốt
      socket.user = user;
      next();
    } catch (err) {
      console.error('Socket Auth Error:', err.message);
      next(new Error('Xác thực thất bại: Token hết hạn/sai'));
    }
  });

  // 📡 Sự kiện khi có kết nối thành công
  io.on('connection', (socket) => {
    console.log(`🔌 Realtime | Client Kết Nối: [${socket.user?.email}] (ID: ${socket.id})`.cyan);

    // KÊNH CÁ NHÂN: Chỉ mình User này nhận được
    socket.join(`user_${socket.user._id}`);
    
    // KÊNH ROLE: Phân cụm các phòng chuyên biệt theo Quyền Hạn
    const roleName = socket.user.role_id?.role_name?.toLowerCase() || socket.user.role?.toLowerCase();
    
    if (socket.user.isAdmin || roleName === 'admin') {
      socket.join('room_admin');
    }
    if (['inventory', 'service', 'sale'].includes(roleName)) {
      socket.join(`room_${roleName}`);
    }

    // Lắng nghe sự kiện khách hàng chủ động Join phòng tùy ý (VD: vào phòng xem tiến độ chiếc xe X)
    socket.on('join_room', (roomName) => {
      socket.join(roomName);
      console.log(`👉 ${socket.user.email} đã vào phòng [${roomName}]`);
    });

    socket.on('leave_room', (roomName) => {
      socket.leave(roomName);
    });

    // Lúc mất kết nối
    socket.on('disconnect', () => {
      console.log(`🔴 Realtime | Thu hồi kết nối: [${socket.user?.email}]`.gray);
    });
  });

  return io;
};

// Hàm xuất io ra để các controller (như lúc Duyệt Đơn, Đổi Trạng Thái Sơn Xe...) gọi báo tới FE
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io chưa được khởi tạo!');
  }
  return io;
};
