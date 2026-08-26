import type { Metadata } from "next";
import ImageMetadataPage from "./client";

export const metadata: Metadata = {
  title: "Image Metadata Viewer",
  description: "Inspect EXIF and other metadata embedded in an image.",
  openGraph: {
    title: "Pantane DevTools — Image Metadata Viewer",
    description: "Inspect EXIF and other metadata embedded in an image.",
  },
};

export default function ImageMetadataPageRoute() {
  return <ImageMetadataPage />;
}
