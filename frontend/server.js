const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');
const config = require('./webpack.config.dev');

new WebpackDevServer(webpack(config), {
  contentBase: path.join(__dirname, 'static'),
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: {
	  index: 'index.html'
	}
}).listen(5000, 'localhost', (err) => {
  if (err) {
    console.log(err);
  }
  console.log('Listening at localhost:5000');
});
