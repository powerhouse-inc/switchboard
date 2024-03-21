/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SWITCHBOARD_GRAPHQL_HOST:
      process.env.NEXT_PUBLIC_SWITCHBOARD_GRAPHQL_HOST ||
      "https://ph-switchboard-nginx-prod-c84ebf8c6e3b.herokuapp.com",
  },
  basePath: process.env.BASE_PATH ?? undefined,
};

export default nextConfig;
