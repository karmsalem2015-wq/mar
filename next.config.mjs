/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/mar-cp',
        permanent: false,
      },
      {
        source: '/admin',
        destination: '/mar-cp',
        permanent: false,
      },
      {
        source: '/cp',
        destination: '/mar-cp',
        permanent: false,
      },
      {
        source: '/control-panel',
        destination: '/mar-cp',
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'egkxzaalxtcbujekevwm.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'zrbwtxufgtwtrkjvlwwi.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Security Headers to pass Google Safe Browsing checks
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://egkxzaalxtcbujekevwm.supabase.co https://zrbwtxufgtwtrkjvlwwi.supabase.co https://res.cloudinary.com https://*.tile.openstreetmap.org https://unpkg.com",
              "media-src 'self' blob: https://res.cloudinary.com",
              "connect-src 'self' https://egkxzaalxtcbujekevwm.supabase.co https://zrbwtxufgtwtrkjvlwwi.supabase.co https://api.cloudinary.com https://res.cloudinary.com https://nominatim.openstreetmap.org",
              "frame-src 'self' https://maps.google.com https://www.google.com https://my.matterport.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
