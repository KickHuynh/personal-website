const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    // Main page
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      chunks: ['app'],
    }),
    // Admin page
    new HtmlWebpackPlugin({
      template: './admin.html',
      filename: 'admin.html',
      chunks: ['admin'],
    }),
    // Copy static assets to dist
    new CopyPlugin({
      patterns: [
        { from: 'assets',       to: 'assets'       },
        { from: 'styles',       to: 'styles'        },
        { from: 'icon.svg',     to: 'icon.svg'      },
        { from: 'favicon.ico',  to: 'favicon.ico'   },
        { from: 'robots.txt',   to: 'robots.txt'    },
        { from: 'icon.png',     to: 'icon.png'      },
        { from: '404.html',     to: '404.html'      },
        { from: 'site.webmanifest', to: 'site.webmanifest' },
      ],
    }),
  ],
});
