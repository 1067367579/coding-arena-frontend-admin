<template>
  <div class="page-exam">
    <!-- Search form -->
    <div class="filter-card">
      <el-form :inline="true" class="search-form-layout">
        <el-form-item label="创建日期">
          <el-date-picker
            v-model="datetimeRange"
            style="width: 280px"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="竞赛名称">
          <el-input v-model="params.title" placeholder="输入要搜索的竞赛名称" clearable @keyup.enter="onSearch" style="width: 220px;" />
        </el-form-item>
        <el-form-item class="button-group">
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button @click="onReset" type="info" plain>重置</el-button>
          <el-button type="success" :icon="Plus" @click="onAddExam">添加竞赛</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Table -->
    <el-table height="calc(100vh - 270px)" :data="examList" class="exam-table">
      <el-table-column prop="title" label="竞赛标题" :show-overflow-tooltip="true" />
      <el-table-column prop="startTime" width="180px" label="竞赛开始时间" />
      <el-table-column prop="endTime" width="180px" label="竞赛结束时间" />
      <el-table-column label="是否开赛" width="115px">
        <template #default="{ row }">
          <div v-if="!isNotStartExam(row)" class="status-pulsar status-warning">
            <span class="pulsar-dot"></span>
            <span>已开赛</span>
          </div>
          <div v-else class="status-pulsar status-info">
            <span class="pulsar-dot"></span>
            <span>未开赛</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="status" width="115px" label="是否发布">
        <template #default="{ row }">
          <div v-if="row.status == 0" class="status-pulsar status-danger">
            <span class="pulsar-dot"></span>
            <span>未发布</span>
          </div>
          <div v-if="row.status == 1" class="status-pulsar status-success">
            <span class="pulsar-dot"></span>
            <span>已发布</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="createName" width="140px" label="创建用户" :show-overflow-tooltip="true" />
      <el-table-column prop="createTime" width="180px" label="创建时间" />
      <el-table-column label="操作" width="200px" fixed="right">
        <template #default="{ row }">
          <template v-if="isNotStartExam(row)">
            <template v-if="row.status == 0">
              <el-button type="primary" link @click="onEdit(row.examId)">编辑</el-button>
              <el-button type="success" link @click="publishExam(row.examId)">发布</el-button>
              <el-button type="primary" link class="action-danger" @click="onDelete(row.examId)">删除</el-button>
            </template>
            <template v-else-if="row.status == 1">
              <el-button type="warning" link @click="cancelPublishExam(row.examId)">撤销发布</el-button>
            </template>
          </template>
          <template v-else>
            <span class="disabled-text">已开赛，锁定</span>
          </template>
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
      :page-sizes="[5, 10, 15, 20]"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue'
import { getExamListService, delExamService, publishExamService, cancelPublishExamService } from '@/apis/exam'
import { reactive, ref, watch } from 'vue'
import router from '@/router'

function isNotStartExam(exam) {
  const now = new Date()
  return new Date(exam.startTime) > now
}

const params = reactive({
  pageNum: 1,
  pageSize: 10,
  startTime: '',
  endTime: '',
  title: ''
})

const examList = ref([])
const total = ref(0)
const datetimeRange = ref([])

// Handle datetime range watch instead of parsing date object manually at get time
watch(datetimeRange, (newVal) => {
  if (newVal && newVal.length === 2) {
    params.startTime = newVal[0]
    params.endTime = newVal[1]
  } else {
    params.startTime = ''
    params.endTime = ''
  }
})

async function getExamList() {
  try {
    const result = await getExamListService(params)
    examList.value = result.rows
    total.value = result.total
  } catch (error) {
    ElMessage.error(error.message || '获取竞赛列表失败')
  }
}

getExamList()

function handleSizeChange() {
  params.pageNum = 1
  getExamList()
}

function handleCurrentChange() {
  getExamList()
}

function onSearch() {
  params.pageNum = 1
  getExamList()
}

function onReset() {
  params.pageNum = 1
  params.pageSize = 10
  params.title = ''
  params.startTime = ''
  params.endTime = ''
  datetimeRange.value = []
  getExamList()
}

function onAddExam() {
  router.push('/oj/layout/updateExam?type=add')
}

function onEdit(examId) {
  router.push(`/oj/layout/updateExam?type=edit&examId=${examId}`)
}

async function onDelete(examId) {
  try {
    await ElMessageBox.confirm(
      '确认删除该竞赛？此操作不可撤销！',
      '删除确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'apple-message-box'
      }
    )
    await delExamService(examId)
    params.pageNum = 1
    getExamList()
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || error)
    }
  }
}

async function publishExam(examId) {
  try {
    await publishExamService(examId)
    getExamList()
    ElMessage.success('发布成功')
  } catch (error) {
    ElMessage.error(error.message || '发布失败')
  }
}

async function cancelPublishExam(examId) {
  try {
    await cancelPublishExamService(examId)
    getExamList()
    ElMessage.success('撤销发布成功')
  } catch (error) {
    ElMessage.error(error.message || '撤销发布失败')
  }
}
</script>

<style lang="scss" scoped>
.page-exam {
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

.action-danger {
  color: var(--oj-danger) !important;
  
  &:hover {
    color: #ff6b6b !important;
  }
}

.disabled-text {
  font-size: 13px;
  color: var(--oj-muted);
  font-weight: 500;
  cursor: not-allowed;
}

.exam-table {
  width: 100%;
}

:deep(.el-pagination) {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
