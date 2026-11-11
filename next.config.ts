import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { renamedMedia } from "./data/renamed-media";

const nextConfig: NextConfig = {
  // Renamed photos and clips keep their old URLs working, permanently, so
  // nothing already indexed breaks and its ranking moves to the new name.
  async redirects() {
    return renamedMedia.map(({ from, to }) => ({
      source: from,
      destination: to,
      permanent: true,
    }));
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
