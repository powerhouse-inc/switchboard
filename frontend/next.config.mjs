/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SWITCHBOARD_GRAPHQL_HOST:
      process.env.NEXT_PUBLIC_SWITCHBOARD_GRAPHQL_HOST ||
      "https://ph-switchboard-nginx-prod-c84ebf8c6e3b.herokuapp.com",
    NEXT_PUBLIC_BASE_PATH: process.env.BASE_PATH ?? "",
  },
  basePath: process.env.BASE_PATH ?? "/",
  assetPrefix: process.env.BASE_PATH ?? "/",
};

export default nextConfig;
