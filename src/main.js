import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 引入element-ui
import './plugins/element.js'
import './assets/css/global.css'

// 引入字体图标
import './assets/fonts/iconfont.css'

// 引入axios,并配置全局
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 设置请求头
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // console.log(config)
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
