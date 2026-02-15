import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, nextRuntime }) => {
    // Fix "__dirname is not defined" in Vercel serverless/edge
    // Some ncc-compiled dependencies reference __dirname
    if (isServer) {
      config.node = {
        ...config.node,
        __dirname: true,
        __filename: true,
      }
    }

    if (nextRuntime === 'edge') {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
      }
    }

    return config
  },
}

export default nextConfig
