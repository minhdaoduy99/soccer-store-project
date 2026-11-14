"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Giày đá bóng");
  const [imagePreview, setImagePreview] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      alert("Vui lòng nhập đầy đủ tên giày và giá tiền!");
      return;
    }

    const saved = localStorage.getItem("webbd_products");
    const currentList = saved ? JSON.parse(saved) : [];
    const nextNumber = currentList.length + 1;
    const newId = `SP${nextNumber < 10 ? "0" + nextNumber : nextNumber}`;

    const newProduct = {
      id: newId,
      name: name.trim(),
      category,
      price: Number(price),
      image: imagePreview,
    };

    localStorage.setItem("webbd_products", JSON.stringify([newProduct, ...currentList]));
    router.push("/admin/products");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Thêm Giày Mới</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên giày</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: NIKE MERCURIAL VAPOR 17 PRO TF"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá tiền (VNĐ)</label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ví dụ: 3250000"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="Giày đá bóng">Giày đá bóng</option>
              <option value="Giày Futsal">Giày Futsal</option>
              <option value="Sneakers">Sneakers</option>
              <option value="Phụ kiện bóng đá">Phụ kiện bóng đá</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh sản phẩm</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            {imagePreview && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Xem trước ảnh:</p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
            >
              Lưu sản phẩm
            </button>
            <Link
              href="/admin/products"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
