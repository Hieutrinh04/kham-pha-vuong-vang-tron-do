# Trò chơi Tròn Đỏ và Vuông Vàng (bản web)

3 màn chơi cho trẻ mẫu giáo 4–5 tuổi: **Đút bánh cho quái vật** (hình tròn/vuông), **Cơn mưa bong bóng** (màu đỏ/vàng), **Xây tháp phép thuật** (hình + màu).

## Chạy thử
Nháy đúp `index.html` (Chrome/Edge) – không cần máy chủ, không cần mạng (trừ phông chữ Google).

## Đưa lên GitHub Pages
1. Tạo repository mới trên GitHub (ví dụ `tro-choi-tron-vuong`).
2. Tải **toàn bộ nội dung thư mục này** lên (index.html, css/, js/, hinh/, audio/, .nojekyll) – để `index.html` ở thư mục gốc của repo.
3. Vào **Settings → Pages → Build and deployment → Branch: main, thư mục / (root) → Save**.
4. Sau 1–2 phút trang chạy tại `https://<tên-tài-khoản>.github.io/<tên-repo>/`.

## Tùy chỉnh
- Nút "Đọc truyện" trên thanh trên cùng: mở `js/game.js`, dán link truyện vào dòng `const STORY_URL = '';`.
- Mở thẳng một màn: thêm `?man=1`, `?man=2` hoặc `?man=3` vào địa chỉ.
- Sao của bé lưu trên trình duyệt (localStorage). Nút "Xoá hết sao" nằm trong bảng sao ⭐.
- Lời thoại nằm trong `js/data.js`, giọng đọc MP3 trong `audio/` (tên file = mã lời thoại).
