import { iconImage } from "@/lib/og";
import { getSite } from "@/lib/site-settings";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const revalidate = 3600;

export default async function AppleIcon() {
  return iconImage((await getSite()).monogram, 180);
}
