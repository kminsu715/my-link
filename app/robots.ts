import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://my-link-jet.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/stats", "/api/"],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
