import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 引入 element-ui 及其样式
import './plugins/element.js'
import './assets/css/global.css'

// 引入第三方字体图标 阿里icon
import './assets/fonts/iconfont.css'

// 引入表格依赖项 table-tree
import TableTree from 'vue-table-with-tree-grid'

// 引入axios,并配置全局
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 设置 axios 请求头
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // console.log(config)
  return config
})

// 全局注册 axios
Vue.prototype.$http = axios

Vue.config.productionTip = false

// 全局注册 vue-table-with-tree-grid
Vue.component('tree-table', TableTree)

// 把路由挂在到实例对象中
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
