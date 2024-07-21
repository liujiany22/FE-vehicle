module.exports = {
  publicPath: '/', // 配置公共路径，根据需要调整
  outputDir: 'dist', // 构建输出目录
  assetsDir: 'assets', // 静态资源目录
  devServer: {
    port: 80,
    https: false,
    open: true,
  }
};
