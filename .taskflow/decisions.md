# Nhật ký quyết định & Kiểm chứng (.taskflow/decisions.md)

## Khởi tạo dự án: Frog Store (2026-10-28T07:44:57Z)
- **Mục tiêu:** Xay dung va trien khai hoan chinh Web ban ech canh song len Cloudflare Wrangler voi DB cai tien va thong tin chuan xac

### [T01] Ghi chú quyết định (2026-10-28T07:55:29Z)
- **Vì sao (Why):** Thiet ke lai CSDL toan dien cho Frog Store chuyen ech canh song
- **Thay đổi & Tác động (Change):** Tao schema 4 bang (categories, products, orders, order_items), seed 16 loai ech chuan gia thi truong va tai 16 anh goc chat luong cao khong watermark

### [T01] VERIFIED (2026-10-28T07:55:34Z)
- **Test tự động:** 1 lệnh PASS

### [T02] Ghi chú quyết định (2026-10-28T07:57:07Z)
- **Vì sao (Why):** Xay dung day du backend API cho Frog Store
- **Thay đổi & Tác động (Change):** Them routes /categories, /products (tim kiem, loc theo phan loai, do kho, sap xep), /products/:id, /orders (tao don hang luu D1 va tra ma FROG-XXXXXX), /orders/:code, hydrate gio hang voi DB moi va da pass typecheck

### [T02] VERIFIED (2026-10-28T07:57:12Z)
- **Test tự động:** 1 lệnh PASS

### [T03] Ghi chú quyết định (2026-10-28T08:00:34Z)
- **Vì sao (Why):** Hoan thien UI/UX cho Frog Store chuyen ech canh song
- **Thay đổi & Tác động (Change):** Xay dung day du components: Announcement bar, Topbar tim kiem & gio hang, Hero section thien nhien terrarium, Tabs loc phan loai, Dropdown do kho & sap xep, Thẻ ếch chuẩn giá và thông số, Modal Quick View thông số sinh học & hướng dẫn nuôi, Drawer giỏ hàng, Modal đặt hàng Live Pet có cam kết bảo hành sống, Modal tra cứu đơn hàng, và Footer chính sách. Build dist thành công

### [T03] VERIFIED (2026-10-28T08:00:38Z)
- **Test tự động:** 1 lệnh PASS

### [T04] Ghi chú quyết định (2026-10-28T08:02:38Z)
- **Vì sao (Why):** Cau hinh Cloudflare Wrangler va dong bo CSDL D1 remote
- **Thay đổi & Tác động (Change):** Cap nhat apps/api/wrangler.toml voi database_id 691b9a4c-273f-41c1-ab89-bc4162699b20 va kv id 26c77d60e71c40f491909c57983215d8. Khoi tao thanh cong schema va seed 16 loai ech len Cloudflare D1 remote

### [T04] VERIFIED (2026-10-28T08:02:47Z)
- **Test tự động:** 1 lệnh PASS

### [T05] Ghi chú quyết định (2026-10-28T08:05:14Z)
- **Vì sao (Why):** Kiem tra toan dien va nghiem thu deploy Frog Store len Cloudflare Wrangler
- **Thay đổi & Tác động (Change):** Chay thanh cong npm run typecheck, npm run build va npm run deploy. Nghiem thu production URL https://store.ngoctuls2005.workers.dev hoat dong on dinh 200 OK, co day du 5 danh muc, 16 loai ech dung gia thi truong va anh khong watermark, API dat hang va tra cuu van hanh hoan hao tren Cloudflare D1 va KV

### [T05] VERIFIED (2026-10-28T08:05:22Z)
- **Test tự động:** 1 lệnh PASS

### [AUTH-01] Ghi chú quyết định (2026-10-28T08:20:19Z)
- **Vì sao (Why):** Cai tien CSDL he thong phan quyen User va Admin
- **Thay đổi & Tác động (Change):** Them bang users (hash/salt PBKDF2), bang user_carts de giu gio hang khi logout, cap nhat orders co user_id, va seed tai khoan admin@frogstore.vn

### [AUTH-01] VERIFIED (2026-10-28T08:20:27Z)
- **Test tự động:** 1 lệnh PASS

