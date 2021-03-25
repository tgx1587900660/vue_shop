<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 设置提示文本 -->
      <el-alert title="注意！只允许选择第三级分类设置相关参数" type="warning" show-icon :closable="false">
      </el-alert>
      <!-- 参数设置级联选择框 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader v-model="selectedCateKeys" :options="catesList" :props="cateProps" @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- tab栏切换 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数设置 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled"  @click="addDialogVisible=true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTabData" stripe style="width: 100%" border>
            <el-table-column type="expand">
              <!-- 展开项tag -->
              <template v-slot='slotProps'>
                <!-- {{slotProps.row.attr_vals}} -->
                <el-tag type="primary" :key="i" v-for="(item,i) in slotProps.row.attr_vals" closable @close="handleClosed(i,slotProps.row)">{{item}}</el-tag>
                <!-- 新建属性标签 -->
                <el-input class="input-new-tag" v-if="slotProps.row.inputVisible" v-model="slotProps.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(slotProps.row)" @blur="handleInputConfirm(slotProps.row)"></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(slotProps.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="slotProps">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(slotProps.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(slotProps.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性设置 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
          <!-- 静态参数表格 -->
          <el-table :data="onlyTabData" stripe style="width: 100%" border>
            <el-table-column type="expand">
              <!-- 展开项tag -->
              <template v-slot='slotProps'>
                <!-- {{slotProps.row.attr_vals}} -->
                <el-tag type="primary" :key="i" v-for="(item,i) in slotProps.row.attr_vals" closable @close="handleClosed(i,slotProps.row)">{{item}}</el-tag>
                <!-- 新建属性标签 -->
                <el-input class="input-new-tag" v-if="slotProps.row.inputVisible" v-model="slotProps.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(slotProps.row)" @blur="handleInputConfirm(slotProps.row)"></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(slotProps.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="slotProps">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(slotProps.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(slotProps.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog :title="'添加'+dialogTitile" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addParamsForm" :rules="addParamsFormRules" ref="addParamsFormRef">
        <el-form-item :label="dialogTitile" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name" style="width:80%"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog :title="'修改'+dialogTitile" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editParamsForm" :rules="editParamsFormRules" ref="editParamsFormRef" label-width="100px">
        <el-form-item :label="dialogTitile" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"  style="width:80%"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="modifyParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      catesList: [],
      // 级联双向绑定的数组(存储选中值的标识,与配置对象props中的value配合使用)
      selectedCateKeys: [],
      // 级联选择器配置对象
      cateProps: {
        // 打开级联的方式
        expandTrigger: 'hover',
        // 选中值的标识
        value: 'cat_id',
        // 看到的选项
        label: 'cat_name',
        // 级联的节点
        children: 'children'
      },
      // tab栏默认值： only 静态 many 动态
      activeName: 'many',
      // 动态tab数据
      manyTabData: [],
      // 静态tab数据
      onlyTabData: [],
      // 控制添加对话框显示
      addDialogVisible: false,
      // 添加对话框动态绑定的数据
      addParamsForm: {
        attr_name: ''
      },
      // 添加参数的验证规则
      addParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入参数或属性名', trigger: 'blur' }
        ]
      },
      // 控制修改对话框显示
      editDialogVisible: false,
      // 修改对话框动态绑定的数据
      editParamsForm: {
        attr_name: ''
      },
      // 修改参数的验证规则
      editParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入参数或属性名', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      // console.log(res.data)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }

      this.catesList = res.data
      // console.log(this.catesList)
    },
    // 级联值改变时触发(配合v-model的值使用)
    handleChange() {
      this.getParamsList()
    },
    // tab栏切换触发事件
    handleTabClick() {
      this.getParamsList()
      // 渲染参数
    },
    // 获取动态/静态参数
    async getParamsList() {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        // 用于解决 bug 选中非三级分类时，把动静数据都清空
        this.manyTabData = []
        this.onlyTabData = []
        return
      }
      // console.log(this.selectedCateKeys)
      // 查询参数请求
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('查询参数失败')
      }

      // 循环 res.data 把 attr_vals 变成数组,用于渲染成动态参数tag
      res.data.forEach((item) => {
        // 防止 attr_vals 为空时被分隔成 [""]
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 添加自定义属性，控制 tag 新建标签的输入框（否则共用一个值全参数tag联动）
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(res.data)
      // 返回参数后判断是静态还是动态
      if (this.activeName === 'many') {
        this.manyTabData = res.data
        // console.log(this.manyTabData)
      } else {
        this.onlyTabData = res.data
        // console.log(this.onlyTabData)
      }
    },
    // 监听添加对话框关闭事件
    addDialogClosed() {
      this.$refs.addParamsFormRef.resetFields()
    },
    // 添加参数请求
    addParams() {
      console.log(this.addParamsForm.attr_name)
      this.$refs.addParamsFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeName
          }
        )
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }

        // 添加成功：提示 刷新 关闭
        this.$message.success('添加参数成功')
        this.getParamsList()
        this.addDialogVisible = false
      })
    },
    // 显示编辑对话框
    async showEditDialog(id) {
      // console.log(id) // 属性 ID
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${id}`,
        {
          params: {
            attr_sel: this.activeName
          }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败')
      }

      // 获取成功则渲染、显示
      this.editParamsForm = res.data
      this.editDialogVisible = true
      // console.log(this.editParamsForm)
    },
    // 关闭对话框重置表单
    editDialogClosed() {
      this.$refs.editParamsFormRef.resetFields()
    },
    // 点击按钮提交修改表单
    modifyParams() {
      // console.log(this.editParamsForm.attr_id) // 属性ID
      this.$refs.editParamsFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`,
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('参数更新失败')
        }

        // 成功：提示 刷新 关闭
        this.$message.success('参数更新成功')
        this.getParamsList()
        this.editDialogVisible = false
      })
    },
    // ID删除参数
    async removeParams(attrid) {
      const confirmPromise = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)

      if (confirmPromise !== 'confirm') {
        return this.$message.info('取消删除参数成功')
      }

      // 确认删除，发起请求
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attrid}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }

      // 刷新 提示
      this.$message.success('删除参数成功')
      this.getParamsList()
    },
    // 标签输入框回车、失去交点发生的事件
    async handleInputConfirm(props) {
      // console.log(props)
      // 先判断输入内容是否为空，进行短路运算，添加到原数组中
      if (!props.inputValue.trim()) {
        props.inputVisible = false
        props.inputValue = ''
        return
      }
      props.attr_vals.push(props.inputValue.trim())
      props.inputVisible = false
      props.inputValue = ''
      // 前端修改完成，发起请求添加数据
      this.saveAttrVals(props)
    },
    // 点击新建标签，显示输入框
    showInput(props) {
      props.inputVisible = true
      // $nextTick方法的作用：当页面被渲染完成后(input输入框替换button按钮完成后)，执行的回调函数
      this.$nextTick((_) => {
        // 让input输入框自动获取焦点(原生方法)
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除tag标签事件
    handleClosed(i, props) {
      // 从该 tag 标签索引 i 开始删除 1 个，会修改原数组
      props.attr_vals.splice(i, 1)
      this.saveAttrVals(props)
    },
    // 将对 attr_vals 的操作保存到数据库
    async saveAttrVals(props) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${props.attr_id}`,
        {
          attr_name: props.attr_name,
          attr_sel: props.attr_sel,
          attr_vals: props.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('更新参数失败')
      }
      this.$message.success('更新参数成功')
    }
  },
  created() {
    // 页面创造时获取商品分类列表
    this.getCateList()
  },
  computed: {
    // 控制参数按钮是否禁用
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 根据是否选中三级分类，决定是否发起参数查询
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        // 返回三级分类 ID
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 对话框的标题
    dialogTitile() {
      if (this.activeName === 'only') {
        return '静态属性'
      }
      return '动态参数'
    }
  }
}
</script>

<style lang='less' scoped>
  .el-row {
    margin-top: 15px;
  }
  .el-tag {
    margin: 10px;
  }
  .el-input {
    width: 150px;
  }
</style>
