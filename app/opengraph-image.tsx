import { ogImage, ogSize } from "@/lib/og";
import { getSite } from "@/lib/site-settings";

export const alt = "Portfolio — visual identity, graphic design and data analysis";
export const size = ogSize;
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image() {
  const site = await getSite();
  return ogImage({ label: "Portfolio", title: site.name, name: site.monogram, role: site.role });
}