### [AUTH-02] Ghi chú quyết định (2026-10-28T08:23:03Z)
- **Vì sao (Why):** Xay dung module bao mat Web Crypto API tren Cloudflare Workers
- **Thay đổi & Tác động (Change):** Trien khai apps/api/src/auth.ts: generateSalt, hashPassword bang PBKDF2 (100.000 vong), verifyPassword timing-safe, signJwt va verifyJwt HS256, getAuthUser middleware. Typecheck 0 loi va test verify_auth_crypto dat PASS

### [AUTH-02] VERIFIED (2026-10-28T08:23:31Z)
- **Test tự động:** 1 lệnh PASS

### [AUTH-03] Ghi chú quyết định (2026-10-28T08:26:12Z)
- **Vì sao (Why):** Xay dung API Khach hang va dong bo gio hang theo tai khoan
- **Thay đổi & Tác động (Change):** Them routes /auth/register, /auth/login, /auth/me, /user/profile, /user/password, /user/orders, /user/orders/:code/cancel. Dong bo gio hang vao bang user_carts de giu nguyen khi logout, merge gio hang guest khi login

### [AUTH-03] VERIFIED (2026-10-28T08:26:53Z)
- **Test tự động:** 1 lệnh PASS

### [AUTH-04] Ghi chú quyết định (2026-10-28T08:28:31Z)
- **Vì sao (Why):** Cung cap bo API quan tri toan dien cho Admin voi RBAC middleware, phan chia bao mat nghiem ngat va quan ly van hanh 16 loai ech cung don hang live pets
- **Thay đổi & Tác động (Change):** Them requireAdmin middleware va 9 RESTful endpoints: /admin/stats, CRUD /admin/products, quan ly don hang va status /admin/orders/:id/status, quan ly khach hang /admin/users/:id/status

### [AUTH-04] VERIFIED (2026-10-28T08:28:37Z)
- **Test tự động:** 1 lệnh PASS

### [AUTH-05] Ghi chú quyết định (2026-10-28T08:34:06Z)
- **Vì sao (Why):** Hoan thien UI Khach hang cho phep Dang nhap / Dang ky tai khoan, bao toan gio hang khi logout, quan ly va huy don ca nhan
- **Thay đổi & Tác động (Change):** Cap nhat api.ts voi ham auth/orders/token; them Auth Modal (chuyen tab login/register + demo creds), Modal Don mua cua toi, header user pill va co che bao toan du lieu gio hang

### [AUTH-05] VERIFIED (2026-10-28T08:34:11Z)
- **Test tự động:** 1 lệnh PASS

### [AUTH-06] Ghi chú quyết định (2026-10-28T08:35:26Z)
- **Vì sao (Why):** Cung cap bang quan tri Admin Portal day du chuc nang giup quan ly 16 loai ech, don hang live pets va nguoi dung voi RBAC nghiem ngat
- **Thay đổi & Tác động (Change):** Xay dung AdminPortal.tsx gom 4 tab (Tong quan KPI, Quan ly ech canh CRUD voi thong so sinh hoc, Quan ly don hang live pets va trang thai, Quan ly phan quyen nguoi dung); tich hop vao App.tsx voi nut khoa admin va kiem tra quyen role === admin

### [AUTH-06] VERIFIED (2026-10-28T08:35:31Z)
- **Test tự động:** 1 lệnh PASS

### [AUTH-07] Ghi chú quyết định (2026-10-28T08:41:07Z)
- **Vì sao (Why):** Trien khai toan dien he thong Auth & RBAC & Admin Portal len Cloudflare production va kiem chung nghiem thu end-to-end
- **Thay đổi & Tác động (Change):** Khoi tao schema va seed moi len D1 remote; build bundle web va worker; deploy thanh cong len Wrangler; chay bo test verify_auth_deploy.py kiem chung catalog, login khach hang, login admin, chan 403 RBAC, persistent cart va quy trinh don hang

### [AUTH-07] VERIFIED (2026-10-28T08:41:17Z)
- **Test tự động:** 1 lệnh PASS

### [AUTH-G01] Ghi chú quyết định (2026-10-28T08:56:26Z)
- **Vì sao (Why):** Mo rong CSDL de luu tru Google ID duy nhat, anh avatar va toa do GPS giao hang hhoa toc
- **Thay đổi & Tác động (Change):** Cap nhat apps/api/schema.sql va seed.sql: bo sung google_id (UNIQUE index), avatar_url, latitude, longitude trong users va orders; re-init local D1 thanh cong

