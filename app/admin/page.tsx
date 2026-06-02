import { isAdmin } from "@/lib/auth";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return <AdminClient authed={isAdmin()} />;
}
