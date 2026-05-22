<template>
  <div class="page-exam-edit">
    <div class="edit-container">
      <!-- Section: Basic info -->
      <section class="edit-section floating-card">
        <div class="section-header">
          <div class="header-left-group">
            <el-button class="btn-back" :icon="ArrowLeft" circle @click="goBack" />
            <h2 class="section-title">{{ type === 'edit' ? '编辑竞赛' : '添加竞赛' }}</h2>
          </div>
          <span class="go-back-link" @click="goBack">返回列表</span>
        </div>
        
        <div class="section-body">
          <el-form :model="formExam" label-width="100px" class="base-info-form">
            <el-form-item label="竞赛名称" required>
              <el-input v-model="formExam.title" placeholder="请填写竞赛名称" style="width: 480px" />
            </el-form-item>
            <el-form-item label="竞赛周期" required>
              <el-date-picker
                v-model="formExam.examDate"
                :disabled-date="disabledDate"
                type="datetimerange"
                start-placeholder="竞赛开始时间"
                end-placeholder="竞赛结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 480px"
              />
            </el-form-item>
            <el-form-item>
              <el-button class="save-btn" type="primary" @click="saveBaseInfo">保存基本信息</el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>

      <!-- Section: Question list -->
      <section class="edit-section floating-card">
        <div class="section-header">
          <div class="section-title-sm-container">
            <el-icon class="title-icon"><Notebook /></el-icon>
            <h3 class="section-title-sm">竞赛题目列表</h3>
          </div>
          <el-button class="add-question-btn" :icon="Plus" type="primary" @click="addQuestion()">
            添加题目
          </el-button>
        </div>
        <el-table height="38vh" :data="formExam.examQuestionList" class="question-table">
          <el-table-column prop="questionId" width="180px" label="题目ID" :show-overflow-tooltip="true" />
          <el-table-column prop="title" :show-overflow-tooltip="true" label="题目标题" />
          <el-table-column prop="difficulty" width="100px" label="题目难度">
            <template #default="{ row }">
              <span v-if="row.difficulty === 1" class="diff-easy">简单</span>
              <span v-if="row.difficulty === 2" class="diff-medium">中等</span>
              <span v-if="row.difficulty === 3" class="diff-hard">困难</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90px" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link class="action-danger" @click="deleteExamQuestion(formExam.examId, row.questionId)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <!-- Dialog: select questions -->
      <el-dialog v-model="dialogVisible" title="选择竞赛题目" width="60%" custom-class="select-question-dialog">
        <div class="dialog-content">
          <div class="dialog-filter-bar">
            <el-form :inline="true" class="search-form-layout">
              <el-form-item label="难度">
                <selector v-model="params.difficulty" style="width: 120px;" placeholder="选择难度" />
              </el-form-item>
              <el-form-item label="名称">
                <el-input v-model="params.title" placeholder="输入搜索题目标题" clearable @keyup.enter="onSearch" style="width: 200px;" />
              </el-form-item>
              <el-form-item class="dialog-button-group">
                <el-button type="primary" @click="onSearch">搜索</el-button>
                <el-button @click="onReset" type="info" plain>重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <el-table :data="questionList" @selection-change="handleSelectionChange" height="300px" class="dialog-table">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="questionId" label="题目ID" width="160px" :show-overflow-tooltip="true" />
            <el-table-column prop="title" label="题目标题" :show-overflow-tooltip="true" />
            <el-table-column prop="difficulty" label="题目难度" width="100px">
              <template #default="{ row }">
                <span v-if="row.difficulty === 1" class="diff-easy">简单</span>
                <span v-if="row.difficulty === 2" class="diff-medium">中等</span>
                <span v-if="row.difficulty === 3" class="diff-hard">困难</span>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="dialog-footer-layout">
            <el-pagination
              background
              size="small"
              layout="total, prev, pager, next"
              :total="total"
              v-model:current-page="params.pageNum"
              v-model:page-size="params.pageSize"
              :page-sizes="[5, 10, 15, 20]"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
            <div class="footer-buttons">
              <el-button @click="dialogVisible = false" type="info" plain>取消</el-button>
              <el-button type="primary" @click="submitSelectQuestion">提交选择</el-button>
            </div>
          </div>
        </div>
      </el-dialog>

      <!-- Bottom action bar -->
      <div class="bottom-bar">
        <el-button type="info" plain @click="goBack">取消</el-button>
        <el-button type="primary" @click="publishExam">发布竞赛</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { examAddService, addExamQuestionService, getExamDetailService, editExamService, delExamQuestionService, publishExamService } from "@/apis/exam"
import { getQuestionListService } from "@/apis/question"
import Selector from "@/components/QuestionSelector.vue"
import router from '@/router'
import { reactive, ref } from "vue"
import { Plus, ArrowLeft, Notebook } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'

const type = useRoute().query.type
const formExam = reactive({
  examId: '',
  title: '',
  examDate: '',
  examQuestionList: []
})

const params = reactive({
  pageNum: 1,
  pageSize: 10,
  difficulty: '',
  title: '',
  excludeIdSetStr: ''
})

const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7 // Cannot select days before today
}

function goBack() {
  router.push('/oj/layout/exam')
}

