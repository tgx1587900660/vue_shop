<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="isAddVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 添加角色对话框 -->
      <el-dialog title="添加角色" :visible.sync="isAddVisible" width="50%" @close="addDialogClose">
        <!-- 对话框主体 -->
        <el-form ref="addRolesFormRef" label-width="80px" :model="addRolesForm" :rules="addRolesFormRules">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRolesForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRolesForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 对话框底部 -->
        <span slot="footer">
          <el-button @click="isAddVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改角色对话框 -->
      <el-dialog title="修改角色" :visible.sync="isEditVisible" width="50%" @close="editDialogClose">
        <!-- 对话框主体 -->
        <el-form ref="editRolesFormRef" label-width="80px" :model="editRolesForm" :rules="editRolesFormRules">
          <el-form-item label="角色 ID" prop="roleId">
            <el-input v-model="editRolesForm.roleId" disabled></el-input>
          </el-form-item>
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRolesForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editRolesForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 对话框底部 -->
        <span slot="footer">
          <el-button @click="isEditVisible = false">取 消</el-button>
          <el-button type="primary" @click="modifyRoles">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 角色列表渲染 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand" label="展开" width="50px">
          <template v-slot:default="slotProps">
            <el-row :key="item1.id" v-for="(item1,i1) in slotProps.row.children" :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']">
              <!-- <pre>{{slotProps.row}}</pre> -->
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag @close="removeTagById(slotProps.row,item1.id)" closable>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二、三级权限 -->
              <el-col :span="19">
                <el-row :key="item2.id" v-for="(item2,i2) in item1.children" :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']">
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <!-- <pre>{{item2.authName}}</pre> -->
                    <el-tag type="success" @close="removeTagById(slotProps.row,item2.id)" closable>{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag @close="removeTagById(slotProps.row,item3.id)" closable :key="item3.id" v-for="(item3) in item2.children" type="warning">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="285px">
          <template  v-slot:default="slotProps">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="editRoles(slotProps.row.id)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRole(slotProps.row.id)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="getRightsList(slotProps.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 权限对话框 -->
    <el-dialog title="权限设置" :visible.sync="setRightsDialogVisible" width="50%" @close="clearDefKeys">
      <el-tree :data="rightsList" :props="rightProps" show-checkbox default-expand-all node-key="id" :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="getCheckedKeys">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 控制权限对话框
      setRightsDialogVisible: false,
      // 绑定的权限列表
      rightsList: [],
      // 绑定的树形控件
      rightProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的权限数组，存储id值
      defKeys: [],
      // 角色列表
      rolesList: [],
      // 控制添加角色对话框
      isAddVisible: false,
      // 添加角色信息
      addRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色规则
      addRolesFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 2,
            max: 6,
            message: '长度在 2 到 6 个字符之间',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入用密码', trigger: 'blur' },
          {
            min: 2,
            max: 15,
            message: '长度在 2 到 15 个字符之间',
            trigger: 'blur'
          }
        ]
      },
      // 控制编辑对话框
      isEditVisible: false,
      // 编辑角色的信息
      editRolesForm: {
        roleId: '',
        roleName: '',
        roleDesc: ''
      },
      // 编辑角色规则
      editRolesFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 2,
            max: 6,
            message: '长度在 2 到 6 个字符之间',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入用密码', trigger: 'blur' },
          {
            min: 2,
            max: 15,
            message: '长度在 2 到 15 个字符之间',
            trigger: 'blur'
          }
        ]
      },
      roleId: ''
    }
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.erroe('获取角色列表失败')
      }
      this.rolesList = res.data
      console.log(this.rolesList)
    },
    // 关闭时重置添加框
    addDialogClose() {
      this.$refs.addRolesFormRef.resetFields()
    },
    // 关闭时重置修改框
    editDialogClose() {
      this.$refs.editRolesFormRef.resetFields()
    },
    // 点击确定添加角色
    addRoles() {
      this.$refs.addRolesFormRef.validate(async (valid) => {
        if (!valid) return // 预验证

        const { data: res } = await this.$http.post('roles', this.addRolesForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        // console.log(res)
        // 添加成功： 关闭 刷新 提示
        this.isAddVisible = false
        this.getRolesList()
        this.$message.success('添加成功')
      })
    },
    // id查询要修改的角色信息
    async editRoles(id) {
      // console.log(id)
      const { data: res } = await this.$http.get('roles/' + id)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色失败')
      }
      // 查询成功，渲染到修改表单
      this.editRolesForm = res.data
      // console.log(this.editRolesForm.roleId)
      this.isEditVisible = true
    },
    // id修改角色信息
    modifyRoles() {
      this.$refs.editRolesFormRef.validate(async (valid) => {
        if (!valid) return

        // 格式正确发起修改
        // console.log(this.editRolesForm.roleId)
        const { data: res } = await this.$http.put(
          'roles/' + this.editRolesForm.roleId,
          {
            roleName: this.editRolesForm.roleName,
            roleDesc: this.editRolesForm.roleDesc
          }
        )
        // console.log(res.meta.status)
        if (res.meta.status !== 200) {
          return this.$message.error('获取角色失败')
        }
        // 添加成功： 关闭 刷新 提示
        this.isEditVisible = false
        this.getRolesList()
        this.$message.success('修改成功')
      })
    },
    // id 删除角色
    async removeRole(id) {
      console.log(id)
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      // console.log(confirmResult)
      if (confirmResult === 'cancel') {
        return this.$message.info('已取消删除角色')
      }

      // 确认：发起删除请求
      const { data: res } = await this.$http.delete('roles/' + id)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      }
      // 刷新 提示
      this.getRolesList()
      this.$message.success('删除成功')
    },
    // id删除权限
    async removeTagById(role, rightsId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除权限')
      }
      // console.log(role, rightsId)
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightsId}`
      )
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      // console.log(role.children, res.data)
      role.children = res.data
    },
    // 获取设置权限树形列表
    async getRightsList(role) {
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }

      this.rightsList = res.data

      // 调用递归函数(传入角色role)，获取最后一层 id 并放入 defKeys 数组
      this.getLeafKeys(role, this.defKeys)
      this.setRightsDialogVisible = true

      this.roleId = role.id // 存储树形节点的ID
      // console.log(this.roleId)
    },
    // 递归函数，获取不包含 children 的节点
    getLeafKeys(node, arr) {
      // 如果当前节点 node 没有 children 说明是最后一层，添加该 node.id 到arr并返回
      if (!node.children) {
        // 递归退出的条件（无children属性）
        return arr.push(node.id)
      }
      // 如果有 children ，则用 forEach 遍历他(node)的children ，调用递归函数getLeafKeys
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },
    // 关闭树形对话框时，清空权限数组 defKeys
    clearDefKeys() {
      this.defKeys = []
    },
    async getCheckedKeys() {
      // `roles/${this.roleId}/rights`,rids 需要参数2个
      // console.log(this.roleId) // 获取角色ID

      // console.log(this.$refs.treeRef.getCheckedKeys()) // 获取最后一级选中的权限ID
      var checkedKeys = this.$refs.treeRef.getCheckedKeys()
      // console.log(this.$refs.treeRef.getHalfCheckedKeys()) // 获取所有半选中权限的ID
      var halfCheckedKeys = this.$refs.treeRef.getHalfCheckedKeys()
      var rids = [...halfCheckedKeys, ...checkedKeys].join(',')
      // console.log(rids)

      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids }
      )
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('更新权限失败')
      }
      // 更新 提示 关闭
      this.getRolesList()
      this.$message.success('更新权限成功')
      this.setRightsDialogVisible = false
    }
  },
  // 页面创造时
  created() {
    this.getRolesList()
  }
}
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 15px;
  }
  .bdbottom {
    border-bottom: 1px solid #000;
  }
  .bdtop {
    border-top: 1px solid #000;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
