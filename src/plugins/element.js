import Vue from 'vue'
import {
  Form, FormItem, Input, Button, Message,
  Container, Header, Aside,
  Main, Menu, Submenu, MenuItem,
  Breadcrumb, BreadcrumbItem, Card, Row, Col,
  Table, TableColumn, Switch, Tooltip, Pagination, Dialog,
  MessageBox, Tag, Tree, Select, Option, Cascader, Alert,
  TabPane, Tabs, Steps, Step, CheckboxGroup, Checkbox, Upload,
  // 如果版本过低，则需要自己导入 timeline时间线 ui组件
  Timeline, TimelineItem
} from 'element-ui'

// 如果版本过低，则需要自己导入 timeline时间线 ui组件
// import Timeline from './timeline/index.js'
// import TimelineItem from './timeline-item/index.js'

Vue.use(Aside)
Vue.use(Alert)
Vue.use(Button)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Container)
Vue.use(Col)
Vue.use(Card)
Vue.use(Cascader)
Vue.use(CheckboxGroup)
Vue.use(Checkbox)
Vue.use(Dialog)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Header)
Vue.use(Input)
Vue.use(Main)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(Option)
Vue.use(Pagination)
Vue.use(Row)
Vue.use(Submenu)
Vue.use(Switch)
Vue.use(Select)
Vue.use(Steps)
Vue.use(Step)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Tooltip)
Vue.use(Tag)
Vue.use(Tree)
Vue.use(TabPane)
Vue.use(Tabs)
Vue.use(Timeline)
Vue.use(TimelineItem)
Vue.use(Upload)

// 全局配置 Message 弹窗（有error、success方法）
Vue.prototype.$message = Message
// 全局配置 MessageBox 下的一个方法 confirm
Vue.prototype.$confirm = MessageBox.confirm
