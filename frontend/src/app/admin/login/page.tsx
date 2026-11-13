"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/v1/auth/login", { email, password });
      const token = res.data.token || res.data.accessToken || res.data.data?.token;
      if (token) {
        localStorage.setItem("token", token);
        router.push("/admin");
      } else {
        setError("Không tìm thấy token trong phản hồi từ server!");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi đăng nhập hoặc chưa bật Backend cổng 8080");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow border">
        <h1 className="text-2xl font-bold text-center mb-2">Đăng Nhập Quản Trị</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Admin Dashboard - WebBD Store</p>
        {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email Admin</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
      </div>
    </div>
  );
}