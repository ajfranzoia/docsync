const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config');

console.log(config.output.publicPath)
new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: {
	  index: 'static/index.html'
	}
}).listen(5000, 'localhost', (err) => {
  if (err) {
    console.log(err);
  }
  console.log('Listening at localhost:5000');
});