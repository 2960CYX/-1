<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="文章ID" prop="articleId">
        <el-input
          v-model="queryParams.articleId"
          placeholder="请输入文章ID"
          clearable
          @keyup.enter="handleQuery"
          style="width: 220px"
        />
      </el-form-item>
      <el-form-item label="评论用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入评论用户ID（可为空）"
          clearable
          @keyup.enter="handleQuery"
          style="width: 220px"
        />
      </el-form-item>
      <el-form-item label="评论人昵称" prop="nickname">
        <el-input
          v-model="queryParams.nickname"
          placeholder="请输入评论人昵称"
          clearable
          @keyup.enter="handleQuery"
          style="width: 220px"
        />
      </el-form-item>
      <el-form-item label="评论人邮箱" prop="email">
        <el-input
          v-model="queryParams.email"
          placeholder="请输入评论人邮箱"
          clearable
          @keyup.enter="handleQuery"
          style="width: 220px"
        />
      </el-form-item>
      <el-form-item label="父评论ID" prop="parentId">
        <el-input
          v-model="queryParams.parentId"
          placeholder="请输入父评论ID（0=对文章评论，>0=回复某评论）"
          clearable
          @keyup.enter="handleQuery"
          style="width: 220px"
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
          v-hasPermi="['blog:comment:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['blog:comment:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['blog:comment:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['blog:comment:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="commentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="评论ID" align="center" prop="commentId" />
      <el-table-column label="文章标题" align="center" prop="articleTitle" show-overflow-tooltip min-width="160" />
      <el-table-column label="评论用户ID" align="center" prop="userId" />
      <el-table-column label="评论人昵称" align="center" prop="nickname" show-overflow-tooltip min-width="120" />
      <el-table-column label="评论人邮箱" align="center" prop="email" show-overflow-tooltip min-width="180" />
      <el-table-column label="父评论ID" align="center" prop="parentId" />
      <el-table-column label="状态" align="center" prop="status" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['blog:comment:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['blog:comment:remove']">删除</el-button>
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

    <!-- 添加或修改博客评论对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="commentRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="文章ID" prop="articleId">
          <el-input v-model="form.articleId" placeholder="请输入文章ID" />
        </el-form-item>
        <el-form-item label="评论用户ID" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入评论用户ID（可为空）" />
        </el-form-item>
        <el-form-item label="评论人昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入评论人昵称" />
        </el-form-item>
        <el-form-item label="评论人邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入评论人邮箱" />
        </el-form-item>
        <el-form-item label="评论内容">
          <editor v-model="form.content" :min-height="192"/>
        </el-form-item>
        <el-form-item label="父评论ID" prop="parentId">
          <el-input v-model="form.parentId" placeholder="请输入父评论ID（0=对文章评论，>0=回复某评论）" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">待审核</el-radio>
            <el-radio label="1">已显示</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="删除标志" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="请输入删除标志（0=存在，2=删除）" />
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

<script setup name="Comment">
import { listComment, getComment, delComment, addComment, updateComment } from "@/api/blog/comment"

const { proxy } = getCurrentInstance()

const commentList = ref([])
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
    articleId: null,
    userId: null,
    nickname: null,
    email: null,
    content: null,
    parentId: null,
    status: null,
  },
  rules: {
    articleId: [
      { required: true, message: "文章ID不能为空", trigger: "blur" }
    ],
    nickname: [
      { required: true, message: "评论人昵称不能为空", trigger: "blur" }
    ],
    content: [
      { required: true, message: "评论内容不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询博客评论列表 */
function getList() {
  loading.value = true
  listComment(queryParams.value).then(response => {
    commentList.value = response.rows
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
    commentId: null,
    articleId: null,
    userId: null,
    nickname: null,
    email: null,
    content: null,
    parentId: null,
    status: null,
    delFlag: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  }
  proxy.resetForm("commentRef")
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
  ids.value = selection.map(item => item.commentId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加博客评论"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _commentId = row.commentId || ids.value
  getComment(_commentId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改博客评论"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["commentRef"].validate(valid => {
    if (valid) {
      if (form.value.commentId != null) {
        updateComment(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addComment(form.value).then(response => {
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
  const _commentIds = row.commentId || ids.value
  proxy.$modal.confirm('是否确认删除博客评论编号为"' + _commentIds + '"的数据项？').then(function() {
    return delComment(_commentIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('blog/comment/export', {
    ...queryParams.value
  }, `comment_${new Date().getTime()}.xlsx`)
}

getList()
</script>
