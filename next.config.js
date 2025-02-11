/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
    loader: 'custom',
    loaderFile: './app/image-loader.ts',
  }
}

module.exports = nextConfig 