"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [pathname, router]);

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
          <nav className="flex flex-col gap-2 mt-6">
            <Link href="/admin" className="px-3 py-2 rounded-md hover:bg-gray-100 font-medium">Dashboard</Link>
            <Link href="/admin/products" className="px-3 py-2 rounded-md hover:bg-gray-100 font-medium">Quản lý sản phẩm</Link>
            <Link href="/admin/orders" className="px-3 py-2 rounded-md hover:bg-gray-100 font-medium">Quản lý đơn hàng</Link>
          </nav>
        </div>
        <Button variant="outline" onClick={() => { localStorage.removeItem("token"); router.push("/admin/login"); }} className="w-full">
          Đăng xuất
        </Button>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}