### [AUTH-G01] VERIFIED (2026-10-28T08:56:38Z)
- **Test tự động:** 1 lệnh PASS

### [AUTH-G02] Ghi chú quyết định (2026-10-28T08:59:10Z)
- **Vì sao (Why):** Xay dung backend endpoints dang nhap, dang ky va lien ket tai khoan Google voi rang buoc doc quyen 1-1
- **Thay đổi & Tác động (Change):** Them /auth/google, /user/link-google, /user/unlink-google; them parseGoogleToken trong auth.ts; chan 409 khi google_id da duoc lien ket boi tai khoan khac

### [AUTH-G02] VERIFIED (2026-10-28T08:59:14Z)
- **Test tự động:** 1 lệnh PASS

### [AUTH-G03] Ghi chú quyết định (2026-10-28T09:00:59Z)
- **Vì sao (Why):** Chan khach vang lai dat hang, bat buoc dang nhap de bao dam quyen loi bao hanh song 100%, dong thoi luu toa do GPS giao hang
- **Thay đổi & Tác động (Change):** Cap nhat POST /orders tra ve 401 AUTH_REQUIRED neu chua dang nhap; them cot va bind latitude, longitude vao don hang va tu dong luu toa do mac dinh cho nguoi dung

### [AUTH-G03] VERIFIED (2026-10-28T09:01:03Z)
- **Test tự động:** 1 lệnh PASS

### [AUTH-G04] Ghi chú quyết định (2026-10-28T09:08:01Z)
- **Vì sao (Why):** Cung cap giao dien Ho so ca nhan, nut Dang nhap Google SVG chuan va lien ket tai khoan Google truc quan
- **Thay đổi & Tác động (Change):** Xay dung ProfileModal.tsx voi 2 tab (Thong tin ca nhan, Lien ket Google va doi mat khau); tich hop Google Sign-In button vao Auth modal; cap nhat api.ts cac ham link/unlink Google

### [AUTH-G04] VERIFIED (2026-10-28T09:08:07Z)
- **Test tự động:** 1 lệnh PASS

### [AUTH-G05] Ghi chú quyết định (2026-10-28T09:08:32Z)
- **Vì sao (Why):** Tich hop kha nang quet vi tri GPS tu thiet bi nguoi dung de lay toa do va dia chi chinh xac cho van chuyen live pets
- **Thay đổi & Tác động (Change):** Them handleScanGpsLocation va handleGetLocation su dung HTML5 Geolocation API, reverse geocoding tu dong phan tich dia chi tieng Viet va hien thi huy hieu toa do

### [AUTH-G05] VERIFIED (2026-10-28T09:08:37Z)
- **Test tự động:** 1 lệnh PASS

### [AUTH-G06] Ghi chú quyết định (2026-10-28T09:09:32Z)
- **Vì sao (Why):** Cai thien toan dien UI/UX theo he thong ui_ux_pro_max gom bang mau Emerald/Orange, Toast alerts, the chan dat hang khi chua dang nhap va link Google Maps trong AdminPortal
- **Thay đổi & Tác động (Change):** Cap nhat styles.css voi cac lop btn-google-login, toast-card, guest-lock-banner, btn-maps-link; cap nhat AdminPortal.tsx hien thi link Google Maps dan duong cho shipper; tich hop Toast notification vao App.tsx

### [AUTH-G06] VERIFIED (2026-10-28T09:09:38Z)
- **Test tự động:** 1 lệnh PASS

### [AUTH-G07] Ghi chú quyết định (2026-10-28T09:15:31Z)
- **Vì sao (Why):** Xac nhan deploy thanh cong va chay bo kiem thu E2E tu dong verify_g07_production.py xac thuc toan dien 7 yeu cau tren production URL https://store.ngoctuls2005.workers.dev
- **Thay đổi & Tác động (Change):** Chay verify_g07_production.py dat 7/7 tieu chi: 1. Chan khach vang lai (401), 2. Luu tru ho so day du GPS/Avatar, 3. Dang ky/Dang nhap Google, 4. Lien ket Google & dang nhap cheo, 5. Chan lien ket 1-1 (409), 6. Luu toa do GPS vao don hang, 7. UI/UX assets responsive

### [AUTH-G07] VERIFIED (2026-10-28T09:15:41Z)
- **Test tự động:** 1 lệnh PASS

