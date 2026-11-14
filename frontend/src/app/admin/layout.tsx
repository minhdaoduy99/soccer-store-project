"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setAuthorized(true);
      return;
    }

    const token = localStorage.getItem("token");
    const savedRoles = localStorage.getItem("roles");
    let roles: string[] = [];
    try {
      roles = savedRoles ? JSON.parse(savedRoles) : [];
    } catch {
      roles = [];
    }

    if (!token || !roles.includes("ROLE_ADMIN")) {
      localStorage.removeItem("token");
      localStorage.removeItem("roles");
      setAuthorized(false);
      router.push("/admin/login");
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (!authorized) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>
          <nav className="flex flex-col gap-2">
            <Link href="/admin" className="px-3 py-2 rounded-md hover:bg-gray-100 font-medium">Dashboard</Link>
            <Link href="/admin/products" className="px-3 py-2 rounded-md hover:bg-gray-100 font-medium">Quản lý sản phẩm</Link>
            <Link href="/admin/orders" className="px-3 py-2 rounded-md hover:bg-gray-100 font-medium">Quản lý đơn hàng</Link>
          </nav>
        </div>
        <Button variant="outline" onClick={handleLogout} className="w-full">
          Đăng xuất
        </Button>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
