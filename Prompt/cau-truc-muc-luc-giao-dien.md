# 📋 CẤU TRÚC MỤC LỤC BÁO CÁO - CHƯƠNG GIAO DIỆN

## CHƯƠNG 4. GIAO DIỆN

### 4.1 Frontend (Next.js)

---

#### 4.1.1 Trang chủ (Homepage)
- **URL:** `/`
- **Mô tả:** Trang landing page giới thiệu hệ thống
- **Hình minh họa:** 1 hình

---

#### 4.1.2 Xác thực người dùng (Authentication)
- **Các trang bao gồm:**
  | Trang | URL |
  |-------|-----|
  | Đăng nhập | `/sign-in` |
  | Đăng ký | `/sign-up` |
  | Quên mật khẩu | `/forgot-password` |
- **Hình minh họa:** 3 hình (mỗi trang 1 hình)

---

#### 4.1.3 Khóa học (Courses)
- **Các trang bao gồm:**
  | Trang | URL | Vai trò |
  |-------|-----|---------|
  | Danh sách khóa học (Public) | `/course` | Tất cả |
  | Chi tiết khóa học | `/course/[courseId]` | Tất cả |
  | Quản lý khóa học (Dashboard) | `/dashboard/courses` | Instructor/Admin |
  | Tạo khóa học | `/dashboard/courses/create` | Instructor/Admin |
  | Chỉnh sửa khóa học | `/dashboard/courses/[courseId]/edit` | Instructor/Admin |
  | Học viên xem bài học | `/dashboard/learning/[enrollmentId]` | Student |
- **Hình minh họa:** 5-6 hình

---

#### 4.1.4 Quiz / Bài kiểm tra
- **Các trang bao gồm:**
  | Trang | URL | Vai trò |
  |-------|-----|---------|
  | Ngân hàng câu hỏi (Public) | `/quiz` | Tất cả |
  | Chi tiết quiz (Public) | `/quiz/[quizId]` | Tất cả |
  | Làm bài kiểm tra | `/quiz/[quizId]/attempt/[attemptId]` | Student |
  | Kết quả bài kiểm tra | `/quiz/[quizId]/result/[attemptId]` | Student |
  | Quản lý quiz (Dashboard) | `/dashboard/quizzes` | Instructor/Admin |
  | Chi tiết quiz (Dashboard) | `/dashboard/quizzes/[quizId]` | Instructor/Admin |
  | Tạo quiz | `/dashboard/quizzes/create` | Instructor/Admin |
  | Chỉnh sửa quiz | `/dashboard/quizzes/[quizId]/edit` | Instructor/Admin |
- **Hình minh họa:** 6-8 hình

---

#### 4.1.5 Quản lý người dùng (User Management)
- **Các trang bao gồm:**
  | Trang | URL | Vai trò |
  |-------|-----|---------|
  | Danh sách người dùng | `/dashboard/users` | Admin |
  | (Modal) Thêm người dùng | - | Admin |
  | (Modal) Chỉnh sửa người dùng | - | Admin |
  | (Modal) Xóa người dùng | - | Admin |
- **Hình minh họa:** 3-4 hình

---

#### 4.1.6 Quản lý vai trò & quyền hạn (Roles & Permissions)
- **Các trang bao gồm:**
  | Trang | URL | Vai trò |
  |-------|-----|---------|
  | Danh sách vai trò | `/dashboard/roles` | Admin |
  | (Modal) Thêm vai trò | - | Admin |
  | (Modal) Chỉnh sửa vai trò | - | Admin |
  | Chi tiết quyền hạn | - | Admin |
- **Hình minh họa:** 3-4 hình

---

#### 4.1.7 AI Assistant
- **Các trang bao gồm:**
  | Trang | URL | Vai trò |
  |-------|-----|---------|
  | Trang chính AI | `/dashboard/ai-assistant` | Instructor/Admin |
  | Tạo khóa học bằng AI | `/dashboard/ai-assistant/course-generator` | Instructor/Admin |
  | Tạo quiz bằng AI | `/dashboard/ai-assistant/quiz-generator` | Instructor/Admin |
- **Hình minh họa:** 3 hình

---

#### 4.1.8 Thông tin cá nhân & Cài đặt
- **Các trang bao gồm:**
  | Trang | URL | Vai trò |
  |-------|-----|---------|
  | Dashboard Home | `/dashboard` | Tất cả (đã đăng nhập) |
  | Thông tin cá nhân | `/dashboard/profile` | Tất cả (đã đăng nhập) |
- **Hình minh họa:** 2 hình

---

## 📊 TỔNG KẾT

| STT | Mục | Số trang | Số hình (ước tính) |
|-----|-----|----------|-------------------|
| 4.1.1 | Trang chủ | 1 | 1 |
| 4.1.2 | Xác thực | 3 | 3 |
| 4.1.3 | Khóa học | 6 | 5-6 |
| 4.1.4 | Quiz | 8 | 6-8 |
| 4.1.5 | Quản lý người dùng | 4 | 3-4 |
| 4.1.6 | Vai trò & Quyền hạn | 4 | 3-4 |
| 4.1.7 | AI Assistant | 3 | 3 |
| 4.1.8 | Thông tin cá nhân | 2 | 2 |
| **TỔNG** | | **31** | **26-31** |

---

## 💡 GHI CHÚ

1. **Mỗi mục nên có:**
   - Mô tả ngắn gọn chức năng
   - Screenshot minh họa
   - Giải thích các thành phần chính trên giao diện

2. **Thứ tự sắp xếp:**
   - Theo flow người dùng (Landing → Auth → Học → Quiz → Quản lý)
   - Trang public trước, dashboard sau

3. **Với mỗi screenshot nên chú thích:**
   - Đánh số các vùng quan trọng
   - Giải thích chức năng từng vùng

---

*File này được tạo bởi AI Assistant để hỗ trợ viết báo cáo*
