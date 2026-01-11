# HƯỚNG DẪN CÀI ĐẶT VÀ TRIỂN KHAI HỆ THỐNG

Tài liệu này cung cấp hướng dẫn chi tiết về các bước cài đặt môi trường, cấu hình và triển khai mã nguồn cho hệ thống quản lý Gara Ô tô (bao gồm Backend, Frontend Website và Mobile App).

---

## 1. Yêu cầu Hệ thống (System Requirements)

Để đảm bảo hệ thống hoạt động ổn định, môi trường phát triển cần đáp ứng các yêu cầu sau:

### Môi trường Phần mềm
*   **Hệ điều hành:** Windows 10/11, macOS, hoặc Linux (Ubuntu 20.04+).
*   **Node.js:** Phiên bản `18.x` hoặc `20.x` (LTS).
*   **NPM (Node Package Manager):** Phiên bản đi kèm với Node.js.
*   **MongoDB:** Phiên bản `6.0` trở lên (Khuyến nghị dùng MongoDB Compass để quản lý).
*   **Flutter SDK:** Phiên bản `3.9.x` trở lên (đã bao gồm Dart SDK).
*   **Java Development Kit (JDK):** Phiên bản `11` hoặc `17` (cho Android build).
*   **Android Studio / Xcode:** Để giả lập thiết bị di động.

### Công cụ Phát triển
*   **Visual Studio Code:** Dùng cho phát triển Backend và Frontend.
*   **Android Studio:** Dùng cho phát triển và debug Mobile App.
*   **Git:** Để quản lý phiên bản mã nguồn.

---

## 2. Danh sách Công nghệ & Thư viện (Technology Stack)

### A. Backend (Server)
Hệ thống Backend được xây dựng trên nền tảng **Node.js** với Framework **Express**.

*   **Core:** `express` (v5.x), `dotenv`.
*   **Database ODM:** `mongoose` (v9.x).
*   **Authentication & Security:** `jsonwebtoken` (JWT), `bcryptjs`, `cors`.
*   **AI Integration:** `@google/generative-ai` (Gemini API 2.5).
*   **Email Service:** `nodemailer`.
*   **Payment Gateway:** Tích hợp `VNPay` và `PayPal`.
*   **File Handling:** `multer` (upload hình ảnh), `pdfkit` (xuất hóa đơn PDF).
*   **Logging:** `morgan`, `colors`.

### B. Frontend (Website)
Giao diện quản trị và khách hàng được xây dựng bằng **React.js**.

*   **Core:** `react` (v18.x), `react-dom`.
*   **Routing:** `react-router-dom` (v5.x).
*   **State Management:** `redux`, `react-redux`, `redux-thunk`, `redux-devtools-extension`.
*   **UI Frameworks:** `antd` (Ant Design), `react-bootstrap`, `tailwindcss`.
*   **HTTP Client:** `axios`.
*   **Authentication:** `@react-oauth/google`.
*   **Payment Integration:** `@paypal/react-paypal-js`.

### C. Mobile App (Staff App)
Ứng dụng dành cho nhân viên được phát triển bằng **Flutter**.

*   **Framework:** `flutter` (SDK 3.9.2).
*   **Language:** Dart.
*   **HTTP Client:** `dio` (v5.x).
*   **Local Storage:** `shared_preferences`.
*   **UI/Assets:** `google_fonts`, `cupertino_icons`.

---

## 3. Hướng dẫn Cài đặt & Cấu hình Chi tiết

### Bước 1: Cài đặt Backend
1.  Mở terminal tại thư mục gốc của dự án hoặc thư mục `backend`.
2.  Chạy lệnh cài đặt các thư viện phụ thuộc:
    ```bash
    npm install
    ```
3.  Tạo file `.env` tại thư mục `backend/` với nội dung cấu hình đầy đủ như sau:

    ```env
    # --- Server Configuration ---
    NODE_ENV=development
    PORT=5000

    # --- Database Connection (MongoDB) ---
    # Thay thế bằng chuỗi kết nối cục bộ hoặc Atlas của bạn
    MONGO_URI=mongodb://localhost:27017/gara_management

    # --- Security Keys ---
    # Chuỗi bí mật để mã hóa JWT Token (nên đặt chuỗi ngẫu nhiên dài)
    JWT_SECRET=your_jwt_secret_key_123

    # --- Payment Configuration (PayPal) ---
    # Client ID lấy từ PayPal Developer Dashboard (Sandbox)
    PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id

    # --- AI Configuration (Google Gemini) ---
    # API Key lấy từ Google AI Studio
    GEMINI_API_KEY=your_google_gemini_api_key

    # --- Email Service (SMTP) ---
    # Cấu hình gửi email thông báo (ví dụ sử dụng Gmail App Password)
    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=587
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_email_app_password
    ```

4.  **(Tùy chọn) Nạp dữ liệu mẫu:**
    Nếu cơ sở dữ liệu rỗng, có thể chạy script sau để tạo dữ liệu mẫu ban đầu:
    ```bash
    npm run data:import
    ```

### Bước 2: Cài đặt Frontend
1.  Di chuyển vào thư mục `frontend`:
    ```bash
    cd frontend
    ```
2.  Chạy lệnh cài đặt thư viện:
    ```bash
    npm install
    ```
    *Lưu ý: Frontend đã được cấu hình Proxy `http://127.0.0.1:5000` trong `package.json` để kết nối tới Backend.*

### Bước 3: Cài đặt Mobile App
1.  Mở thư mục `cars_management` bằng VS Code hoặc Android Studio.
2.  Tải các gói thư viện Flutter:
    ```bash
    flutter pub get
    ```
3.  **Cấu hình địa chỉ API:**
    Do thiết bị di động/máy ảo không hiểu `localhost` giống như web, cần cập nhật file `lib/services/api_config.dart`:

    *   **Máy ảo Android:** Sử dụng `http://10.0.2.2:5000/api`
    *   **Máy ảo iOS:** Sử dụng `http://localhost:5000/api`
    *   **Điện thoại thật:** Sử dụng địa chỉ IP mạng LAN của máy tính chạy Server (ví dụ: `http://192.168.1.10:5000/api`).

---

## 4. Hướng dẫn Vận hành (Execution)

### Khởi chạy Server và Website
Để thuận tiện, có thể chạy đồng thời cả Backend và Frontend từ thư mục gốc của dự án:

```bash
npm run dev
```

*   **Backend** sẽ khởi động tại cổng `5000`.
*   **Frontend** sẽ tự động mở trình duyệt tại địa chỉ `http://localhost:3000`.

### Khởi chạy Ứng dụng Mobile
Đảm bảo đã mở máy ảo hoặc kết nối thiết bị thật, sau đó chạy lệnh tại thư mục dự án Mobile:

```bash
flutter run
```

---
*Hoàn tất quy trình cài đặt và sẵn sàng cho việc báo cáo/demo.*