/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skipped on iCloud-synced macOS Desktops: Next's default `.next` racks up
  // 5xx errors because iCloud renames/delays files faster than Next reads them.
  // The `.nosync` suffix is automatically excluded from iCloud Drive sync.
  distDir: ".next.nosync",
  eslint: {
    // Ignore ESLint errors during production builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