### [DETAIL-01] Ghi chú quyết định (2026-10-28T09:35:51Z)
- **Vì sao (Why):** Mo rong CSDL D1 cho ho so ech chi tiet va toi uu AI doc/truy van
- **Thay đổi & Tác động (Change):** Cap nhat apps/api/schema.sql: them cot slug, habitat_type, gallery_images_json vao bang products; tao bang frog_species_details voi 32 truong thong so dinh luong/dinh tinh, ai_knowledge_snippet Markdown va ai_facts_json; tao cac index idx_products_slug va idx_frog_details_product_id

### [DETAIL-01] VERIFIED (2026-10-28T09:35:57Z)
- **Test tự động:** 1 lệnh PASS

### [DETAIL-02] Ghi chú quyết định (2026-10-28T09:43:11Z)
- **Vì sao (Why):** Xay dung bo du lieu 26 loai ech that 100%, anh that khong watermark va thong so herpetology khoa hoc
- **Thay đổi & Tác động (Change):** Cap nhat apps/api/seed.sql bo sung 26 loai ech that (Pacman, Ech Cay, Phi Tieu, Ech Bo, Ech Reu VN...), tai va luu tru 10 anh goc chat luong cao khong watermark vao apps/web/public/images/frogs/, sinh day du thong so chuong nuoi dinh luong, dinh duong, canh bao va AI fact sheet

### [DETAIL-02] VERIFIED (2026-10-28T09:43:15Z)
- **Test tự động:** 1 lệnh PASS

### [DETAIL-03] Ghi chú quyết định (2026-10-28T09:46:13Z)
- **Vì sao (Why):** Cung cap bo API lay chi tiet ho so sinh hoc cua tung loai ech va endpoint chuyen biet cho AI/RAG doc tri thuc
- **Thay đổi & Tác động (Change):** Cap nhat apps/api/src/index.ts: them types FrogSpeciesDetails; nang cap GET /products ho tro loc habitat_type va parse gallery_images; nang cap GET /products/:idOrSlug ho tro ca ID so va slug, tra ve full ho so sinh hoc 1-1; them GET /ai/frogs/knowledge va GET /ai/frogs/:slug (ho tro ?format=markdown)

### [DETAIL-03] VERIFIED (2026-10-28T09:46:20Z)
- **Test tự động:** 1 lệnh PASS

### [DETAIL-04] Ghi chú quyết định (2026-10-28T09:50:12Z)
- **Vì sao (Why):** Xay dung component trang chi tiet ech FrogDetailPage chuyen sau voi thu vien anh zoom, climate gauge, 4 tab thong so sinh hoc that va AI fact sheet
- **Thay đổi & Tác động (Change):** Tao apps/web/src/FrogDetailPage.tsx; cap nhat api.ts voi Product, FrogSpeciesDetails, productDetail, aiKnowledge; bo sung toan bo CSS chuyen sau vao apps/web/src/styles.css

### [DETAIL-04] VERIFIED (2026-10-28T09:50:17Z)
- **Test tự động:** 1 lệnh PASS

### [DETAIL-05] Ghi chú quyết định (2026-10-28T09:54:58Z)
- **Vì sao (Why):** Nang cap manh me UI/UX trang chu voi bo loc da chieu (Habitat, Khoang gia), live search, the san pham sinh thai va widget Frog Matcher Quiz
- **Thay đổi & Tác động (Change):** Cap nhat apps/web/src/App.tsx: them bo loc habitat_type va priceRange; them widget 'Tro Thu Tim Ech' 3 cau hoi trac nghiem de xuat loai ech phu hop; cai tien the san pham voi card-habitat-badge va nut Chi Tiet; build Vite clean 0 loi

### [DETAIL-05] VERIFIED (2026-10-28T09:55:10Z)
- **Test tự động:** 1 lệnh PASS

### [DETAIL-06] Ghi chú quyết định (2026-10-28T09:56:59Z)
- **Vì sao (Why):** Hoan thien he thong Routing Deep Linking, chia se link san pham va dong bo gio hang so luong lon tu trang chi tiet
- **Thay đổi & Tác động (Change):** Trien khai hash router regex #/frogs/:slug trong App.tsx; nut chia se sao chep direct URL trong FrogDetailPage.tsx; ho tro param qty trong api.add va POST /cart/items de them nhieu con ech cung luc vao gio; build web va api typecheck deu dat 0 loi

