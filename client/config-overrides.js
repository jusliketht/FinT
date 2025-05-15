const {
  override,
  addWebpackPlugin,
  addBabelPlugin,
  useBabelRc,
  adjustStyleLoaders,
} = require('customize-cra');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

module.exports = override(
  // Add Babel plugins
  addBabelPlugin('@babel/plugin-proposal-optional-chaining'),
  addBabelPlugin('@babel/plugin-proposal-nullish-coalescing-operator'),
  
  // Use .babelrc file
  useBabelRc(),
  
  // Optimize CSS
  adjustStyleLoaders(({ use: [, css, postcss, resolve, processor] }) => {
    css.options.sourceMap = process.env.NODE_ENV === 'development';
    if (postcss) {
      postcss.options.sourceMap = process.env.NODE_ENV === 'development';
    }
  }),
  
  // Add webpack plugins
  addWebpackPlugin(
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8,
    })
  ),
  
  // Add service worker
  addWebpackPlugin(
    new WorkboxWebpackPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
      runtimeCaching: [
        {
          urlPattern: /^https?.*/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'https-calls',
            networkTimeoutSeconds: 15,
            expiration: {
              maxEntries: 150,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 1 month
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    })
  ),
  
  // Add bundle analyzer in production
  process.env.ANALYZE &&
    addWebpackPlugin(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: 'bundle-report.html',
      })
    )
); 