import { currentEmail } from "@/lib/auth";
import { hasFullAccess } from "@/lib/auth";
import { getSettings } from "@/lib/config";
import { listPublishedVideos, listLoginVideos } from "@/lib/db";
import LoginScreen from "./login/LoginScreen";
import Feed from "./feed/Feed";

export const dynamic = "force-dynamic";

export default async function Home() {
  const email = currentEmail();
  const settings = getSettings();

  if (!email) {
    const loginVideos = await listLoginVideos().catch(() => []);
    const galleryItems = loginVideos.map((v) => ({
      src: v.hlsUrl,
      thumb: v.thumbnailUrl,
      blur: v.blurInLogin,
    }));
    return <LoginScreen galleryItems={galleryItems} />;
  }

  const [videos, access] = await Promise.all([
    listPublishedVideos().catch(() => []),
    hasFullAccess(email).catch(() => false),
  ]);

  return <Feed videos={videos} hasAccess={access} freeLimit={settings.freeLimit} email={email} />;
}
