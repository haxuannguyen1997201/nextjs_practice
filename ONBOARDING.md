# Tài Liệu Onboarding — Shop Product Manager

> Dành cho người mới join project. Đọc từ trên xuống sẽ hiểu được toàn bộ hệ thống.

---

## 1. Tổng Quan Business

Đây là một ứng dụng **quản lý sản phẩm cho một cửa hàng** (shop). Người dùng nội bộ (nhân viên) có thể:

| Chức năng | Mô tả |
|-----------|-------|
| Đăng nhập | Xác thực bằng username + password |
| Xem danh sách sản phẩm | Bảng sản phẩm, có tìm kiếm, lọc màu, sắp xếp |
| Thêm sản phẩm | Form nhập thông tin sản phẩm mới |
| Sửa sản phẩm | Click vào sản phẩm → chỉnh sửa thông tin |
| Xóa sản phẩm | Xóa từ danh sách (có confirm) |
| Đăng xuất | Xóa session, về lại trang login |

Toàn bộ dữ liệu sản phẩm được lấy từ một **API bên ngoài** (REST). Không có database riêng trong project này.

---

## 2. Công Nghệ Sử Dụng

| Công nghệ | Vai trò |
|-----------|---------|
| **Next.js 16** (App Router) | Framework chính — routing, server/client components, server actions |
| **React 19** | UI library |
| **Redux Toolkit + RTK Query** | Quản lý state và gọi API CRUD sản phẩm |
| **React Hook Form + Zod** | Form và validation |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |

---

## 3. Cấu Trúc Thư Mục

```
nextjs_project/
│
├── proxy.ts                    ← Next.js Middleware — bảo vệ route bằng cookie
│
├── app/                        ← Next.js App Router (routing chính)
│   ├── layout.tsx              ← Layout toàn app (bọc StoreProvider)
│   ├── page.tsx                ← Trang chủ "/" — danh sách sản phẩm (client)
│   ├── login/page.tsx          ← Trang "/login" — form đăng nhập (client)
│   ├── add/page.tsx            ← Trang "/add" — thêm sản phẩm (client)
│   ├── detail/[productId]/     ← Trang "/detail/:id" — sửa sản phẩm (server)
│   │   └── page.tsx
│   └── actions/
│       └── auth.ts             ← Server actions: loginAction, logoutAction
│
└── src/
    ├── types.ts                ← TypeScript type: ShopProduct
    ├── api/
    │   └── productFormModel.js ← Schema Zod + helpers convert dữ liệu form
    ├── store/
    │   ├── store.js            ← Cấu hình Redux store
    │   ├── productsApi.js      ← RTK Query API (CRUD sản phẩm)
    │   └── StoreProvider.tsx   ← Bọc <Provider> cho toàn app
    └── component/
        ├── ProductDetailScreen.tsx ← UI form sửa sản phẩm (client)
        ├── ProductTable.tsx        ← Bảng danh sách sản phẩm
        ├── FilterView.tsx          ← Sidebar lọc theo màu
        ├── Toolbar.tsx             ← Thanh tìm kiếm + nút Add
        ├── ProductForm.tsx         ← Form dùng chung cho Add và Edit
        ├── FormField.tsx           ← Component ô input dùng chung
        └── FormActions.tsx         ← Nút Submit/Cancel dùng chung
```

---

## 4. Khái Niệm Quan Trọng

### 4.1 Server Component vs Client Component

Next.js App Router có hai loại component:

```
Server Component (mặc định)     Client Component ('use client')
─────────────────────────────   ──────────────────────────────
Chạy trên server                Chạy trên browser
Có thể đọc cookies, env...      Có thể dùng hooks (useState,
Không có state / hooks          useEffect, useRouter...)
Render trước → gửi HTML         Tương tác với người dùng
```

**Trong project hiện tại:**

| File | Loại | Lý do |
|------|------|-------|
| `app/page.tsx` | **Client** | Dùng RTK Query hooks, useState, useRouter, xử lý delete/search/filter |
| `app/login/page.tsx` | **Client** | Dùng useState, useRouter, gọi loginAction |
| `app/add/page.tsx` | **Client** | Dùng react-hook-form, useRouter, RTK Query |
| `app/detail/[productId]/page.tsx` | **Server** | Fetch product từ API server-side, truyền vào `ProductDetailScreen` |
| `src/component/ProductDetailScreen.tsx` | **Client** | Dùng react-hook-form, RTK Query mutation |

