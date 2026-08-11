import { verifyAdminSession } from "@/lib/data/auth";
import { getStreamConfig } from "@/lib/data/stream-config";
import { StreamConfigForm } from "./stream-config-form";

export default async function AdminStreamPage() {
  await verifyAdminSession();
  const config = await getStreamConfig();

  return <StreamConfigForm config={config} />;
}
