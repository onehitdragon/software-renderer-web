const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/index.ts', // Entry point of your application
    output: {
      filename: 'bundle.js', // The output bundled file
      path: path.resolve(__dirname, 'dist') // Output directory
    },
    resolve: {
      extensions: ['.ts', '.js'], // Resolve .ts and .js files
    },
    module: {
      rules: [
        {
          test: /\.ts$/,         // Match TypeScript files
          use: 'ts-loader',      // Use ts-loader to compile them
          exclude: /node_modules/
        }
      ]
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: 'src/index.html', to: 'index.html' },  // Include file without processing
        ]
      })
    ],
    mode: 'development'        // Set mode (can be 'production' or 'development')
};