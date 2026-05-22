<template>
  <div class="page-question">
    <!-- Search form -->
    <div class="filter-card">
      <el-form :inline="true" class="search-form-layout">
        <el-form-item>
          <selector v-model="params.difficulty" placeholder="选择题目难度" style="width: 160px;" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="params.title" placeholder="输入要搜索的题目标题" clearable @keyup.enter="onSearch" style="width: 260px;" />
        </el-form-item>
        <el-form-item class="button-group">
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button @click="onReset" type="info" plain>重置</el-button>
          <el-button type="success" :icon="Plus" @click="onAddQuestion">添加题目</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Table -->
    <el-table height="calc(100vh - 270px)" :data="questionList" class="question-table">
      <el-table-column prop="questionId" width="180px" label="题目ID" :show-overflow-tooltip="true" />
      <el-table-column prop="title" label="题目标题" :show-overflow-tooltip="true" />
      <el-table-column prop="difficulty" label="题目难度" width="100px">
        <template #default="{ row }">
          <span v-if="row.difficulty === 1" class="diff-easy">简单</span>
          <span v-if="row.difficulty === 2" class="diff-medium">中等</span>
          <span v-if="row.difficulty === 3" class="diff-hard">困难</span>
        </template>
      </el-table-column>
      <el-table-column prop="createName" label="创建人" width="140px" :show-overflow-tooltip="true" />
      <el-table-column prop="createTime" label="创建时间" width="180px" />
      <el-table-column label="操作" width="120px" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="onEdit(row.questionId)">编辑</el-button>
          <el-button type="primary" link class="action-danger" @click="onDelete(row.questionId)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <el-pagination
      background
      size="default"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      v-model:current-page="params.pageNum"
      v-model:page-size="params.pageSize"
      :page-sizes="[1, 5, 10, 15, 20]"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <question-drawer ref="questionEditRef" @success="onSuccess"></question-drawer>
  </div>
</template>

<script setup>
import { Plus } from "@element-plus/icons-vue"
import Selector from "@/components/QuestionSelector.vue"
import { getQuestionListService, delQuestionService } from "@/apis/question"
import { defineAsyncComponent, reactive, ref } from "vue"

const QuestionDrawer = defineAsyncComponent(() => import("@/components/QuestionDrawer.vue"))

const params = reactive({
  pageNum: 1,
  pageSize: 10,
  difficulty: '',
  title: ''
})

const questionList = ref([])
const total = ref(0)

async function getQuestionList() {
  try {
    const result = await getQuestionListService(params)
    questionList.value = result.rows
    total.value = result.total
  } catch (error) {
    ElMessage.error(error.message || '获取题目列表失败')
  }
}
getQuestionList()

function handleSizeChange() {
  params.pageNum = 1
  getQuestionList()
}

function handleCurrentChange() {
  getQuestionList()
}

function onSearch() {
  params.pageNum = 1
  getQuestionList()
}

function onReset() {
  params.pageNum = 1
  params.pageSize = 10
  params.title = ''
  params.difficulty = ''
  getQuestionList()
}

const questionEditRef = ref()

const onAddQuestion = () => {
  questionEditRef.value.open()
}

function onSuccess(service) {
  if (service === 'add') {
    params.pageNum = 1
  }
  getQuestionList()
}

async function onEdit(questionId) {
  questionEditRef.value.open(questionId)
}

async function onDelete(questionId) {
  try {
    await ElMessageBox.confirm(
      '确认删除该题目？此操作不可逆！',
      '删除确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'apple-message-box'
      }
    )
    await delQuestionService(questionId)
    params.pageNum = 1
    getQuestionList()
    ElMessage.success('删除题目成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || error)
    }
  }
}
</script>

<style lang="scss" scoped>
.page-question {
  animation: cf-slide-fade-up var(--motion-page) var(--motion-spring-soft);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-form-layout {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.button-group {
  margin-left: auto;
  
  :deep(.el-form-item__content) {
    display: flex;
    gap: 8px;
  }
}

.diff-easy {
  color: #248A3D;
  font-weight: 600;
}

.diff-medium {
  color: #C65D00;
  font-weight: 600;
}

.diff-hard {
  color: #D70015;
  font-weight: 600;
}

.action-danger {
  color: var(--oj-danger) !important;
  
  &:hover {
    color: #ff6b6b !important;
  }
}

.question-table {
  width: 100%;
}

:deep(.el-pagination) {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
