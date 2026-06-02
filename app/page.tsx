import { currentEmail } from "@/lib/auth";
import { getSettings } from "@/lib/config";
import { listPublishedVideos, isBuyer } from "@/lib/db";
import LoginScreen from "./login/LoginScreen";
import Feed from "./feed/Feed";

export const dynamic = "force-dynamic";

export default async function Home() {
  const email = currentEmail();
  const settings = getSettings();

  if (!email) {
    const videos = await listPublishedVideos().catch(() => []);
    const galleryItems = videos.map((v) => ({ src: v.hlsUrl, thumb: v.thumbnailUrl }));
    return <LoginScreen loginBlur={settings.loginBlur} galleryItems={galleryItems} />;
  }

  const [videos, hasAccess] = await Promise.all([
    listPublishedVideos().catch(() => []),
    isBuyer(email).catch(() => false),
  ]);

  return <Feed videos={videos} hasAccess={hasAccess} freeLimit={settings.freeLimit} />;
}