### 4.2 Server Actions

`app/actions/auth.ts` chứa hai hàm có chỉ thị `'use server'` ở đầu file:

```
loginAction(username, password)  →  Gọi API tìm user, so khớp password,
                                    set cookie HttpOnly, trả về kết quả.
logoutAction()                   →  Xóa cookie, user bị đẩy về login.
```

> **Tại sao không dùng API route?** Server actions đơn giản hơn — gọi trực tiếp như function thông thường từ client component mà không cần tự viết fetch tới `/api/...`.

### 4.3 Cookie vs localStorage

Project dùng **cả hai** với mục đích khác nhau:

| | `auth_token` (cookie) | `auth_user` (localStorage) |
|--|--|--|
| Lưu gì | `"1"` (đơn giản đánh dấu đã login) | Thông tin user (id, name, username) |
| Ai đọc | Server (Next.js pages, server components) | Client (hiển thị tên user trong UI) |
| Bảo mật | HttpOnly — JS không đọc được | Có thể đọc bằng JS |
| Xóa khi | Logout / hết 24h | Logout |

---

## 5. Luồng Authentication (Đăng Nhập / Đăng Xuất)

```
[Browser] Nhập username + password
    │
    ▼
[LoginScreen.tsx]  →  gọi  →  [loginAction() — Server]
                                    │
                                    ├─ Gọi API tìm user theo username
                                    ├─ So khớp password
                                    ├─ Thành công → set cookie auth_token
                                    └─ Trả về { success, user / message }
    │
    ▼ success
[LoginScreen.tsx]  →  lưu auth_user vào localStorage
    │
    ▼
router.push('/')   →  [app/page.tsx — Server]
                           │
                           ├─ Đọc cookie auth_token
                           ├─ Có token → tiếp tục render
                           └─ Không có → redirect('/login')
```

**Đăng xuất:**
```
[ProductPageClient.tsx] handleLogout()
    │
    ├─ gọi logoutAction()  →  xóa cookie auth_token (server)
    ├─ localStorage.removeItem('auth_user')
    └─ router.push('/login')
```

---

## 6. Luồng Dữ Liệu Sản Phẩm

### 6.1 Xem danh sách

```
[app/page.tsx — Client Component]
    │
    ├─ useGetProductsQuery()  ← RTK Query tự fetch GET /products
    ├─ Trả về mảng ApiProduct[]
    ├─ toShopProduct()        ← map tên field API → tên field UI
    ├─ Lọc theo search text
    ├─ Lọc theo màu (FilterView)
    ├─ Sắp xếp (click header cột)
    └─ Hiển thị qua <ProductTable />
```

### 6.2 Xóa sản phẩm

```
[ProductTable] Click nút xóa
    │
    ▼
[app/page.tsx] onConfirmDelete()
    │
    ├─ window.confirm("Delete ...?")
    ├─ setDeletingIds  ← đánh dấu loading trên row đó
    └─ deleteProduct(id)  ← RTK Query gọi DELETE /products/:id
```

### 6.3 Thêm / Sửa sản phẩm

```
[app/add/page.tsx]                    [app/detail/[productId]/page.tsx — Server]
    │                                         │
    │                                         ├─ fetch /products/:id (server-side)
    │                                         └─ <ProductDetailScreen initialProduct={...} />
    │                                                   │
    ├─ react-hook-form  ← quản lý state form ◄──────────┤
    ├─ zodResolver      ← validate                      │
    │                                                   │
    ▼ submit                                            ▼ submit
    ├─ createProduct(payload)             updateProduct({productId, payload})
    │    ← RTK Query POST /products            ← RTK Query PUT /products/:id
    └─ router.push('/')                   └─ router.push('/')
```

---

## 7. Bảo Vệ Route (Route Guard)

Route guard được xử lý tập trung tại **`proxy.ts`** — đây là Next.js Middleware chạy trước mọi request:

```typescript
// proxy.ts — logic chính
if (!isAuthenticated && pathname !== '/login') {
  redirect → /login      // chưa login → về trang login
}
if (isAuthenticated && pathname === '/login') {
  redirect → /           // đã login mà vào /login → về trang chủ
}
```

Middleware áp dụng cho tất cả route, **ngoại trừ**: `_next/static`, `_next/image`, `favicon.ico`, assets tĩnh (svg, png, jpg...).

