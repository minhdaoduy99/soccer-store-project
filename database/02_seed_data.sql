SET NAMES utf8mb4;
USE WebBD_db;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE product_images;
TRUNCATE TABLE product_variants;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE brands;
TRUNCATE TABLE user_roles;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Quyền hạn
INSERT INTO roles (id, name) VALUES
(1, 'ROLE_CUSTOMER'),
(2, 'ROLE_ADMIN'),
(3, 'ROLE_STAFF');

-- 2. Tài khoản mẫu (Mật khẩu: 123456)
INSERT INTO users (id, email, password, full_name, phone, address) VALUES
(1, 'admin@gmail.com', '$2a$10$Jd9CtxxGhNAo5sfH32kqFu0qvXi0E4hzLTX3g4G7mc6GIYCS2t.8G', 'Admin', '0988888888', 'Hà Nội'),
(2, 'customer@gmail.com', '$2a$10$Jd9CtxxGhNAo5sfH32kqFu0qvXi0E4hzLTX3g4G7mc6GIYCS2t.8G', 'Customer', '0912345678', 'TP. Hồ Chí Minh');

INSERT INTO user_roles (user_id, role_id) VALUES
(1, 2),
(2, 1);

-- 3. Thương hiệu
INSERT INTO brands (id, name, slug, logo_url) VALUES
(1, 'Nike', 'nike', 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg'),
(2, 'Adidas', 'adidas', 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg'),
(3, 'Mizuno', 'mizuno', 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mizuno_logo.svg'),
(4, 'Puma', 'puma', 'https://upload.wikimedia.org/wikipedia/commons/8/88/Puma_complete_logo.svg'),
(5, 'Kamito', 'kamito', ''),
(6, 'Zocker', 'zocker', ''),
(7, 'GKVN', 'gkvn', ''),
(8, 'NMS', 'nms', '');

-- 4. Danh mục cha & danh mục con
INSERT INTO categories (id, name, slug, parent_id) VALUES
(1, 'Giày Bóng Đá', 'giay-bong-da', NULL),
(2, 'Phụ Kiện', 'phu-kien', NULL),
(3, 'Giày bóng đá sân cỏ nhân tạo', 'giay-bong-da-san-co-nhan-tao', 1),
(4, 'Giày bóng đá sân cỏ tự nhiên', 'giay-bong-da-san-co-tu-nhien', 1),
(5, 'Giày bóng đá Futsal', 'giay-bong-da-futsal', 1),
(6, 'Giày bóng đá trẻ em', 'giay-bong-da-tre-em', 1),
(7, 'Găng tay thủ môn', 'gang-tay-thu-mon', 2),
(8, 'Quần áo đá bóng', 'quan-ao-da-bong', 2),
(9, 'Quả bóng đá', 'qua-bong-da', 2),
(10, 'Tất & Lót giày', 'tat-va-lot-giay', 2);

-- 5. Sản phẩm mẫu
INSERT INTO products (id, brand_id, category_id, name, slug, description, base_price) VALUES
(1, 1, 3, 'Nike Zoom Mercurial Vapor 15 Pro TF', 'nike-zoom-mercurial-vapor-15-pro-tf', 'Mẫu giày đá bóng sân cỏ nhân tạo cao cấp trang bị bộ đệm Air Zoom đàn hồi cực êm.', 2850000),
(2, 2, 3, 'Adidas Predator Accuracy.3 TF', 'adidas-predator-accuracy-3-tf', 'Dòng giày kiểm soát bóng huyền thoại của Adidas với các gai cao su High Definition Texture.', 1950000),
(3, 3, 3, 'Mizuno Morelia Sala Classic TF', 'mizuno-morelia-sala-classic-tf', 'Giày bóng đá da tổng hợp siêu mềm chuẩn form chân bè Việt Nam.', 1690000),
(4, 4, 4, 'Puma Future Ultimate FG/AG', 'puma-future-ultimate-fg-ag', 'Giày đinh cao sân cỏ tự nhiên công nghệ FUZIONFIT360 ôm sát bàn chân.', 3650000),
(5, 5, 3, 'Kamito Velocidad Play TF', 'kamito-velocidad-play-tf', 'Giày bóng đá sân cỏ nhân tạo giá tốt, bền bỉ và bám sân.', 580000),
(6, 7, 7, 'Găng tay thủ môn GKVN Lì màu hồng GKVNLI-HO', 'gang-tay-thu-mon-gkvn-li-hong', 'Găng tay thủ môn mặt mút Đức dày 4mm bắt dính bóng cực tốt trong mọi thời tiết.', 300000),
(7, 7, 7, 'Găng tay thủ môn GKVN Lì màu xám GKVNLI-XA', 'gang-tay-thu-mon-gkvn-li-xam', 'Găng tay thủ môn thiết kế ngón Hybrid ôm tay chắc chắn, chống trầy xước.', 300000),
(8, 8, 10, 'Lót giày bóng đá chính hãng NMS INSOLES Pro', 'lot-giay-nms-insoles-pro', 'Lót giày thể thao chuyên dụng giảm chấn gót chân và chống trượt trong giày.', 199000);

-- 6. Biến thể sản phẩm (Size, Loại đinh, Giá, Tồn kho)
INSERT INTO product_variants (product_id, sku, color, size, ground_type, price, stock_quantity) VALUES
(1, 'NK-VAP15-TF-39', 'Hồng / Đen', '39', 'TF', 2850000, 10),
(1, 'NK-VAP15-TF-40', 'Hồng / Đen', '40', 'TF', 2850000, 15),
(1, 'NK-VAP15-TF-41', 'Hồng / Đen', '41', 'TF', 2850000, 8),
(1, 'NK-VAP15-TF-42', 'Hồng / Đen', '42', 'TF', 2850000, 5),
(2, 'AD-PRED-TF-40', 'Đen / Hồng', '40', 'TF', 1950000, 9),
(2, 'AD-PRED-TF-41', 'Đen / Hồng', '41', 'TF', 1950000, 12),
(3, 'MZ-SALA-TF-39', 'Trắng / Xanh', '39', 'TF', 1690000, 7),
(3, 'MZ-SALA-TF-40', 'Trắng / Xanh', '40', 'TF', 1690000, 11),
(3, 'MZ-SALA-TF-41', 'Trắng / Xanh', '41', 'TF', 1690000, 6),
(4, 'PM-FUT-FG-41', 'Cam / Đen', '41', 'FG', 3650000, 4),
(4, 'PM-FUT-FG-42', 'Cam / Đen', '42', 'FG', 3650000, 6),
(5, 'KM-VEL-TF-39', 'Xanh Ngọc', '39', 'TF', 580000, 14),
(5, 'KM-VEL-TF-40', 'Xanh Ngọc', '40', 'TF', 580000, 18),
(6, 'GK-LI-HO-8', 'Hồng / Trắng', '8', 'PHU_KIEN', 300000, 10),
(6, 'GK-LI-HO-9', 'Hồng / Trắng', '9', 'PHU_KIEN', 300000, 12),
(7, 'GK-LI-XA-9', 'Xám / Đen', '9', 'PHU_KIEN', 300000, 8),
(7, 'GK-LI-XA-10', 'Xám / Đen', '10', 'PHU_KIEN', 300000, 7),
(8, 'NMS-PRO-40', 'Xanh Chuối', '40', 'PHU_KIEN', 199000, 20),
(8, 'NMS-PRO-41', 'Xanh Chuối', '41', 'PHU_KIEN', 199000, 20);

-- 7. Hình ảnh sản phẩm
INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES
(1, 'https://media.soccerstore.vn/soccerstore/2024/06/DJ5605-601.png', TRUE),
(2, 'https://media.soccerstore.vn/soccerstore/2023/06/GZ0003.png', TRUE),
(3, 'https://media.soccerstore.vn/soccerstore/2024/03/Q1GB242027.png', TRUE),
(4, 'https://media.soccerstore.vn/soccerstore/2024/02/107599-03.png', TRUE),
(5, 'https://media.soccerstore.vn/soccerstore/2023/11/KM230512.png', TRUE),
(6, 'https://media.soccerstore.vn/soccerstore/2024/05/GKVNLI-HO.png', TRUE),
(7, 'https://media.soccerstore.vn/soccerstore/2024/05/GKVNLI-XA.png', TRUE),
(8, 'https://media.soccerstore.vn/soccerstore/2024/04/NMSPRO-INSOLES.png', TRUE);
