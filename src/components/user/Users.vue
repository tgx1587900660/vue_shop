<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索与输入 -->
      <el-row :gutter="25">
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="queryData.query" @change="getUserList" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="isAddVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 添加用户对话框 -->
      <el-dialog title="添加用户" :visible.sync="isAddVisible" width="50%" @close="addDialogClose">
        <!-- 对话框主体 -->
        <el-form ref="ruleFormRef" label-width="80px" :model="ruleForm" :rules="addFormRules">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="ruleForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="ruleForm.password" type="password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="ruleForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="ruleForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 对话框底部 -->
        <span slot="footer">
          <el-button @click="isAddVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户对话框 -->
      <el-dialog title="修改用户" :visible.sync="isEditVisible" width="50%" @close="editDialogClose">
        <el-form ref="editFormRef" label-width="80px" :model="editForm" :rules="editFormRules">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="isEditVisible = false">取 消</el-button>
          <el-button type="primary" @click="modifyUser">
            确 定
          </el-button>
        </span>
      </el-dialog>
      <!-- 用户列表渲染 -->
      <el-table :data="userList" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template v-slot:default="slotProps">
            <el-switch v-model="slotProps.row.mg_state" @change="userStatusChanged(slotProps.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot:default="slotProps">
            <el-button @click="editUser(slotProps.row.id)" type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button @click="removeUserById(slotProps.row.id)" type="danger" icon="el-icon-delete" size="mini"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="getRoles(slotProps.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 页码 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryData.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryData.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </el-card>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRolesDialogVisible" width="50%" @close="setRolesDialogClosed">
      <div>
        <p>当前的用户：{{ userInfo.username }}</p>
        <p>当前的角色：{{ userInfo.role_name }}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id"> </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRoles">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var checkEmail = (rule, value, cb) => {
      rule = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if (!rule.test(value)) return cb(new Error('请输入正确的邮箱'))
      cb()
    }
    var checkMobile = (rule, value, cb) => {
      rule = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
      if (!rule.test(value)) return cb(new Error('请输入正确的手机号'))
      cb()
    }
    return {
      queryData: {
        query: '', // 查询参数
        pagenum: 1, // 当前页
        pagesize: 5 // 每页几条
      },
      userList: [],
      total: 0, // 总页数
      isAddVisible: false, // 添加用户弹窗控制
      ruleForm: {
        // 表单项 prop
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入用密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '邮箱名不能为空' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '手机号不能为空' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      isEditVisible: false, // 修改用户弹窗控制
      editForm: {
        username: ''
      }, // 保存要修改的用户
      editFormRules: {
        email: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '手机号不能为空' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制分配角色对话框
      setRolesDialogVisible: false,
      // 角色分配对话框信息渲染
      userInfo: {},
      // 所有角色列表
      roleList: [],
      // 选择要分配的角色ID
      selectedRoleId: ''
    }
  },
  methods: {
    // 获取用户列表
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryData
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      // 获取成功时
      this.userList = res.data.users
      this.total = res.data.total
      // console.log(this.userList)
    },
    // 用户状态更改
    async userStatusChanged(userInfo) {
      // console.log(userInfo)
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      // console.log(res.meta)
      if (res.meta.status !== 200) {
        return this.$message.error('更改用户状态失败')
      }
      this.$message.success('更改用户状态成功')
    },
    // 监听当前 pagesize 每页多少条
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryData.pagesize = newSize
      this.getUserList()
    },
    // 监听当前的页码 pagenum
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryData.pagenum = newPage
      this.getUserList()
    },
    // 弹窗关闭清空表单
    addDialogClose() {
      this.$refs.ruleFormRef.resetFields()
    },
    // 添加用户
    addUser() {
      this.$refs.ruleFormRef.validate(async valid => {
        // 格式预验证
        if (!valid) return

        // 发送请求 console.log(this.ruleForm)
        const { data: res } = await this.$http.post('users', this.ruleForm)

        // console.log(res.meta.status)
        if (res.meta.status !== 201) {
          return this.$message.error('格式不正确')
        }
        // 关闭 刷新 提示
        this.isAddVisible = false
        this.getUserList()
        this.$message.success('添加成功')
      })
    }, // 弹窗关闭清空表单
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 查询要修改的用户信息
    async editUser(id) {
      // 据id查用户查询 this.editForm
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户失败')
      }
      this.editForm = res.data

      // 显示弹窗
      this.isEditVisible = true
      // console.log(this.editForm)
    },
    modifyUser() {
      // console.log(id)
      this.$refs.editFormRef.validate(async valid => {
        // 格式预验证
        if (!valid) return
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        // 成功后刷新并关窗口 console.log(res.meta.status)
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败')
        }
        // 关闭 刷新 提示
        this.isEditVisible = false
        this.getUserList()
        this.$message.success('修改成功')
      })
    },
    // id删除用户
    async removeUserById(id) {
      // console.log(id)
      // 如过确定，返回字符串 confirm
      // 如过取消，返回字符串 cancel
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(confirmResult)
      if (confirmResult === 'cancel') {
        return this.$message.info('取消删除用户')
      }

      // 发送删除请求
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      // console.log(res)
      // 刷新 提示
      this.getUserList()
      this.$message.success('修改成功')
    },
    // 获取将要分配角色的用户信息，并渲染角色列表
    async getRoles(userInfo) {
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户角色列表失败')
      }

      this.roleList = res.data
      // console.log(this.userInfo)
      this.setRolesDialogVisible = true
    },
    // 设置用户角色
    async setRoles() {
      // users/:id/role 参数：用户ID、角色ID
      // console.log(this.selectedRoleId)
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要设置的角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('设置用户角色失败')
      }

      this.$message.success('设置用户角色成功')
      this.getUserList()
      this.setRolesDialogVisible = false
    },
    // 监听设置用户角色对话框关闭事件
    setRolesDialogClosed() {
      // 清空选择框
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  },
  // 页面被创造时
  created() {
    // 发起用户列表查询
    this.getUserList()
  }
}
</script>

<style lang="less" scoped></style>
