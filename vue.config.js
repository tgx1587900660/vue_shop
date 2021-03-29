// 导出该配置
module.exports = {
  // 1.修改默认打包入口文件(默认main.js)，此处用链式 chainWebpack 修改(值为箭头函数)
  //   (也可用 configureWebpack 通过操作对象修改打包入口文件)
  chainWebpack: config => {
    //   1.1 production(发布), 则打包入口文件为 src/main-prod.js
    config.when(process.env.NODE_ENV === 'production', config => {
      // 把默认入口移除( clear() ),再添加( add.() )
      config.entry('app').clear().add('./src/main-prod.js')

      // webpack 的 externals 节点声明以下资源使用外部 CDN 加载
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })

      // 自定义首页显示(发布模式)
      config.plugin('html').tap(args => {
        // 追加一个属性(代表发布模式)
        args[0].isProd = true
        return args
      })
    })

    //   1.2 development(开发), 则打包入口文件为 src/main-dev.js
    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add('./src/main-dev.js')

      // 自定义首页显示(开发模式)
      config.plugin('html').tap(args => {
        // 追加一个属性(代表 非 发布模式)
        args[0].isProd = false
        return args
      })
    })
  }
}