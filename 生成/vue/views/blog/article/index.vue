<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="作者ID (关联 sys_user.user_id)" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入作者ID (关联 sys_user.user_id)"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="文章标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入文章标题"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="浏览量" prop="viewCount">
        <el-input
          v-model="queryParams.viewCount"
          placeholder="请输入浏览量"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['blog:article:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['blog:article:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['blog:article:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['blog:article:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="articleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="文章ID" align="center" prop="articleId" />
      <el-table-column label="作者ID (关联 sys_user.user_id)" align="center" prop="userId" />
      <el-table-column label="分类ID (关联 blog_category.category_id)" align="center" prop="categoryId" />
      <el-table-column label="文章标题" align="center" prop="title" />
      <el-table-column label="文章摘要" align="center" prop="summary" />
      <el-table-column label="封面图片地址" align="center" prop="coverImageUrl" />
      <el-table-column label="状态 (0=草稿, 1=已发布)" align="center" prop="status" />
      <el-table-column label="是否允许评论 (0=不允许, 1=允许)" align="center" prop="allowComment" />
      <el-table-column label="浏览量" align="center" prop="viewCount" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['blog:article:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['blog:article:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改博客文章对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="articleRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="作者ID (关联 sys_user.user_id)" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入作者ID (关联 sys_user.user_id)" />
        </el-form-item>
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题" />
        </el-form-item>
        <el-form-item label="文章摘要" prop="summary">
          <el-input v-model="form.summary" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="文章内容 (Markdown 或 HTML)">
          <editor v-model="form.content" :min-height="192"/>
        </el-form-item>
        <el-form-item label="封面图片地址" prop="coverImageUrl">
          <el-input v-model="form.coverImageUrl" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="浏览量" prop="viewCount">
          <el-input v-model="form.viewCount" placeholder="请输入浏览量" />
        </el-form-item>
        <el-form-item label="删除标志 (0=存在, 2=删除)" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="请输入删除标志 (0=存在, 2=删除)" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Article">
import { listArticle, getArticle, delArticle, addArticle, updateArticle } from "@/api/blog/article"

const { proxy } = getCurrentInstance()

const articleList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: null,
    categoryId: null,
    title: null,
    summary: null,
    coverImageUrl: null,
    status: null,
    allowComment: null,
    viewCount: null,
  },
  rules: {
    userId: [
      { required: true, message: "作者ID (关联 sys_user.user_id)不能为空", trigger: "blur" }
    ],
    categoryId: [
      { required: true, message: "分类ID (关联 blog_category.category_id)不能为空", trigger: "change" }
    ],
    title: [
      { required: true, message: "文章标题不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态 (0=草稿, 1=已发布)不能为空", trigger: "change" }
    ],
    allowComment: [
      { required: true, message: "是否允许评论 (0=不允许, 1=允许)不能为空", trigger: "change" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询博客文章列表 */
function getList() {
  loading.value = true
  listArticle(queryParams.value).then(response => {
    articleList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    articleId: null,
    userId: null,
    categoryId: null,
    title: null,
    summary: null,
    content: null,
    coverImageUrl: null,
    status: null,
    allowComment: null,
    viewCount: null,
    delFlag: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  }
  proxy.resetForm("articleRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.articleId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加博客文章"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _articleId = row.articleId || ids.value
  getArticle(_articleId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改博客文章"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["articleRef"].validate(valid => {
    if (valid) {
      if (form.value.articleId != null) {
        updateArticle(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addArticle(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _articleIds = row.articleId || ids.value
  proxy.$modal.confirm('是否确认删除博客文章编号为"' + _articleIds + '"的数据项？').then(function() {
    return delArticle(_articleIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('blog/article/export', {
    ...queryParams.value
  }, `article_${new Date().getTime()}.xlsx`)
}

getList()
</script>
