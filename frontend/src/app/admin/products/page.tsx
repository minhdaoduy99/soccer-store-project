"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: "SP01",
    name: "Nike Mercurial Superfly 9",
    category: "Giày đá bóng",
    price: 3200000,
    image: "https://media.soccerstore.vn/soccerstore/2024/05/DJ5605-601.png",
  },
  {
    id: "SP02",
    name: "Adidas Predator Accuracy",
    category: "Giày đá bóng",
    price: 2850000,
    image: "https://product.hstatic.net/1000061481/product/anh_sp_add_web_crazyfast-02-01_0014ddb6349b41028ab3b9314df26973_master.jpg",
  },
  {
    id: "SP03",
    name: "Nike Air Force 1 Low",
    category: "Sneakers",
    price: 2500000,
    image: "",
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("webbd_products");
    if (saved) {
      setProducts(JSON.parse(saved));
    } else {
      localStorage.setItem("webbd_products", JSON.stringify(DEFAULT_PRODUCTS));
      setProducts(DEFAULT_PRODUCTS);
    }
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    localStorage.setItem("webbd_products", JSON.stringify(updated));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Danh Sách Sản Phẩm</h1>
        <Link
          href="/admin/products/new"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
        >
          + Thêm giày mới
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b text-gray-600 text-sm">
            <tr>
              <th className="py-3 px-4">Mã SP</th>
              <th className="py-3 px-4">Hình ảnh</th>
              <th className="py-3 px-4">Tên giày</th>
              <th className="py-3 px-4">Danh mục</th>
              <th className="py-3 px-4">Giá bán</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {products.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-700">{item.id}</td>
                <td className="py-3 px-4">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-semibold text-gray-600">
                      Shoe
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                <td className="py-3 px-4 text-gray-600">{item.category}</td>
                <td className="py-3 px-4 font-semibold text-gray-800">
                  {Number(item.price).toLocaleString("vi-VN")} đ
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-800 font-medium text-xs px-2 py-1 rounded hover:bg-red-50"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
