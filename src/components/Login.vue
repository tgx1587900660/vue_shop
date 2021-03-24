
<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 表单区 -->
      <el-form ref="loginFormRef" label-width="0px" class="login_from" :model="loginForm" :rules="rules">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="iconfont icon-user" v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input prefix-icon="iconfont icon-3702mima" v-model="loginForm.password" type="password"></el-input>
        </el-form-item>
        <!-- button -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="loginFormReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    loginFormReset() {
      // 重置表单内容 elementUI提供resetFields()方法
      // console.log(this.$refs.loginFormRef)
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      // 登录验证  elementUI提供validate()方法
      this.$refs.loginFormRef.validate(async (valid) => {
        // console.log(valid); //是否合法，布尔值
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        // console.log(res.meta.status); // 状态码
        if (res.meta.status !== 200) {
          return this.$message.error('登录失败') // error()方法为el提供
        }
        this.$message.success('登录成功')
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .login_container {
    background-color: #2b4b6b;
    height: 100%;
    .login_box {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 450px;
      height: 300px;
      background-color: #fff;
      transform: translate(-50%, -50%);
      border-radius: 5px;

      .avatar_box {
        position: absolute;
        left: 50%;
        width: 130px;
        height: 130px;
        padding: 10px;
        border: 1px solid #eee;
        background-color: #fff;
        border-radius: 50%;
        box-shadow: 0 0 10px #ccc;
        transform: translate(-50%, -50%);

        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: #ccc;
        }
      }
      .login_from {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 10px;
        box-sizing: border-box;

        .btns {
          display: flex;
          justify-content: flex-end;
        }
      }
    }
  }
</style>
