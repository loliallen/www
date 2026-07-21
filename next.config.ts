import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Allow .md / .mdx files to be treated as pages and modules.
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  async redirects() {
    return [
      {
        source: "/:lang(en|ru)/work/:slug",
        destination: "/:lang/experience/:slug",
        permanent: true,
      },
      {
        source: "/:lang(en|ru)/work",
        destination: "/:lang/experience",
        permanent: true,
      },
    ];
  },
};

const withMDX = createMDX({
  // Add remark/rehype plugins here as desired.
});

export default withMDX(nextConfig);
