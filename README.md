# 🐸 FROG STORE VIỆT NAM — HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ ẾCH CẢNH SỐNG

> **Nền tảng thương mại điện tử chuyên biệt cho ếch cảnh sống, phụ kiện bán cạn terrarium và thức ăn dinh dưỡng lưỡng cư hàng đầu Việt Nam.**  
> Triển khai full-stack không máy chủ (Serverless) trên nền tảng **Cloudflare Workers**, **Cloudflare D1**, **Cloudflare KV** và **React + Vite**.

[![Live Production](https://img.shields.io/badge/Production-Live-059669?style=for-the-badge&logo=cloudflare)](https://store.ngoctuls2005.workers.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Hono](https://img.shields.io/badge/Hono-E36002?style=for-the-badge&logo=hono&logoColor=white)](https://hono.dev/)

---

## 🌐 Trải Nghiệm Trực Tiếp
- **Production URL**: [https://store.ngoctuls2005.workers.dev](https://store.ngoctuls2005.workers.dev)
- **GitHub Repository**: [https://github.com/ngoctuls2005-dev/Frog_Store.git](https://github.com/ngoctuls2005-dev/Frog_Store.git)
- **Xác Thực Quản Trị**:
  - Quyền Admin được phân cấp chặt chẽ qua cơ chế RBAC và lưu trữ an toàn trong cơ sở dữ liệu.
  - Toàn bộ tài khoản và mật khẩu quản trị được gỡ bỏ khỏi mã nguồn public và client JS bundle để đảm bảo an toàn sản phẩm.

---

## 🛡️ Tiêu Chuẩn Bảo Mật & Pháp Lý (Security & Compliance)
- **Chuyển Hướng HTTPS Bắt Buộc & HSTS**: Tự động 301 Permanent Redirect mọi truy cập HTTP sang HTTPS, kích hoạt HSTS 1 năm (`max-age=31536000; includeSubDomains; preload`).
- **Bộ Security Headers Đầy Đủ**: 
  - `Content-Security-Policy`: Giới hạn nghiêm ngặt nguồn tải script, style, image và kết nối.
  - `X-Content-Type-Options: nosniff` (Chống MIME-type sniffing).
  - `X-Frame-Options: DENY` (Chống Clickjacking).
  - `Referrer-Policy: strict-origin-when-cross-origin`.
- **Bảo Vệ Dữ Liệu Cá Nhân (PII Concealment) & Rate Limiting**:
  - Tra cứu đơn hàng công khai tự động che giấu số điện thoại (`0988***456`), họ tên (`Nguyễn V** T*`), ẩn địa chỉ cụ thể và ẩn hoàn toàn tọa độ GPS đối với người tra cứu vãng lai. Chỉ chủ sở hữu đơn hàng (đã đăng nhập) hoặc Admin mới được xem đầy đủ thông tin.
  - Áp dụng Rate Limiting trên Cloudflare KV giới hạn tần suất đăng nhập và tra cứu đơn để chống vét cạn (Brute-force).
- **Tuân Thủ Pháp Lý CITES & Cơ Sở Khoa Học Sinh Học (L.A. Zoo)**:
  - 100% các dòng ếch phi tiêu (Dendrobatidae) là dòng sinh sản nhân tạo thế hệ F (Captive-Bred - CB), do thức ăn nuôi nhốt thiếu hụt họ kiến rừng và bọ cánh cứng chứa tiền chất alkaloid nên không tổng hợp được độc tố.
  - Đầy đủ chính sách: Quyền riêng tư (Privacy Policy), Điều khoản Dịch vụ & CITES Phụ lục II, Chính sách Vận chuyển & Cam kết Bảo hành Sống 100% khi nhận hàng (quay video unboxing trong 30 phút).
- **Tối Ưu Trải Nghiệm & Trợ Năng (A11y)**:
  - Tự động ẩn nút Chatbot nổi khi mở Giỏ hàng hoặc Thanh toán để tránh che khuất nội dung.
  - Bổ sung `aria-label` cho tất cả các thanh tìm kiếm, tra cứu và khung chat.
  - Sửa tiến độ trắc nghiệm hiển thị trực quan "🎯 Kết quả đề xuất".

---

## 🚀 Tính Năng Nổi Bật

### 1. 🔐 Hệ Thống Xác Thực & Phân Quyền Đa Tầng (RBAC)
- **Chuẩn Bảo Mật Web Crypto**:
  - Băm mật khẩu một chiều bằng thuật toán **PBKDF2-SHA256** với 100,000 vòng lặp và muối ngẫu nhiên (salt 16 bytes).
  - Cấp phát và xác thực phiên đăng nhập bằng **JSON Web Token (JWT)** chuẩn RFC-7519, chữ ký HMAC-SHA256.
- **Đăng Nhập & Liên Kết Google (Google One-Tap / OAuth)**:
  - Khách hàng có thể đăng nhập tức thì bằng tài khoản Google.
  - Hỗ trợ liên kết tài khoản Google với tài khoản mật khẩu hiện có trong phần Hồ sơ cá nhân.
  - Ràng buộc nghiêm ngặt: Mỗi tài khoản Google chỉ được liên kết duy nhất với một tài khoản Frog Store.
- **Bảo Toàn Giỏ Hàng Tuyệt Đối**:
  - Khách vãng lai mua hàng được lưu giỏ hàng tức thì trên **Cloudflare KV**.
  - Khi đăng nhập hoặc tạo tài khoản mới, giỏ hàng vãng lai được tự động hợp nhất vào giỏ hàng cá nhân trong **Cloudflare D1** và bảo toàn xuyên suốt qua mọi phiên đăng xuất.

### 2. 📍 Định Vị GPS Chính Xác & Tích Hợp Google Maps
- **Quét Vị Trí Người Dùng (GPS Geolocation)**:
  - Khi đặt hàng, khách hàng có thể bấm *"📍 Quét Vị Trí Của Tôi"*. Hệ thống truy vấn Geolocation API với độ chính xác cao (`enableHighAccuracy`).
  - Tích hợp Reverse Geocoding qua OpenStreetMap Nominatim tự động phân tích kinh độ / vĩ độ thành địa chỉ chi tiết (Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố).
- **Tích Hợp Google Maps trong Quản Trị**:
  - Đơn hàng lưu trữ tọa độ GPS chính xác.
  - Admin có thể nhấp mở trực tiếp vị trí giao hàng trên **Google Maps** để định tuyến xe giao hỏa tốc thùng xốp giữ ẩm.

### 3. 🐸 Bách Khoa 26+ Loài Ếch Cảnh Sống Thật 100%
- Bộ dữ liệu khoa học lưỡng cư (Herpetology) thực tế 100%, không bịa đặt:
  - **Họ Pacman (Ceratophryidae)**: Pacman Xanh, Albino Vàng, Samurai Cam, Pikachu Dâu Tây, Pacman Đỏ Mutant...
  - **Họ Ếch Cây (Hylidae / Phyllomedusidae)**: Ếch Cây Lùn Úc (Dumpy/White's), Cây Mắt Đỏ (Red-Eyed), Dumpy Bông Tuyết (Snowflake), Ếch Cây Sữa Amazon (Milk Frog)...
  - **Họ Ếch Phi Tiêu Độc (Dendrobatidae)**: Phi Tiêu Xanh Azureus, Bumblebee Vàng Đen, Ếch Dâu Tây Oophaga (100% dòng sinh sản nhân tạo CB, không có độc tố).
  - **Họ Cóc Lửa & Ếch Rêu**: Cóc Tía Bụng Đỏ Châu Á, Ếch Khổng Lồ Châu Phi Pixie (Bullfrog), Ếch Rêu Tam Đảo Việt Nam (*Theloderma corticale*)...
- **Hồ Sơ Chi Tiết Riêng Biệt (`FrogDetailPage`)**:
  - Thư viện ảnh tỷ lệ chuẩn, ảnh chụp thực tế không watermark.
  - Thước đo vi khí hậu trực quan: Nhiệt độ ban ngày, nhiệt độ ban đêm, dải độ ẩm an toàn.
  - 4 Tab nội dung chuyên sâu: Tập tính bản năng, Kỹ thuật setup bể Terrarium/Paludarium, Chế độ dinh dưỡng & Cho ăn, Cảnh báo y tế khẩn cấp (bệnh mềm xương MBD, da thẩm thấu và tắc ruột do sỏi dăm).
  - **Sticky Bottom Mobile Bar**: Thanh tóm tắt cố định chân màn hình điện thoại giúp người dùng mua nhanh chỉ với 1 chạm.

### 4. 🤖 Trợ Lý Ếch AI Thông Minh (`FrogAiChatbot`)
- **Tách biệt dữ liệu kỹ thuật**: Toàn bộ dữ liệu RAG Markdown và JSON facts chuyên biệt cho LLM được ẩn hoàn toàn khỏi giao diện người dùng thông thường để website luôn gọn gàng, tinh tế.
- **Floating Chatbot Widget**: Nút nổi tròn ở góc phải màn hình luôn sẵn sàng tư vấn trực tiếp cho khách hàng.
- Nắm vững kiến thức 26 loài ếch, trả lời tức thì các câu hỏi về môi trường sống, cách nuôi người mới bắt đầu, phân biệt loài độc/không độc, thực đơn dinh dưỡng và tự động gắn link dẫn tới hồ sơ cá thể tương ứng.

### 5. 📊 Bảng Quản Trị Admin Portal Chuyên Nghiệp
- Dashboard tổng quan: Doanh thu thực tế, số lượng đơn theo trạng thái, cảnh báo hết hàng/tồn kho thấp.
- Quản lý kho hàng ếch cảnh: Thêm mới, chỉnh sửa giá, thông số, cập nhật số lượng cá thể sống trong kho.
- Quản lý đơn hàng: Xem danh sách đơn, chi tiết giỏ hàng, thông tin GPS người nhận, cập nhật trạng thái đơn (Chờ xác nhận → Đang đóng thùng xốp → Đang giao hỏa tốc → Giao thành công / Đã hủy).
- Quản lý khách hàng: Phân quyền tài khoản (Khách hàng / Admin), kích hoạt hoặc tạm khóa tài khoản vi phạm.

---

## 🛠️ Kiến Trúc Kỹ Thuật

```
Frog_Store/
├── apps/
│   ├── api/                    # Cloudflare Worker Backend (Hono + TypeScript)
│   │   ├── src/
│   │   │   ├── index.ts        # API Routes, D1 Queries, KV Cart, Admin Endpoints
│   │   │   └── auth.ts         # PBKDF2 Web Crypto, JWT, Google OAuth & RBAC
│   │   ├── schema.sql          # CSDL Cloudflare D1 (Users, Products, Details, Orders)
│   │   ├── seed.sql            # Dữ liệu mẫu 26 loài ếch thật, danh mục & admin
│   │   └── wrangler.toml       # Cấu hình Cloudflare Worker, D1 Binding, KV Namespace
│   │
│   └── web/                    # Single Page Application (React 18 + Vite)
│       ├── src/
│       │   ├── App.tsx         # Trang chủ, Thanh tìm kiếm, Bộ lọc đa chiều, Cart Drawer
│       │   ├── FrogDetailPage.tsx # Trang hồ sơ sinh học chi tiết, Sticky Mobile Bar
│       │   ├── FrogAiChatbot.tsx  # Widget Trợ Lý Ếch AI thông minh (Floating FAB)
│       │   ├── AdminPortal.tsx # Bảng điều khiển quản trị viên chuyên sâu
│       │   ├── ProfileModal.tsx# Quản lý hồ sơ cá nhân & liên kết Google
│       │   ├── api.ts          # API Client giao tiếp backend
│       │   └── styles.css      # Design System phong cách Emerald / Modern Clean
│       └── vite.config.ts
│
├── scripts/
│   ├── download_new_frog_images.py # Tự động thu thập ảnh ếch chất lượng cao
│   └── generate_seed_sql.py        # Biên soạn CSDL sinh học & RAG AI
│
└── tests/                          # Bộ test tự động kiểm chứng stepwise-verified
    ├── verify_auth_crypto.py
    ├── verify_g02_google_api.py
    ├── verify_ui_01_hide_ai_raw.py
    ├── verify_ui_02_ai_chatbot.py
    ├── verify_ui_03_card_perfection.py
    ├── verify_ui_04_filter_and_quiz.py
    ├── verify_ui_05_cart_and_sticky.py
    └── verify_ui_06_production_e2e.py
```

---

## 💻 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local Setup)

### Yêu Cầu Môi Trường
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Python** 3.10+ (để chạy các script kiểm thử tự động)
- **Cloudflare Wrangler CLI**

### Các Bước Cài Đặt

1. **Clone repository về máy**:
   ```bash
   git clone https://github.com/ngoctuls2005-dev/Frog_Store.git
   cd Frog_Store
   ```

2. **Cài đặt dependencies**:
   ```bash
   npm install
   ```

3. **Chạy môi trường phát triển (Development)**:
   ```bash
   # Chạy Frontend Vite
   npm run dev -w apps/web
   ```
   Ứng dụng sẽ khả dụng tại địa chỉ: `http://localhost:5173`

4. **Build dự án**:
   ```bash
   npm run build
   ```

5. **Chạy bộ kiểm thử tự động**:
   ```bash
   python tests/verify_ui_06_production_e2e.py
   ```

---

## 🚀 Hướng Dẫn Triển Khai Lên Cloudflare (Deploy)

1. **Đăng nhập Cloudflare Wrangler**:
   ```bash
   npx wrangler login
   ```

2. **Khởi tạo Database D1 và KV Namespace (nếu triển khai trên tài khoản mới)**:
   ```bash
   npx wrangler d1 create store-db
   npx wrangler kv:namespace create CART
   ```
   *(Cập nhật `database_id` và `kv_namespaces.id` vào `apps/api/wrangler.toml`)*

3. **Áp dụng Schema & Nạp Dữ Liệu Lên D1 Remote**:
   ```bash
   npx wrangler d1 execute store-db --remote --file=apps/api/schema.sql --config apps/api/wrangler.toml
   npx wrangler d1 execute store-db --remote --file=apps/api/seed.sql --config apps/api/wrangler.toml
   ```

4. **Build và Deploy toàn bộ hệ thống**:
   ```bash
   npm run build
   npx wrangler deploy --config apps/api/wrangler.toml
   ```

---

## 📜 Giấy Phép & Bản Quyền
Dự án được xây dựng với mục đích học tập, nghiên cứu lưỡng cư học và phục vụ thương mại điện tử thú cưng sinh sản nhân tạo (Captive Bred - CB).  
Tất cả quyền được bảo lưu © 2026 **Frog Store Việt Nam**.

