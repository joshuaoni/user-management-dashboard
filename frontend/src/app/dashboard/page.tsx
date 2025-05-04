import { Suspense } from "react";
import DashboardContent from "@/app/dashboard/components/DashboardContent";
import { getUsers } from "../../actions/actions";

export const metadata = {
  title: "Dashboard - User Management",
  description: "Manage users in the system",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; role?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const role = searchParams.role || "";

  const initialData = await getUsers(page, search, role);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent initialData={initialData} />
    </Suspense>
  );
}