### [DETAIL-06] VERIFIED (2026-10-28T09:57:20Z)
- **Test tự động:** 1 lệnh PASS

### [DETAIL-07] Ghi chú quyết định (2026-10-28T10:00:46Z)
- **Vì sao (Why):** Xac nhan deploy toan dien len Cloudflare D1 Remote va Worker production https://store.ngoctuls2005.workers.dev, chay verify_detail_07_production.py dat 8/8 muc kiem thu
- **Thay đổi & Tác động (Change):** Nap migration schema va seed 26 loai ech len Remote D1 store-db; build Vite web; deploy Worker len Cloudflare version e1cf3e0b-3341-4534-bbec-71e205b7a66b; test live E2E xac nhan catalog 26 loai, anh khong watermark, trang chi tiet, bo loc da chieu, API AI va gio hang hoat dong hoan hao 100%

### [DETAIL-07] VERIFIED (2026-10-28T10:01:04Z)
- **Test tự động:** 1 lệnh PASS

### [UI-01] Ghi chú quyết định (2026-10-29T06:56:09Z)
- **Vì sao (Why):** Loai bo khoi raw code block AI fact sheet khoi giao dien nguoi dung nham dam bao tinh tham my chuyen nghiep
- **Thay đổi & Tác động (Change):** Xoa khoi .ai-snippet-card, nut Sao chep Fact Sheet Markdown va ham handleCopyAiSheet trong apps/web/src/FrogDetailPage.tsx; giu nguyen 4 tab sinh hoc va du lieu backend cho AI chatbot

### [UI-01] VERIFIED (2026-10-29T06:56:20Z)
- **Test tự động:** 1 lệnh PASS

### [UI-02] Ghi chú quyết định (2026-10-29T07:00:07Z)
- **Vì sao (Why):** Chuyen doi du lieu ky thuat AI thanh widget Chatbot tro ly thong minh thay vi de lo tren UI
- **Thay đổi & Tác động (Change):** Tao component FrogAiChatbot.tsx voi 4 quick prompts, lien ket CSDL AI, tich hop vao App.tsx va them styles hoan chinh

### [UI-02] VERIFIED (2026-10-29T07:00:18Z)
- **Test tự động:** 1 lệnh PASS

### [UI-03] Ghi chú quyết định (2026-10-29T07:03:02Z)
- **Vì sao (Why):** Loai bo modal QuickView thua thai va dong bo the san pham thang hang, bam vao the dan thang toi FrogDetailPage
- **Thay đổi & Tác động (Change):** Xoa quickView state va modal trong App.tsx, bo sung click router cho card img va title, them min-height va line-clamp-2 cho card trong styles.css

### [UI-03] VERIFIED (2026-10-29T07:03:12Z)
- **Test tự động:** 1 lệnh PASS

### [UI-04] Ghi chú quyết định (2026-10-29T07:08:03Z)
- **Vì sao (Why):** Nang cap trai nghiem tim kiem voi nut clear tuc thi va bo loc capsule khong loi tren mobile
- **Thay đổi & Tác động (Change):** Them nut btn-search-clear, search-result-banner trong App.tsx, scrollbar-width none va animation cho capsule tabs trong styles.css

### [UI-04] VERIFIED (2026-10-29T07:08:13Z)
- **Test tự động:** 1 lệnh PASS

### [UI-05] Ghi chú quyết định (2026-10-29T07:10:20Z)
- **Vì sao (Why):** Hoan thien trai nghiem mua hang voi bo tang giam so luong truc tiep trong cart va sticky bottom bar tren mobile
- **Thay đổi & Tác động (Change):** Bo sung sticky-mobile-buy-bar vao FrogDetailPage.tsx, them responsive styles trong styles.css va kiem chung cart drawer controls

### [UI-05] VERIFIED (2026-10-29T07:10:30Z)
- **Test tự động:** 1 lệnh PASS

### [UI-06] Ghi chú quyết định (2026-10-29T07:14:00Z)
- **Vì sao (Why):** Trien khai toan bo cac cai tien UI/UX len moi truong Cloudflare Production va nghiem thu truc tiep
- **Thay đổi & Tác động (Change):** Build frontend 0 warning, deploy wrangler len store.ngoctuls2005.workers.dev va test E2E 5 buoc xac thuc 100% thanh cong

### [UI-06] VERIFIED (2026-10-29T07:14:07Z)
- **Test tự động:** 1 lệnh PASS

