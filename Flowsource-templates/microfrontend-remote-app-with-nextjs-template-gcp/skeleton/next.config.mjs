import NextFederationPlugin from "@module-federation/nextjs-mf";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  webpack(config, options) {
    config.resolve = {
      ...config.resolve,
      extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    };
    
    config.plugins.push(
      new NextFederationPlugin({
        name: 'app1',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './App': './pages/index',   
        },
        remotes: {},
        shared:{},
        extraOptions: {
          exposePages: true,
        },
      }),
    );
  return config;
    
  },  
};

export default nextConfig;