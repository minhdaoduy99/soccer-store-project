"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Order { id: string; customerName: string; total: number; status: "PENDING" | "SHIPPING" | "DELIVERED"; }

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    api.get("/api/v1/admin/orders").then((res) => setOrders(res.data)).catch(() => {
      setOrders([
        { id: "DH001", customerName: "Nguyễn Văn A", total: 3200000, status: "PENDING" },
        { id: "DH002", customerName: "Trần Thị B", total: 2850000, status: "SHIPPING" },
        { id: "DH003", customerName: "Lê Hoàng C", total: 2500000, status: "DELIVERED" },
      ]);
    });
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as Order["status"] } : o)));
    try { await api.patch(`/api/v1/admin/orders/${orderId}`, { status: newStatus }); } catch {}
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Danh Sách Đơn Hàng</h1>
      <div className="bg-white border rounded-lg">
        <Table>
          <TableHeader><TableRow><TableHead>Mã đơn</TableHead><TableHead>Khách hàng</TableHead><TableHead>Tổng tiền</TableHead><TableHead>Trạng thái</TableHead></TableRow></TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.total.toLocaleString()} đ</TableCell>
                <TableCell>
                  <Select value={order.status} onValueChange={(val) => val && handleStatusChange(order.id, val)}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">PENDING</SelectItem>
                      <SelectItem value="SHIPPING">SHIPPING</SelectItem>
                      <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}