async function saveBaseInfo() {
  if (!formExam.title.trim()) {
    ElMessage.warning('请填写竞赛名称')
    return
  }
  if (!formExam.examDate || formExam.examDate.length !== 2) {
    ElMessage.warning('请选择竞赛周期')
    return
  }

  const fd = new FormData()
  for (let key in formExam) {
    if (key === 'examDate') {
      fd.append('startTime', formExam.examDate[0])
      fd.append('endTime', formExam.examDate[1])
    } else if (key !== 'startTime' && key !== 'endTime' && key !== 'examQuestionList') {
      fd.append(key, formExam[key])
    }
  }

  try {
    if (formExam.examId) {
      await editExamService(fd)
    } else {
      const addRes = await examAddService(fd)
      formExam.examId = addRes.data.examId
    }
    ElMessage.success('基本信息保存成功')
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  }
}

const questionList = ref([])
const total = ref(0)

async function getQuestionList() {
  params.excludeIdSetStr = ''
  if (formExam.examQuestionList != null && formExam.examQuestionList.length > 0) {
    formExam.examQuestionList.forEach(element => {
      params.excludeIdSetStr = params.excludeIdSetStr + element.questionId + ";"
    })
  }
  try {
    const result = await getQuestionListService(params)
    questionList.value = result.rows
    total.value = result.total
  } catch (error) {
    ElMessage.error(error.message || '获取题目列表失败')
  }
}

const dialogVisible = ref(false)
function addQuestion() {
  if (formExam.examId === null || formExam.examId === '') {
    ElMessage.error('请先保存竞赛基本信息')
  } else {
    getQuestionList()
    dialogVisible.value = true
  }
}

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

async function publishExam() {
  try {
    if (formExam.examId) {
      await publishExamService(formExam.examId)
      router.push("/oj/layout/exam")
      ElMessage.success("发布成功")
    } else {
      ElMessage.error("竞赛保存之后方可发布")
    }
  } catch (error) {
    ElMessage.error(error.message || '发布失败')
  }
}

const questionIdSet = ref([])

function handleSelectionChange(selection) {
  questionIdSet.value = selection.map(item => item.questionId)
}

async function submitSelectQuestion() {
  if (questionIdSet.value && questionIdSet.value.length < 1) {
    ElMessage.error('请先选择要提交的题目')
    return false
  }
  const examQ = {
    examId: formExam.examId,
    questionIds: questionIdSet.value
  }
  try {
    await addExamQuestionService(examQ)
    getExamDetailById(formExam.examId)
    dialogVisible.value = false
    ElMessage.success('竞赛题目添加成功')
  } catch (error) {
    ElMessage.error(error.message || '添加题目失败')
  }
}

async function getExamDetail() {
  try {
    const examId = useRoute().query.examId
    if (examId) {
      formExam.examId = examId
      getExamDetailById(examId)
    }
  } catch (error) {
    ElMessage.error(error.message || '获取竞赛详情失败')
  }
}
getExamDetail()

async function deleteExamQuestion(examId, questionId) {
  try {
    await ElMessageBox.confirm(
      '确认移出该题目？',
      '删除确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'apple-message-box'
      }
    )
    await delExamQuestionService(examId, questionId)
    getExamDetailById(examId)
    ElMessage.success('竞赛题目删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || error)
    }
  }
}

async function getExamDetailById(examId) {
  try {
    const examDetail = await getExamDetailService(examId)
    formExam.examQuestionList = []
    Object.assign(formExam, examDetail.data)
    formExam.examDate = [examDetail.data.startTime, examDetail.data.endTime]
  } catch (error) {
    ElMessage.error(error.message || '加载详情失败')
  }
}
</script>

<style lang="scss" scoped>
.page-exam-edit {
  height: 100%;
  animation: cf-slide-fade-up var(--motion-page) var(--motion-spring-soft);
}

.edit-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.edit-section {
  padding: 24px;
  background: var(--oj-surface) !important;
  border-radius: var(--oj-radius);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--oj-line);
}

.header-left-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-back {
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  box-shadow: var(--oj-shadow-sm);
  background: var(--oj-surface) !important;
  color: var(--oj-ink);
  
  &:hover {
    background: var(--oj-surface-soft) !important;
    color: var(--oj-primary);
  }
}

.section-title {
  font-size: 18px;
  font-weight: 750;
  color: var(--oj-ink);
  margin: 0;
  letter-spacing: -0.02em;
}

.section-title-sm-container {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .title-icon {
    font-size: 18px;
    color: var(--oj-primary);
  }
}

.section-title-sm {
  font-size: 16px;
  font-weight: 700;
  color: var(--oj-ink);
  margin: 0;
}

.go-back-link {
  color: var(--oj-muted);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: color var(--motion-fast);

  &:hover {
    color: var(--oj-primary);
  }
}

.section-body {
  display: flex;
  flex-direction: column;
}

.base-info-form {
  :deep(.el-form-item__label) {
    justify-content: flex-start;
    font-weight: 600;
  }
}

.save-btn {
  width: 180px;
}

.add-question-btn {
  font-size: 13px;
  font-weight: 700;
}

.question-table {
  width: 100%;
}

/* Dialog classes */
.dialog-filter-bar {
  background: var(--oj-surface-soft);
  border-radius: var(--oj-radius-sm);
  padding: 16px;
  margin-bottom: 16px;
  
  .search-form-layout {
    display: flex;
    align-items: center;
    gap: 8px;
    
    :deep(.el-form-item) {
      margin-bottom: 0 !important;
    }
  }
}

.dialog-button-group {
  margin-left: auto;
  :deep(.el-form-item__content) {
    display: flex;
    gap: 8px;
  }
}

.dialog-table {
  border-radius: var(--oj-radius-sm);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.dialog-footer-layout {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  
  .footer-buttons {
    display: flex;
    gap: 10px;
  }
}

/* Bottom action bar */
.bottom-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px 0 10px;
}

/* Difficulty colors */
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
</style>
