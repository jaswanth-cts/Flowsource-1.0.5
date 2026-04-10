import path from 'path'; // Import the path module

import NextFederationPlugin from "@module-federation/nextjs-mf";
import withSerwistInit from "@serwist/next";

// Get the directory name of the current module
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const remotes = isServer => {
  const location = isServer ? 'ssr' : 'chunks';
  return {
    app1: `app1@${process.env.REMOTE_URL}/_next/static/${location}/remoteEntry.js`,
  };
};

const withSerwist = withSerwistInit({
  // Note: This is only an example. If you use Pages Router,
  // use something else that works, such as "service-worker/index.ts".
  swSrc: "sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: ["/fallback.html"],
  modifyURLPrefix: {
    "": "/_next/",
  }
});

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
        name: 'shell',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {},
        remotes: remotes(options.isServer),
        shared:{},
        extraOptions: {
          exposePages: true,
        },
        // If you want this error to be propagated and handled using ErrorBoundary (to be able to render // fallback component) then you can use the remotes-error-propagation-mf-plugin.
        // Uncomment the line below to do so. 
        // The federation plugin with next-mf retunrs null and does not propagate error if there is an error when loading remote. Keep this commented to use the default behaviour which is to simply return null thus showing blank page for the component
        runtimePlugins:[path.join(__dirname,'remotes-error-propagation-mf-plugin.ts')],
      }),
    );
  return config;
    
  },  
};

export default withSerwist(nextConfig);