> **Lưu ý:** Next.js chỉ tự động nhận file tên `middleware.ts` với export tên `middleware`. Nếu dùng `proxy.ts`, cần re-export đúng tên để framework nhận ra.

---

## 8. Validation Form (Zod Schema)

File `src/api/productFormModel.js` định nghĩa schema dùng chung cho cả Add và Edit:

| Field | Rule |
|-------|------|
| `name` | Bắt buộc, không được trống |
| `image` | Bắt buộc, phải là URL http/https hợp lệ |
| `summary` | Bắt buộc, không được trống |
| `price` | Bắt buộc, là số, phải ≥ 0 |
| `color` | Bắt buộc, không được trống |

File cũng chứa ba helper:
- `createDefaultProductFormValues()` — giá trị mặc định khi mở form trống.
- `apiProductToFormValues(apiProduct)` — chuyển tên field API (`productName`) sang tên field form (`name`).
- `formValuesToApiPayload(values)` — chuyển ngược lại khi submit.

---

## 9. State Management (RTK Query)

`src/store/productsApi.js` định nghĩa toàn bộ endpoints CRUD:

```
productsApi
├─ getProducts      → GET  /products
├─ getProduct       → GET  /products/:id
├─ createProduct    → POST /products
├─ updateProduct    → PUT  /products/:id
└─ deleteProduct    → DELETE /products/:id
```

**Tag invalidation**: khi tạo/sửa/xóa, RTK Query tự động invalidate cache tag `Product`, nhưng project này chủ yếu quản lý danh sách bằng local state (`rawData`) trong `ProductPageClient` vì data đã được fetch từ server khi vào trang.

---

## 10. Biến Môi Trường

Tạo file `.env.local` ở root project:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> Prefix `NEXT_PUBLIC_` nghĩa là biến này được expose sang cả client-side. Biến không có prefix chỉ dùng được ở server.

---

## 11. Cài Đặt và Chạy

```bash
# Cài dependencies
npm install

# Chạy dev server
npm run dev
# → http://localhost:3000

# Build production
npm run build
npm start

# Lint
npm run lint
```

---

## 12. Sơ Đồ Tổng Thể

```
Browser
  │
  │  Request trang
  ▼
Next.js Middleware (proxy.ts)
  ├─ Có auth_token cookie → cho qua
  └─ Không có → redirect /login

  ▼
Next.js Server / Client
  ├─ [app/page.tsx — Client]              → useGetProductsQuery → render danh sách
  ├─ [app/login/page.tsx — Client]        → form login (không cần kiểm tra cookie — middleware lo)
  ├─ [app/add/page.tsx — Client]          → form thêm sản phẩm
  └─ [app/detail/[productId]/ — Server]   → fetch product server-side → <ProductDetailScreen />

  │  Server Actions
  ├─ [loginAction]   ← gọi từ login/page.tsx
  └─ [logoutAction]  ← gọi từ app/page.tsx

  │  Client-side API calls (RTK Query)
  ├─ getProducts     ← app/page.tsx
  ├─ createProduct   ← app/add/page.tsx
  ├─ updateProduct   ← ProductDetailScreen
  └─ deleteProduct   ← app/page.tsx

External REST API  (NEXT_PUBLIC_API_URL)
  ├─ GET    /products
  ├─ GET    /products/:id
  ├─ POST   /products
  ├─ PUT    /products/:id
  ├─ DELETE /products/:id
  └─ GET    /users?username=...  (dùng để login)
```

---

## 13. Câu Hỏi Thường Gặp

**Q: Tại sao có cả `ApiProduct` và `ShopProduct`?**  
A: API trả về field `productName`, nhưng trong UI dùng `name` cho ngắn gọn. Hàm `toShopProduct()` trong `ProductPageClient.tsx` làm việc mapping này.

**Q: Tại sao `app/page.tsx` là client component?**  
A: Trang chủ cần xử lý interactive (search, filter, sort, confirm delete) nên dùng RTK Query hooks và useState trực tiếp trong page. Không cần SSR cho danh sách sản phẩm vì data thay đổi liên tục.

**Q: Cookie `auth_token` chứa gì?**  
A: Chỉ là chuỗi `"1"` — đơn giản đánh dấu đã login. Không phải JWT. Thông tin user thực sự lưu trong `localStorage.auth_user`.

**Q: Làm sao biết component nào là server/client?**  
A: Nhìn dòng đầu file — có `'use client'` thì là client component. Không có thì mặc định là server component.
