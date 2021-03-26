<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-alert title="消息提示的文案" type="info" center show-icon></el-alert>
      <!-- 步骤进度(active 要隐式转为数值型) -->
      <el-steps :space="200" align-center :active="activeIndex - 0" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 提交表单 addForm -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <!-- 左侧tab栏切换 -->
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <!-- 基本信息栏 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :props="cascaderProps" :options="cateList" @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品动态参数栏 -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" :key="item.attr_id" v-for="item in manyTableData">
              <!-- {{item.attr_vals}} -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="item2" :key="i" v-for="(item2,i) in item.attr_vals"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品静态属性栏 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" :key="item.attr_id" v-for="item in onlyTableData">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 图片上传栏 -->
          <el-tab-pane label="商品图片" name="3">
            <!-- ⭐upload 组件需要手动指定请求头token -->
            <el-upload :headers="uploadObj" :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" :on-success="uploadSuccess" list-type="picture"><el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="picDialogVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // tab栏、步骤位置联动数据
      activeIndex: '0',
      // 提交的表单
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 级联选中的ID
        goods_cat: '',
        // 上传图片的数组
        pics: [],
        // 商品描述
        goods_introduce: '',
        // 商品的参数(动、静)
        attrs: []
      },
      // 提交表单的验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [{ required: true, message: '请选择分类', trigger: 'blur' }]
      },
      // 级联框商品分类列表
      cateList: [],
      // 级联框配置对象
      cascaderProps: {
        // 展开级联的方式click/hover
        expandTrigger: 'hover',
        // 选中的类的标记（一般为ID）
        value: 'cat_id',
        // 看到的分类名
        label: 'cat_name',
        // 父子嵌套的属性
        children: 'children'
      },
      // 动态参数列表
      manyTableData: [],
      // 静态属性列表
      onlyTableData: [],
      // 图片上传的api接口路径
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 为图片设置请求头
      uploadObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 控制图片预览对话框显示
      picDialogVisible: false,
      // 预览图片的地址
      previewPath: ''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取级联框商品分类
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 级联选择器值改变时触发
    handleChange() {
      // console.log(this.addForm.goods_cat.join(','))
      // 如果选的不是三级分类，则清空重选
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // tab栏切换前的钩子，可条件阻止tab切换
    beforeTabLeave(activeName, oldActiveName) {
      // console.log(activeName, oldActiveName)
      // activeName：当前tab栏的 name 值
      // oldActiveName： 将要前往的tab栏的 name 值
      if (oldActiveName !== 0 && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择分类')
        return false
      }
    },
    // 切换tab栏时触发
    async tabClicked() {
      // console.log(this.activeIndex) // 当前栏的name
      // console.log(this.cateId)

      // 如果进入商品动态参数栏'1'，查询参数列表
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'many'
            }
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('获取参数信息失败')
        }

        // 把字符串 attr_vals 转为数组
        res.data.forEach((item) => {
          // 判断有无数据，防止空字符串被转为 [""]
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        this.manyTableData = res.data
        console.log(this.manyTableData)
      } else if (this.activeIndex === '2') {
        // 如果进入商品静态属性栏'2'，查询参数列表
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'only'
            }
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('获取参数信息失败')
        }

        this.onlyTableData = res.data
        console.log(this.onlyTableData)
      }
    },
    // 点击图片预览触发的事件
    handlePreview(file) {
      // console.log(file) // 可收集图片的地址
      this.previewPath = file.response.data.url
      this.picDialogVisible = true
    },
    // 移除图片时的钩子函数
    handleRemove(file) {
      // console.log(file) // 移除时返回的数据
      // 1.拿到图片的临时路径
      const picPath = file.response.data.tmp_path
      // 2.根据路径查找该图片在数组中的索引
      const i = this.addForm.pics.findIndex((item) => item.pic === picPath)
      // 3.用splice移除图片
      this.addForm.pics.splice(i, 1)
      // console.log(this.addForm)
    },
    // 图片上传成功后的钩子函数(res为上传成功后返回的数据)
    uploadSuccess(res) {
      // console.log(res.data.tmp_path)
      // 先拼接成对象，再push进pics[]请求参数中
      const pic = { pic: res.data.tmp_path }
      this.addForm.pics.push(pic)
      // console.log(this.addForm)
    },
    addGoods() {
      // console.log(this.addForm)
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请确认商品信息')
        }

        // 预验证合格，发起添加操作
        // console.log(this.addForm)
        // console.log(this.manyTableData) // 动态
        // console.log(this.onlyTableData) // 静态
        // 1、处理请求参数 attrs (两个对象，分别包含动静态参数的ID和val值)
        //    处理动态参数
        this.manyTableData.forEach((item) => {
          this.addForm.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          })
        })
        //    处理静态参数
        this.onlyTableData.forEach((item) => {
          this.addForm.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          })
        })
        // 2、处理属性 goods_cat (数组转为字符串，因为他是动态绑定的数组，但是需要以字符串形式传递)
        //    也可以对 this.addForm 进行深拷贝，再转换 goods_cat ，再把拷贝后的对象传入请求参数中
        // console.log(this.addForm)// 需要在传参中处理goods_cat
        const { data: res } = await this.$http.post('goods', {
          goods_name: this.addForm.goods_name,
          goods_cat: this.addForm.goods_cat.join(','),
          goods_price: this.addForm.goods_price,
          goods_number: this.addForm.goods_number,
          goods_weight: this.addForm.goods_weight,
          goods_introduce: this.addForm.goods_introduce,
          pics: this.addForm.pics,
          attrs: this.addForm.attrs
        })

        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }

        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        // 计算属性返回选中的分类ID
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang='less' scoped>
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }
  .previewImg {
    width: 100%;
  }
  .el-button {
    margin-top: 15px;
  }
</style>
