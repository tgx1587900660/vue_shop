import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 引入 element-ui 和自定义全局样式
import './plugins/element.js'
import './assets/css/global.css'

// 引入第三方字体图标 阿里icon
import './assets/fonts/iconfont.css'

// 引入表格树依赖项 vue-table-with-tree-grid
import TableTree from 'vue-table-with-tree-grid'

// 引入富文本编辑器 vue-quill-editor
import VueQuillEditor from 'vue-quill-editor'
// 引入富文本编辑器样式 require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// (优化页面加载进度)导入 Nprogress进度条 插件的js和css
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 引入axios,并配置全局
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 设置 axios 请求头（优化开始加载进度条）
axios.interceptors.request.use(config => {
  NProgress.start() // 进度条开始
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // console.log(config)
  return config
})

// 设置 axios 响应头（优化结束加载进度条）
axios.interceptors.response.use(config => {
  NProgress.done() // 进度条结束
  return config
})

// 全局注册 axios
Vue.prototype.$http = axios

// 浏览器控制台的提示信息是否开启
Vue.config.productionTip = false

// 全局注册运行依赖表格树插件：vue-table-with-tree-grid
Vue.component('tree-table', TableTree)

// 全局注册运行依赖富文本编辑器：vue-quill-editor
Vue.use(VueQuillEditor)

// 全局注册一个过滤器，处理时间格式
Vue.filter('dateFormat', function(originTime) {
  const dt = new Date(originTime)
  const y = dt.getFullYear()
  let m = dt.getMonth() + 1
  m = m < 10 ? '0' + m : m
  const d = dt.getDate()
  let hh = dt.getHours()
  hh = hh < 10 ? '0' + hh : hh
  let mm = dt.getMinutes()
  mm = mm < 10 ? '0' + mm : mm
  let ss = dt.getSeconds()
  ss = ss < 10 ? '0' + ss : ss
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

// 把路由挂在到实例对象中
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
