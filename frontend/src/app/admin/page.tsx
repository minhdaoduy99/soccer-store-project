export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tổng Quan Hệ Thống</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Tổng sản phẩm</p>
          <p className="text-3xl font-bold mt-2">24</p>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Đơn hàng chờ xử lý</p>
          <p className="text-3xl font-bold mt-2 text-amber-600">5</p>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Doanh thu tháng</p>
          <p className="text-3xl font-bold mt-2 text-green-600">45.200.000 đ</p>
        </div>
      </div>
    </div>
  );
}