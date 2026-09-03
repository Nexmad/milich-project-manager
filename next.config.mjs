const isPages = process.env.GITHUB_ACTIONS === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  basePath: isPages ? '/milich-project-manager' : '',
  assetPrefix: isPages ? '/milich-project-manager/' : undefined,
  images: { unoptimized: true }
};
export default nextConfig;
