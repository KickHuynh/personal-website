const path = require('path');

module.exports = {
  entry: {
    app: './scripts/app.js',
    admin: './scripts/admin.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'scripts/[name].js',
    clean: true,
  },
};
