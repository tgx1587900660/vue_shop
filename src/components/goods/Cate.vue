<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 分类表格渲染 -->
      <tree-table class="table-tree" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">
        <!-- 是否有效 -->
        <template v-slot:isOk="slotProps">
          <i class="el-icon-success" style="color:lightgreen" v-if="slotProps.row.cat_deleted === false"></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>
        <!-- 排序 -->
        <template v-slot:order="slotProps">
          <el-tag v-if="slotProps.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="slotProps.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template v-slot:opt="slotProps">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCate(slotProps.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(slotProps.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
      <!-- 对话框主体 -->
      <el-form ref="addCateFormRef" label-width="100px" :model="addCateForm" :rules="addCateFormRules">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <!-- 级联选择器 -->
        <el-form-item label="该分类父级：">
          <!-- options 绑定父级分类数组 -->
          <!-- props 级联配置对象 -->
          <el-cascader v-model="selectedAddCateId" :options="parentCateList" :props="cascaderProps" @change="addFormChange" clearable show-all-levels> </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editCateDialogVisible" width="50%" @close="editCateDialogClosed">
      <!-- 对话框主体 -->
      <el-form ref="editCateFormRef" label-width="100px" :model="editCateForm" :rules="editCateFormRules">
        <el-form-item label="分类id：" prop="cat_id">
          <el-input v-model="editCateForm.cat_id" disabled></el-input>
        </el-form-item>
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="modifyCate(editCateForm.cat_id)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 查询条件参数
      queryInfo: {
        // 查询3层
        type: 3,
        // 当前页
        pagenum: 1,
        // 每页5条
        pagesize: 5
      },
      // 分类总数
      total: 0,
      // 为表格指定列 标题和数据
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 当前列为自定义模版
          type: 'template',
          // 当前自定义列模版的名称
          template: 'isOk'
        },
        {
          label: '排序',
          // 当前列为自定义模版
          type: 'template',
          // 当前自定义列模版的名称
          template: 'order'
        },
        {
          label: '操作',
          // 当前列为自定义模版
          type: 'template',
          // 当前自定义列模版的名称
          template: 'opt',
          width: '190px'
        }
      ],
      // 控制添加分类对话框显示
      addCateDialogVisible: false,
      // 要添加的分类表单数据
      addCateForm: {
        // 要添加的分类名称
        cat_name: '',
        // 分类的父级ID
        cat_pid: 0,
        // 分类的层级，0一级，1二级，2三级
        cat_level: 0
      },
      // 添加分类的规则
      addCateFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      },
      // 父级分类列表数据
      parentCateList: [],
      // 级联选择器的配置对象
      cascaderProps: {
        // 展开级联的方式click/hover
        expandTrigger: 'hover',
        // 是否允许不选择端节点
        checkStrictly: true,
        // 选中的类的标记（一般为ID）
        value: 'cat_id',
        // 看到的分类名
        label: 'cat_name',
        // 父子嵌套的属性
        children: 'children'
      },
      // 级联选中的 ID 存储一级,二级,三级...ID号(添加)
      selectedAddCateId: [],
      // 控制编辑分类对话框显示
      editCateDialogVisible: false,
      // 要修改的分类表单数据
      editCateForm: {
        // 要修改的分类名称
        cat_name: ''
      },
      // 要修改的分类的规则
      editCateFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    // 获取商品所有列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        this.$message.error('获取分类失败')
      }

      this.cateList = res.data.result
      this.total = res.data.total
      // console.log(this.total)
    },
    // 监听每页显示 pagesize 条
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听当前是第 pagenum 页
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击按钮，显示添加分类对话框
    showAddCateDialog() {
      // 先获取列表，再展示对话框
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      // console.log(res.data)
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类列表失败')
      }
      // 把父级分类存入 parentCateList
      this.parentCateList = res.data
    },
    // 监听添加表单改变时
    addFormChange() {
      console.log(this.selectedAddCateId)

      // 长度大于0说明选了分类
      if (this.selectedAddCateId.length > 0) {
        // 该分类的等级 cat_level
        this.addCateForm.cat_level = this.selectedAddCateId.length
        // 父级分类ID： cat_pid 为最后一个
        this.addCateForm.cat_pid = this.selectedAddCateId[this.selectedAddCateId.length - 1]
      } else {
        // 否则，还原默认值
        this.addCateForm.cat_level = 0
        this.addCateForm.cat_pid = 0
      }
    },
    // 添加分类对话框关闭时触发
    addCateDialogClosed() {
      // 清空分类名和级联数据
      this.$refs.addCateFormRef.resetFields()
      this.selectedAddCateId = []
      // 重置分类等级和父分类ID
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 添加分类
    addCate() {
      // console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }

        // 添加成功：提示 更新 关闭
        // console.log(res)
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 查询要修改的分类
    async editCate(id) {
      // console.log(id)
      const { data: res } = await this.$http.get('categories/' + id)
      // console.log(res.data)
      if (res.meta.status !== 200) return

      // 查询成功，填充表单，并获取父级分类
      this.editCateForm = res.data
      this.getParentCateList()
      this.editCateDialogVisible = true
      // console.log(this.editCateForm.cat_name, id)
    },
    // 点击确定修改分类
    modifyCate(id) {
      // console.log(id)
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        // console.log(this.editCateForm.cat_name, id)
        const { data: res } = await this.$http.put('categories/' + id, this.editCateForm)
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('更新分类失败')
        }

        // 更新成功：提示 刷新 关闭
        this.$message.success('更新分类成功')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },
    // 编辑分类对话框关闭时触发
    editCateDialogClosed() {
      // 清空分类名和级联数据
      this.$refs.editCateFormRef.resetFields()
      this.selectedAddCateId = []
      // 重置分类等级和父分类ID
      this.editCateForm.cat_level = 0
      this.editCateForm.cat_pid = 0
    },
    // ID删除分类
    async removeCateById(id) {
      // console.log(id)
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(confirmResult)
      if (confirmResult === 'cancel') {
        return this.$message.info('已取消删除分类')
      }

      // 确认：发起删除请求
      const { data: res } = await this.$http.delete('categories/' + id)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败')
      }
      // 刷新 提示
      this.getCateList()
      this.$message.success('删除分类成功')
    }
  },
  created() {
    // 页面创造时获取列表
    this.getCateList()
  }
}
</script>

<style lang="less" scoped>
.table-tree {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
