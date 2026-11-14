"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface Category {
  id: number;
  name: string;
  slug: string;
  children: Category[];
}

interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface ProductItem {
  rawId: number;
  id: string;
  name: string;
  brandName: string;
  category: string;
  price: number;
  image: string;
  sizes: string[];
  outOfStockSizes: string[];
  groundTypes: string[];
  stock: number;
}

interface VariantEdit {
  id: number | null;
  sku?: string;
  size: string;
  color: string;
  groundType: string;
  stockQuantity: number;
}

interface ProductEditForm {
  id: number;
  name: string;
  brandId: number;
  categoryId: number;
  basePrice: number;
  thumbnailUrl: string;
  variants: VariantEdit[];
}

const API_PUBLIC = "http://localhost:8080/api/v1/public";

const PRICE_RANGES = [
  { label: "Tất cả mức giá", min: "", max: "" },
  { label: "Dưới 500.000 ₫", min: "", max: "500000" },
  { label: "500.000 ₫ - 1.500.000 ₫", min: "500000", max: "1500000" },
  { label: "1.500.000 ₫ - 3.000.000 ₫", min: "1500000", max: "3000000" },
  { label: "Trên 3.000.000 ₫", min: "3000000", max: "" },
];

const SIZES = ["38", "39", "40", "41", "42", "43", "8", "9", "10"];

