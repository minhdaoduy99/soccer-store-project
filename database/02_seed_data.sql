USE WebBD_db;

-- 1. Quyền hạn
INSERT INTO roles (id, name) VALUES 
(1, 'ROLE_CUSTOMER'),
(2, 'ROLE_ADMIN'),
(3, 'ROLE_STAFF');

-- 2. Tài khoản mẫu
INSERT INTO users (id, email, password, full_name, phone, address) VALUES
(1, 'admin@gmail.com', '$2a$10$w8k1hQ4Zz2/R.L6iX7x.ee7CqY9V5d0E1f4h5a6b7c8d9e0f1g', 'Admin', '0988888888', 'Hà Nội'),
(2, 'customer@gmail.com', '$2a$10$w8k1hQ4Zz2/R.L6iX7x.ee7CqY9V5d0E1f4h5a6b7c8d9e0f1g', 'Customer', '0912345678', 'TP. Hồ Chí Minh');

INSERT INTO user_roles (user_id, role_id) VALUES 
(1, 2),
(2, 1);

-- 3. Thương hiệu
INSERT INTO brands (id, name, slug, logo_url) VALUES
(1, 'Nike', 'nike', 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg'),
(2, 'Adidas', 'adidas', 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg'),
(3, 'Puma', 'puma', 'https://upload.wikimedia.org/wikipedia/commons/8/88/Puma_complete_logo.svg'),
(4, 'Mizuno', 'mizuno', 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mizuno_logo.svg');

-- 4. Danh mục
INSERT INTO categories (id, name, slug, parent_id) VALUES
(1, 'Giày Sân Cỏ Nhân Tạo', 'giay-san-co-nhan-tao', NULL),
(2, 'Giày Sân Cỏ Tự Nhiên', 'giay-san-co-tu-nhien', NULL),
(3, 'Giày Futsal / Sân Trong Nhà', 'giay-futsal-ic', NULL),
(4, 'Phụ Kiện Bóng Đá', 'phu-kien-bong-da', NULL);

-- 5. Sản phẩm mẫu
INSERT INTO products (id, brand_id, category_id, name, slug, description, base_price) VALUES
(1, 1, 1, 'Nike Zoom Mercurial Vapor 15 Pro TF', 'nike-zoom-mercurial-vapor-15-pro-tf', 'Mẫu giày đá bóng sân cỏ nhân tạo cao cấp trang bị bộ đệm Air Zoom đàn hồi cực êm, upper dệt Flyknit mềm mại.', 2850000),
(2, 2, 1, 'Adidas Predator Accuracy.3 TF', 'adidas-predator-accuracy-3-tf', 'Dòng giày kiểm soát bóng huyền thoại của Adidas với các gai cao su High Definition Texture hỗ trợ sút xoáy.', 1950000);

-- 6. Biến thể sản phẩm (Size, Đinh, Giá, Tồn kho)
INSERT INTO product_variants (product_id, sku, color, size, ground_type, price, stock_quantity) VALUES
(1, 'NK-VAP15-TF-WHT-39', 'Trắng / Đỏ', '39', 'TF', 2850000, 10),
(1, 'NK-VAP15-TF-WHT-40', 'Trắng / Đỏ', '40', 'TF', 2850000, 15),
(1, 'NK-VAP15-TF-WHT-41', 'Trắng / Đỏ', '41', 'TF', 2850000, 5),
(1, 'NK-VAP15-TF-WHT-42', 'Trắng / Đỏ', '42', 'TF', 2850000, 0),
(2, 'AD-PRED-TF-BLK-40', 'Đen / Hồng', '40', 'TF', 1950000, 8),
(2, 'AD-PRED-TF-BLK-41', 'Đen / Hồng', '41', 'TF', 1950000, 12);

-- 7. Hình ảnh sản phẩm
INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES
(1, 'https://media.soccerstore.vn/soccerstore/2024/05/DJ5605-601.png', TRUE),
(1, 'https://media.soccerstore.vn/soccerstore/2023/06/DJ5605-146.png', FALSE),
(2, 'https://product.hstatic.net/1000061481/product/anh_sp_add_web_crazyfast-02-01_0014ddb6349b41028ab3b9314df26973_master.jpg', TRUE);