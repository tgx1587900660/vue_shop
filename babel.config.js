// 只有项目发布阶段才需要的 babel 插件
const prodPlugins = []
if (process.env.NODE_ENV === 'production') {
  // 如果是生产阶段，把插件 push 进空数组，用 ...[] 转到其他数组
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  plugins: [
    // 借助插件 component 按需加载 elementUI
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // 展开运算符，添加插件（用于移除所有输出console）
    ...prodPlugins,
    // 路由懒加载插件配置
    '@babel/plugin-syntax-dynamic-import'
  ]
}