const GROUND_TYPES = [
  { value: "TF", label: "Sân cỏ nhân tạo (TF)" },
  { value: "FG", label: "Sân cỏ tự nhiên (FG)" },
  { value: "IC", label: "Sân Futsal (IC)" },
  { value: "PHU_KIEN", label: "Phụ kiện" },
];

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Bộ lọc
  const [selectedCategory, setSelectedCategory] = useState<{ id: number | null; name: string }>({
    id: null,
    name: "Tất cả sản phẩm",
  });
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedGround, setSelectedGround] = useState<string>("");
  const [priceIndex, setPriceIndex] = useState<number>(0);
  const [keyword, setKeyword] = useState<string>("");
  const [sort, setSort] = useState<string>("newest");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // State Modal Chỉnh Sửa
  const [editingProduct, setEditingProduct] = useState<ProductEditForm | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [newSize, setNewSize] = useState<string>("");
  const [newColor, setNewColor] = useState<string>("Tiêu chuẩn");
  const [newGround, setNewGround] = useState<string>("TF");
  const [newStock, setNewStock] = useState<number>(10);

  useEffect(() => {
    Promise.all([
      fetch(`${API_PUBLIC}/categories`).then((r) => r.json()),
      fetch(`${API_PUBLIC}/brands`).then((r) => r.json()),
    ])
      .then(([cats, brs]) => {
        setCategories(Array.isArray(cats) ? cats : []);
        setBrands(Array.isArray(brs) ? brs : []);
      })
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory.id) params.set("categoryId", String(selectedCategory.id));
    if (selectedBrandId) params.set("brandId", selectedBrandId);
    if (selectedSize) params.set("size", selectedSize);
    if (selectedGround) params.set("groundType", selectedGround);
    const range = PRICE_RANGES[priceIndex];
    if (range?.min) params.set("minPrice", range.min);
    if (range?.max) params.set("maxPrice", range.max);
    if (keyword.trim()) params.set("keyword", keyword.trim());
    params.set("sort", sort);

    fetch(`${API_PUBLIC}/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        const dbItems: ProductItem[] = (Array.isArray(data) ? data : []).map((p: any) => ({
          rawId: Number(p.id),
          id: `SP${String(p.id).padStart(2, "0")}`,
          name: p.name,
          brandName: p.brandName || "Khác",
          category: p.categoryName,
          price: Number(p.basePrice),
          image: p.thumbnailUrl || "",
          sizes: Array.isArray(p.availableSizes) ? p.availableSizes : [],
          outOfStockSizes: Array.isArray(p.outOfStockSizes) ? p.outOfStockSizes : [],
          groundTypes: Array.isArray(p.groundTypes) ? p.groundTypes : [],
          stock: p.totalStock ?? 0,
        }));
        setProducts(dbItems);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedBrandId, selectedSize, selectedGround, priceIndex, keyword, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Mở Modal chỉnh sửa khi click vào sản phẩm
  const openEditModal = async (rawId: number) => {
    setLoadingDetail(true);
    try {
      const res = await api.get(`/api/v1/admin/products/${rawId}`);
      setEditingProduct(res.data);
      setNewSize("");
      setNewColor("Tiêu chuẩn");
      setNewGround("TF");
      setNewStock(10);
    } catch {
      alert("Không thể tải thông tin chi tiết sản phẩm. Vui lòng kiểm tra đăng nhập Admin!");
    } finally {
      setLoadingDetail(false);
    }
  };

  // Thêm size mới vào danh sách đang sửa
  const handleAddVariant = () => {
    if (!editingProduct) return;
    const trimmed = newSize.trim();
    if (!trimmed) {
      alert("Vui lòng nhập tên Size (ví dụ: 42, 43, 9...)");
      return;
    }
    setEditingProduct({
      ...editingProduct,
      variants: [
        ...editingProduct.variants,
        {
          id: null,
          size: trimmed,
          color: newColor.trim() || "Tiêu chuẩn",
          groundType: newGround,
          stockQuantity: Number(newStock) >= 0 ? Number(newStock) : 0,
        },
      ],
    });
    setNewSize("");
  };

  // Lưu thay đổi xuống Backend
  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    if (!editingProduct.name.trim()) {
      alert("Tên sản phẩm không được để trống!");
      return;
    }
    setSaving(true);
    try {
      await api.put(`/api/v1/admin/products/${editingProduct.id}`, editingProduct);
      setEditingProduct(null);
      fetchProducts();
    } catch {
      alert("Lưu thất bại! Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, item: ProductItem) => {
    e.stopPropagation();
    if (!confirm(`Bạn có chắc muốn xóa "${item.name}"?`)) return;
    try {
      await api.delete(`/api/v1/admin/products/${item.rawId}`);
      fetchProducts();
    } catch {
      alert("Không thể xóa sản phẩm!");
    }
  };

  const resetAllFilters = () => {
    setSelectedCategory({ id: null, name: "Tất cả sản phẩm" });
    setSelectedBrandId("");
    setSelectedSize("");
    setSelectedGround("");
    setPriceIndex(0);
    setKeyword("");
    setSort("newest");
  };

  const hasActiveFilter =
    selectedCategory.id !== null ||
    selectedBrandId !== "" ||
    selectedSize !== "" ||
    selectedGround !== "" ||
    priceIndex !== 0 ||
    keyword.trim() !== "";

  // Danh sách phẳng tất cả danh mục con để chọn trong form sửa
  const flatCategories = categories.flatMap((parent) =>
    parent.children.length > 0 ? parent.children : [parent]
  );

  return (
    <div className="p-6 space-y-5">
      {/* Tiêu đề & Nút thêm mới */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Danh Sách Sản Phẩm</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Đang xem: <span className="font-semibold text-gray-800">{selectedCategory.name}</span> ({products.length} sản phẩm) •{" "}
            <span className="text-amber-700">Ấn vào sản phẩm để chỉnh sửa size & trạng thái hết hàng</span>
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
        >
          + Thêm sản phẩm mới
        </Link>
      </div>

      {/* Thanh phân mục Danh mục & Thương hiệu */}
      <div
        className="bg-zinc-900 text-zinc-100 rounded-xl px-4 flex flex-wrap items-center gap-1 sm:gap-5 text-sm font-medium relative shadow-sm"
        onMouseLeave={() => setOpenMenu(null)}
      >
        <button
          onClick={() => {
            setSelectedCategory({ id: null, name: "Tất cả sản phẩm" });
            setOpenMenu(null);
          }}
          className={`py-3 px-2 cursor-pointer transition-colors ${
            selectedCategory.id === null
              ? "text-amber-400 border-b-2 border-amber-400"
              : "text-zinc-200 hover:text-amber-400"
          }`}
        >
          Tất Cả Sản Phẩm
        </button>

        {categories.map((cat) => (
          <div
            key={cat.id}
            className="relative"
            onMouseEnter={() => setOpenMenu(`cat-${cat.id}`)}
          >
            <button
              onClick={() => {
                setSelectedCategory({ id: cat.id, name: cat.name });
                setOpenMenu(openMenu === `cat-${cat.id}` ? null : `cat-${cat.id}`);
              }}
              className={`py-3 px-2 flex items-center gap-1 cursor-pointer transition-colors ${
                selectedCategory.id === cat.id ||
                cat.children.some((c) => c.id === selectedCategory.id)
                  ? "text-amber-400 border-b-2 border-amber-400"
                  : "text-zinc-200 hover:text-amber-400"
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-xs">▾</span>
            </button>

            {openMenu === `cat-${cat.id}` && cat.children.length > 0 && (
              <div className="absolute left-0 top-full w-64 bg-zinc-800 border border-zinc-700 shadow-xl rounded-b-lg py-1.5 z-40">
                <button
                  onClick={() => {
                    setSelectedCategory({ id: cat.id, name: `Tất cả ${cat.name}` });
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 hover:text-amber-400 cursor-pointer"
                >
                  Tất cả {cat.name.toLowerCase()}
                </button>
                {cat.children.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedCategory({ id: sub.id, name: sub.name });
                      setOpenMenu(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 hover:text-amber-400 cursor-pointer"
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Menu Thương Hiệu thả xuống */}
        <div className="relative" onMouseEnter={() => setOpenMenu("brands")}>
          <button
            onClick={() => setOpenMenu(openMenu === "brands" ? null : "brands")}
            className={`py-3 px-2 flex items-center gap-1 cursor-pointer transition-colors ${
              selectedBrandId
                ? "text-amber-400 border-b-2 border-amber-400"
                : "text-zinc-200 hover:text-amber-400"
            }`}
          >
            <span>Thương Hiệu</span>
            <span className="text-xs">▾</span>
          </button>

          {openMenu === "brands" && (
            <div className="absolute left-0 top-full w-52 bg-zinc-800 border border-zinc-700 shadow-xl rounded-b-lg py-1.5 z-40">
              <button
                onClick={() => {
                  setSelectedBrandId("");
                  setOpenMenu(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-amber-400 cursor-pointer"
              >
                Tất cả thương hiệu
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBrandId(String(b.id));
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 hover:text-amber-400 flex items-center justify-between cursor-pointer"
                >
                  <span>{b.name}</span>
                  <span className="text-zinc-500 text-xs">›</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Thanh Bộ Lọc Chi Tiết */}
      <div className="bg-white p-3.5 rounded-xl shadow-sm border flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm theo tên sản phẩm..."
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-800 w-56 focus:outline-none focus:border-black"
        />

        <select
          value={selectedBrandId}
          onChange={(e) => setSelectedBrandId(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-black"
        >
          <option value="">Hãng: Tất cả</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              Hãng: {b.name}
            </option>
          ))}
        </select>

        <select
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-black"
        >
          <option value="">Size: Tất cả</option>
          {SIZES.map((sz) => (
            <option key={sz} value={sz}>
              Size {sz}
            </option>
          ))}
        </select>

        <select
          value={selectedGround}
          onChange={(e) => setSelectedGround(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-black"
        >
          <option value="">Loại mặt sân: Tất cả</option>
          {GROUND_TYPES.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>

        <select
          value={priceIndex}
          onChange={(e) => setPriceIndex(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-black"
        >
          {PRICE_RANGES.map((r, idx) => (
            <option key={idx} value={idx}>
              {r.label}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white ml-auto focus:outline-none focus:border-black"
        >
          <option value="newest">Mới nhất</option>
          <option value="price_asc">Giá: Thấp → Cao</option>
          <option value="price_desc">Giá: Cao → Thấp</option>
        </select>

        {hasActiveFilter && (
          <button
            onClick={resetAllFilters}
            className="text-xs bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium cursor-pointer"
          >
            Xóa lọc
          </button>
        )}
      </div>

      {/* Bảng Danh Sách Sản Phẩm */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b text-gray-600 text-sm">
            <tr>
              <th className="py-3 px-4">Mã SP</th>
              <th className="py-3 px-4">Hình ảnh</th>
              <th className="py-3 px-4">Tên sản phẩm</th>
              <th className="py-3 px-4">Hãng</th>
              <th className="py-3 px-4">Danh mục</th>
              <th className="py-3 px-4">Size (Còn / Hết)</th>
              <th className="py-3 px-4">Giá bán</th>
              <th className="py-3 px-4">Tồn kho</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500">
                  Đang tải danh sách sản phẩm...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500">
                  Không có sản phẩm nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              products.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => openEditModal(item.rawId)}
                  className="hover:bg-amber-50/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-gray-700">{item.id}</td>
                  <td className="py-3 px-4">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "https://placehold.co/80x80/f3f4f6/374151?text=SP";
                        }}
                        className="w-12 h-12 object-contain bg-gray-50 rounded-lg border p-1"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-semibold text-gray-600">
                        SP
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900 max-w-xs">
                    <span className="hover:text-amber-700 underline-offset-2 hover:underline">
                      {item.name}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-gray-100 text-gray-800 border">
                      {item.brandName}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{item.category}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {item.sizes.map((sz) => (
                        <span
                          key={`in-${sz}`}
                          title="Còn hàng"
                          className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-medium"
                        >
                          {sz}
                        </span>
                      ))}
                      {item.outOfStockSizes.map((sz) => (
                        <span
                          key={`out-${sz}`}
                          title="Đang hết hàng"
                          className="text-xs bg-red-50 text-red-500 border border-red-200 px-1.5 py-0.5 rounded line-through"
                        >
                          {sz}
                        </span>
                      ))}
                      {item.sizes.length === 0 && item.outOfStockSizes.length === 0 && (
                        <span className="text-xs text-gray-400">Chưa có size</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800 whitespace-nowrap">
                    {Number(item.price).toLocaleString("vi-VN")} ₫
                  </td>
                  <td className="py-3 px-4">
                    {item.stock > 0 ? (
                      <span className="text-gray-700 font-medium">{item.stock}</span>
                    ) : (
                      <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded">
                        Hết hàng
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(item.rawId);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1 rounded hover:bg-blue-50 cursor-pointer"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, item)}
                      className="text-red-600 hover:text-red-800 font-medium text-xs px-2 py-1 rounded hover:bg-red-50 cursor-pointer"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Đang Tải Chi Tiết */}
      {loadingDetail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white px-6 py-4 rounded-xl shadow-lg text-sm font-medium text-gray-700">
            Đang tải thông tin sản phẩm...
          </div>
        </div>
      )}

      {/* Modal Chỉnh Sửa Sản Phẩm & Quản Lý Size / Hết Hàng */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900">
                Chỉnh Sửa Sản Phẩm (#SP{String(editingProduct.id).padStart(2, "0")})
              </h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-gray-700 text-xl font-bold px-2 cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5 text-sm">
              {/* Thông tin cơ bản */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Thương hiệu (Hãng)</label>
                  <select
                    value={editingProduct.brandId}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, brandId: Number(e.target.value) })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Danh mục</label>
                  <select
                    value={editingProduct.categoryId}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, categoryId: Number(e.target.value) })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
                  >
                    {flatCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Giá bán (VNĐ)</label>
                  <input
                    type="number"
                    value={editingProduct.basePrice}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, basePrice: Number(e.target.value) })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Link hình ảnh</label>
                  <input
                    type="text"
                    value={editingProduct.thumbnailUrl}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, thumbnailUrl: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  />
                </div>
              </div>

              {/* Quản lý Size & Trạng thái Hết hàng */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      Quản lý Size & Trạng thái Tồn kho
                    </h3>
                    <p className="text-xs text-gray-500">
                      Đặt số lượng về <strong>0</strong> hoặc bấm nút <strong>Báo hết hàng</strong> để đánh dấu size đang hết.
                    </p>
                  </div>
                </div>

                <div className="border rounded-xl overflow-hidden mb-4">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead className="bg-gray-50 border-b text-gray-600">
                      <tr>
                        <th className="py-2 px-3">Size</th>
                        <th className="py-2 px-3">Màu sắc</th>
                        <th className="py-2 px-3">Loại sân</th>
                        <th className="py-2 px-3 w-28">Tồn kho</th>
                        <th className="py-2 px-3">Trạng thái</th>
                        <th className="py-2 px-3 text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {editingProduct.variants.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-gray-400">
                            Chưa có size nào. Hãy thêm size mới ở bên dưới.
                          </td>
                        </tr>
                      ) : (
                        editingProduct.variants.map((v, idx) => {
                          const isOut = Number(v.stockQuantity) <= 0;
                          return (
                            <tr key={idx} className={isOut ? "bg-red-50/40" : ""}>
                              <td className="py-2 px-3 font-bold text-gray-900">
                                <input
                                  type="text"
                                  value={v.size}
                                  onChange={(e) => {
                                    const updated = [...editingProduct.variants];
                                    updated[idx] = { ...v, size: e.target.value };
                                    setEditingProduct({ ...editingProduct, variants: updated });
                                  }}
                                  className="w-16 border rounded px-2 py-1 font-semibold"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  value={v.color}
                                  onChange={(e) => {
                                    const updated = [...editingProduct.variants];
                                    updated[idx] = { ...v, color: e.target.value };
                                    setEditingProduct({ ...editingProduct, variants: updated });
                                  }}
                                  className="w-28 border rounded px-2 py-1"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <select
                                  value={v.groundType}
                                  onChange={(e) => {
                                    const updated = [...editingProduct.variants];
                                    updated[idx] = { ...v, groundType: e.target.value };
                                    setEditingProduct({ ...editingProduct, variants: updated });
                                  }}
                                  className="border rounded px-2 py-1 bg-white"
                                >
                                  <option value="TF">TF (Cỏ nhân tạo)</option>
                                  <option value="FG">FG (Cỏ tự nhiên)</option>
                                  <option value="IC">IC (Futsal)</option>
                                  <option value="PHU_KIEN">Phụ kiện</option>
                                </select>
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  min={0}
                                  value={v.stockQuantity}
                                  onChange={(e) => {
                                    const updated = [...editingProduct.variants];
                                    updated[idx] = {
                                      ...v,
                                      stockQuantity: Math.max(0, Number(e.target.value)),
                                    };
                                    setEditingProduct({ ...editingProduct, variants: updated });
                                  }}
                                  className="w-20 border rounded px-2 py-1 font-medium"
                                />
                              </td>
                              <td className="py-2 px-3">
                                {isOut ? (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                    Hết hàng
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                    Còn hàng
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-right space-x-2 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...editingProduct.variants];
                                    updated[idx] = {
                                      ...v,
                                      stockQuantity: isOut ? 10 : 0,
                                    };
                                    setEditingProduct({ ...editingProduct, variants: updated });
                                  }}
                                  className={`text-xs px-2 py-1 rounded font-medium cursor-pointer ${
                                    isOut
                                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                      : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                  }`}
                                >
                                  {isOut ? "Nhập lại (+10)" : "Báo hết hàng"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = editingProduct.variants.filter((_, i) => i !== idx);
                                    setEditingProduct({ ...editingProduct, variants: updated });
                                  }}
                                  className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded cursor-pointer"
                                >
                                  Xóa
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Khu vực Thêm Size Mới */}
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-3.5">
                  <p className="text-xs font-semibold text-gray-700 mb-2">+ Thêm Size mới cho sản phẩm này:</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      placeholder="Size (VD: 43)"
                      className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm w-28 bg-white"
                    />
                    <input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      placeholder="Màu sắc"
                      className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm w-32 bg-white"
                    />
                    <select
                      value={newGround}
                      onChange={(e) => setNewGround(e.target.value)}
                      className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm bg-white"
                    >
                      <option value="TF">TF (Cỏ nhân tạo)</option>
                      <option value="FG">FG (Cỏ tự nhiên)</option>
                      <option value="IC">IC (Futsal)</option>
                      <option value="PHU_KIEN">Phụ kiện</option>
                    </select>
                    <input
                      type="number"
                      min={0}
                      value={newStock}
                      onChange={(e) => setNewStock(Number(e.target.value))}
                      placeholder="Số lượng"
                      className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm w-24 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="bg-zinc-900 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-zinc-700 cursor-pointer"
                    >
                      + Thêm size
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Chân Modal */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveProduct}
                className="px-5 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
