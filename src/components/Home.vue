<template>
  <el-container class="home-contaner">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 内容区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="button-toggle" @click="toggleCollapse">| | |</div>
        <!-- 一级菜单 -->
        <el-menu background-color="#313743" text-color="#fff" active-text-color="#438ace" unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
          <el-submenu :index="item.id + ''" :key='item.id' v-for='item in menuList'>
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subitem.path" :key='subitem.id' v-for='subitem in item.children' @click="saveNavStatus('/' + subitem.path)">
              <template slot="title">
              <i class="el-icon-menu"></i>
              <span>{{subitem.authName}}</span>
            </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体区 -->
      <el-main>
        <!-- Welcome占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      iconsObj: {
        125: 'iconfont icon-users',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 是否折叠
      isCollapse: false,
      // 激活的菜单
      activePath: ''
    }
  },
  // 生命周期函数，当该组件被创造时
  created() {
    // 页面被创造时请求菜单
    this.getMenuList()
    // 页面被创造时取出 sessionStorage 的菜单路由
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 点击按钮退出
    logout() {
      if (!confirm('确定退出吗？')) return
      window.sessionStorage.removeItem('token')
      this.$router.push('/login')
    },
    // 获取菜单列表
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      console.log(res.data)
      if (res.meta.status !== 200) return this.$message.error('请求失败')
      this.menuList = res.data
    },
    // 点击按钮，折叠展开导航栏
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 保存连接激活状态
    saveNavStatus(activePath) {
      // console.log(activePath)
      window.sessionStorage.setItem('activePath', activePath) // 保存点击菜单的路由
      this.activePath = window.sessionStorage.getItem('activePath')
    }
  }
}
</script>

<style lang="less" scoped>
  .home-contaner {
    height: 100%;
  }

  .el-header {
    background-color: #363d40;
    padding-left: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    font-size: 20px;

    & > div {
      display: flex;
      align-items: center;

      span {
        margin-left: 10px;
      }
    }
  }

  .el-aside {
    background-color: #313743;

    .button-toggle {
      color: #fff;
      width: 100%;
      text-align: center;
      letter-spacing: 0.2em;
      line-height: 24px;
      font-size: 10px;
      background-color: #495064;
      cursor: pointer;
    }

    .iconfont {
      margin-right: 15px;
    }

    .el-menu {
      border-right: none;
    }
  }

  .el-main {
    background-color: #e9edf1;
  }
</style>
