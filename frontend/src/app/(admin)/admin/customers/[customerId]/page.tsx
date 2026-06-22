"use client";
import { useParams } from "next/navigation";
import { AdminCustomerDetail } from "@/features/admin/customers/components/admin-customer-detail";
export default function Page() {
  const params = useParams<{ customerId: string }>();
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <AdminCustomerDetail customerId={params.customerId} />
    </main>
  );
}
