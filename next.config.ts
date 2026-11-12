import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { renamedMedia } from "./data/renamed-media";

const nextConfig: NextConfig = {
  // Renamed photos and clips keep their old URLs working, permanently, so
  // nothing already indexed breaks and its ranking moves to the new name.
  async redirects() {
    return [
      // The case-study page was removed; the project is on GitHub and in the
      // projects list, so anyone arriving from a saved link lands there.
      {
        source: "/projects/visitor-queue-system",
        destination: "/#projects",
        permanent: true,
      },
      ...renamedMedia.map(({ from, to }) => ({
        source: from,
        destination: to,
        permanent: true,
      })),
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
