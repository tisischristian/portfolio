import { iconImage } from "@/lib/og";
import { getSite } from "@/lib/site-settings";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Icon() {
  return iconImage((await getSite()).monogram, 64);
}
