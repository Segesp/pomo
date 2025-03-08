/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    MONGODB_URI: process.env.MONGODB_URI || "mongodb+srv://segoviav30:29DeJunioDel2001.@cluster0.msopz.mongodb.net/pomodoro?retryWrites=true&w=majority&appName=Cluster0",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "pomodoro_app_secret_key",
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp4|webm|ogg)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/videos/',
          outputPath: 'static/videos/',
          name: '[name].[hash].[ext]',
        },
      },
    });
    return {
      ...config,
      resolve: {
        ...config.resolve,
        fallback: {
          ...config.resolve?.fallback,
          fs: false,
          dns: false,
          net: false,
          tls: false,
        },
      },
    };
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          }
        ]
      }
    ]
  },
  images: {
    domains: ['i.ytimg.com'],
    minimumCacheTTL: 60,
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path*',
          has: [
            {
              type: 'query',
              key: 'path',
              value: '(?:^|\\/)\\.',
            },
          ],
          destination: '/404',
        },
      ],
    }
  },
  devIndicators: {
    buildActivity: true,
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  }
}

console.log('Configuración de Next.js cargada. MONGODB_URI definido:', !!process.env.MONGODB_URI);

module.exports = nextConfig