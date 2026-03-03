/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**.supabase.co' },
            { protocol: 'https', hostname: 'oaidalleapiprodscus.blob.core.windows.net' },
            { protocol: 'https', hostname: '**.replicate.delivery' },
        ],
    },
    experimental: {
        serverComponentsExternalPackages: [],
    },
};

module.exports = nextConfig;
