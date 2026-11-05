# Ly's Notes

Ứng dụng ghi chú cá nhân lấy bố cục trang chủ từ trang Notion **Unihan**, với tông xanh dương. Chạy trên điện thoại và máy tính bằng GitHub Pages. Không cần bước build, không cần Supabase.

## Đã có

- Trang chủ gồm 6 nhóm và 29 trang con theo trang Notion mẫu; từng trang có liên kết về trang gốc để đối chiếu.
- Tạo trang và trang con, sửa tiêu đề, chọn emoji, đánh dấu yêu thích, tìm kiếm, xóa trang, xuất bản sao JSON.
- Trình soạn thảo khối cơ bản: văn bản, tiêu đề, gạch đầu dòng, trích dẫn và việc cần làm. Gõ `/h1`, `/h2`, `/bullet`, `/quote`, `/todo` rồi nhấn Space để đổi kiểu.
- Tải ảnh bìa từ thiết bị. Ghi chú được lưu trong trình duyệt ngay cả khi chưa kết nối GitHub.
- Đồng bộ nhiều thiết bị qua **GitHub Gist**, tương tự app tiếng Trung của bạn.
- Thêm nhóm ở cuối trang chủ, thêm mục con trong từng nhóm, và thu gọn danh sách trang con ở thanh bên.
- Trong trang ghi chú, dùng thanh công cụ hoặc gõ `/photo`, `/columns`, `/link`, `/Process` rồi nhấn Space. Khối Process gồm ghi chú, ảnh minh họa và mũi tên tự giãn theo nội dung; bấm dấu + để thêm bước.
- Gõ `/` trong khối văn bản để mở danh sách lệnh; chọn bằng chuột hoặc phím mũi tên và Enter.
- Bấm dấu `⋮` cạnh khối để xóa. App luôn hỏi xác nhận trước khi xóa trang, khối hoặc bước Process. Ngay sau khi xóa, nhấn **Ctrl+Z** (Mac: **⌘Z**) để hoàn tác trong phiên đang mở.
- Di chuột vào thẻ nhóm ở trang chủ và bấm **🎨 Màu** để chọn màu hoặc nhập mã HEX như `#4A8EE8`.
- Trang con được hiển thị thành thẻ ngay trong trang cha; tên thẻ tự lấy từ tiêu đề trang con.
- Khối **Chia cột** có nút **+** bên phải để thêm cột. Có thể đổi vị trí bằng nút ←/→ hoặc kéo tay nắm ⠿.
- Khối **Bảng** có thể tạo bằng thanh công cụ hoặc `/table`, thêm hàng và cột, đổi thứ tự bằng nút mũi tên hoặc kéo tay nắm ⠿.

Nội dung bên trong các trang Notion con chưa được sao chép tự động. Bản đầu đã nhập cấu trúc, tên trang và liên kết gốc.

## Đưa lên GitHub Pages

1. Tạo repository mới trên GitHub. Tải **nội dung trong thư mục này** lên nhánh `main` ở thư mục gốc của repository.
2. Vào **Settings → Pages → Build and deployment**.
3. Chọn **Deploy from a branch**, nhánh `main`, thư mục `/(root)`, rồi **Save**.
4. Mở địa chỉ `https://TEN-TAI-KHOAN.github.io/TEN-REPOSITORY/`.

Ứng dụng dùng đường dẫn `#...` nên hoạt động ở cả GitHub Pages dạng repository.

## Đồng bộ qua GitHub Gist

1. Trên **máy đang có ghi chú chính**, mở app → **☁️ Đồng bộ & sao lưu**.
2. Bấm liên kết tạo mã truy cập GitHub. Kiểm tra quyền **`gist`** và chọn thời hạn phù hợp. Sao chép mã vừa tạo.
3. Dán mã vào app → **Kết nối**. App tạo một Gist không được liệt kê công khai để lưu ghi chú.
4. Trên điện thoại, mở **cùng đường dẫn GitHub Pages**, vào **Đồng bộ & sao lưu**, dán mã truy cập của **cùng tài khoản GitHub** và kết nối.
5. Nếu thiết bị thứ hai đã có ghi chú riêng, app sẽ hỏi chọn **bản trên GitHub** hay **bản trên thiết bị**. Bạn nên tải file sao lưu trước khi chọn.

Sau khi kết nối, app tự gửi thay đổi, kiểm tra khi quay lại app và mỗi 30 giây khi đang mở. Nếu mất mạng, thay đổi vẫn ở trên thiết bị và sẽ thử gửi lại. Khi chuyển thiết bị, hãy chờ thiết bị vừa dùng hiện **Đã đồng bộ** trước.

Mã truy cập được lưu trong bộ nhớ trình duyệt trên từng thiết bị, không nằm trong mã nguồn hay file sao lưu. **Đừng gửi mã trong chat hoặc đưa lên repository.** Nếu mã hết hạn, ngắt kết nối trên thiết bị rồi tạo mã mới; Gist vẫn còn. Mã có quyền truy cập các Gist của tài khoản GitHub. Gist không được liệt kê công khai nhưng **ai có đường dẫn vẫn có thể đọc nội dung**.

Nếu hai thiết bị cùng sửa trước khi đồng bộ, app sẽ yêu cầu bạn chọn bản chính. Hiện app chưa tự gộp hai bản ghi chú.

## Chạy thử trên máy

Mở `index.html` qua máy chủ tĩnh, ví dụ `python -m http.server 8000`, rồi vào `http://localhost:8000/`. Có thể dùng chế độ lưu trên thiết bị mà không kết nối GitHub.

## Thay ảnh và nội dung

- Bấm **Thêm ảnh bìa** ở góc dưới ảnh bìa.
- Bấm emoji đầu trang để đổi biểu tượng.
- Dùng **Trang mới** ở thanh bên. Khi đang mở một trang, trang mới sẽ nằm bên trong trang đó.
- Các trang Notion gốc chỉ là liên kết tham khảo. Bạn có thể nhập nội dung vào ứng dụng theo từng trang.

Ảnh bìa được nén và lưu cùng ghi chú. Với nhiều ảnh, dữ liệu Gist có thể lớn; bước sau có thể tách ảnh sang nơi lưu khác nếu cần.
