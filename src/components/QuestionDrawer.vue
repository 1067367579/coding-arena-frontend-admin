<template>
  <el-drawer v-model="visibleDrawer" :destroy-on-close="true" :with-header="false" size="55%" class="premium-drawer">
    <div class="drawer-content">
      <div class="drawer-header">
        <h3 class="drawer-title">
          {{ formQuestion.questionId ? '编辑题目' : '添加题目' }}
        </h3>
        <el-button class="close-btn" @click="visibleDrawer = false">关闭</el-button>
      </div>

      <el-form :model="formQuestion" ref="formRef" label-position="top" class="drawer-form">
        <!-- Grid layout for title and difficulty -->
        <div class="form-grid-2">
          <el-form-item label="题目标题" required class="grid-item-70">
            <el-input v-model="formQuestion.title" placeholder="请输入题目标题" />
          </el-form-item>
          <el-form-item label="题目难度" required class="grid-item-30">
            <QuestionSelector v-model="formQuestion.difficulty" placeholder="选择难度" class="full-width" />
          </el-form-item>
        </div>

        <!-- Grid layout for limit configuration -->
        <div class="form-grid-2">
          <el-form-item label="时间限制 (毫秒)" required>
            <el-input v-model="formQuestion.timeLimit" placeholder="请输入时间限制，例如: 1000" />
          </el-form-item>
          <el-form-item label="空间限制 (字节)" required>
            <el-input v-model="formQuestion.spaceLimit" placeholder="请输入空间限制，例如: 268435456" />
          </el-form-item>
        </div>

        <!-- Content quill editor -->
        <el-form-item label="题目描述" required>
          <div class="editor-wrapper">
            <quill-editor placeholder="请输入题目详细描述和要求..." v-model:content="formQuestion.content" content-type="html" />
          </div>
        </el-form-item>

        <!-- Test cases -->
        <el-form-item label="题目用例" required>
          <div class="upload-container">
            <el-upload
              ref="uploadRef"
              class="case-uploader"
              drag
              action="#"
              :auto-upload="false"
              :limit="1"
              v-model:file-list="fileList"
              :on-change="handleFileChange"
              :on-remove="handleRemove"
              :on-exceed="handleExceed"
              accept=".txt,.zip"
            >
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                将用例文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持上传 .txt 或 .zip 格式的用例文件
                </div>
              </template>
            </el-upload>
          </div>
        </el-form-item>

        <!-- Default code block editor -->
        <el-form-item label="默认代码块 (Java)" required>
          <code-editor @update:value="handleEditorContent" ref="defaultCodeRef" />
        </el-form-item>

        <!-- Main function block editor -->
        <el-form-item label="Main 函数 (Java)" required>
          <code-editor @update:value="handleEditorMainFunc" ref="mainFuncRef" />
        </el-form-item>

        <div class="drawer-actions">
          <el-button @click="visibleDrawer = false" type="info" plain>取消</el-button>
          <el-button class="submit-btn" type="primary" @click="onSubmit">发布题目</el-button>
        </div>
      </el-form>
    </div>
  </el-drawer>
</template>

<script setup>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import CodeEditor from './CodeEditor.vue'
import QuestionSelector from './QuestionSelector.vue'
import { ref, reactive } from 'vue'
import { addQuestionService, getQuestionDetailService, editQuestionService } from '@/apis/question'
import { UploadFilled } from '@element-plus/icons-vue'
import { genFileId } from 'element-plus'

const visibleDrawer = ref(false)
const formRef = ref()

const formQuestion = reactive({
  questionId: '',
  title: '',
  difficulty: '',
  content: '',
  questionCase: '',
  timeLimit: '',
  spaceLimit: '',
  defaultCode: '',
  mainFunc: ''
})

const defaultCodeRef = ref()
const mainFuncRef = ref()
const uploadRef = ref()
const fileList = ref([])

function handleFileChange(file, files) {
  fileList.value = files
  if (file && file.raw) {
    formQuestion.questionCase = file.raw
  } else {
    formQuestion.questionCase = ''
  }
}

function handleRemove() {
  fileList.value = []
  formQuestion.questionCase = ''
}

function handleExceed(files) {
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
    const file = files[0]
    file.uid = genFileId()
    uploadRef.value.handleStart(file)
  }
}

function getFileName(path) {
  if (!path) return ''
  if (typeof path !== 'string') return ''
  const parts = path.split('/')
  return parts[parts.length - 1]
}

async function open(questionId) {
  visibleDrawer.value = true
  
  // Clear the fields
  for (const key in formQuestion) {
    if (formQuestion.hasOwnProperty(key)) {
      formQuestion[key] = ''
    }
  }
  fileList.value = []

  if (questionId) {
    try {
      const questionDetail = await getQuestionDetailService(questionId)
      Object.assign(formQuestion, questionDetail.data)
      formQuestion.questionId = questionId
      
      if (formQuestion.questionCase) {
        fileList.value = [{
          name: getFileName(formQuestion.questionCase),
          url: formQuestion.questionCase
        }]
      }
      
      // Load details into editor asynchronously safely
      setTimeout(() => {
        if (defaultCodeRef.value) {
          defaultCodeRef.value.setAceCode(formQuestion.defaultCode)
        }
        if (mainFuncRef.value) {
          mainFuncRef.value.setAceCode(formQuestion.mainFunc)
        }
      }, 50)
    } catch (error) {
      ElMessage.error(error.message || '获取题目详情失败')
    }
  }
}

defineExpose({
  open
})

function validate() {
  let msg = ''
  if (!formQuestion.title.trim()) {
    msg = '请添加题目标题'
  } else if (formQuestion.difficulty === '' || formQuestion.difficulty === undefined) {
    msg = '请选择题目难度'
  } else if (!formQuestion.timeLimit) {
    msg = '请输入时间限制'
  } else if (!formQuestion.spaceLimit) {
    msg = '请输入空间限制'
  } else if (!formQuestion.content || formQuestion.content === '<p><br></p>') {
    msg = '请输入题目内容信息'
  } else if (typeof formQuestion.questionCase === 'string' && !formQuestion.questionCase.trim()) {
    msg = '请上传题目用例文件'
  } else if (!formQuestion.questionCase) {
    msg = '请上传题目用例文件'
  } else if (!formQuestion.defaultCode) {
    msg = '请输入默认代码'
  } else if (!formQuestion.mainFunc) {
    msg = '请输入main函数'
  }
  return msg
}

const emit = defineEmits(['success'])

async function onSubmit() {
  const errorMessage = validate()
  if (errorMessage) {
    ElMessage.error(errorMessage)
    return false
  }
  
  const fd = new FormData()
  for (let key in formQuestion) {
    fd.append(key, formQuestion[key])
  }
  
  try {
    if (formQuestion.questionId) {
      await editQuestionService(fd)
      ElMessage.success('编辑成功')
      emit('success', 'edit')
      visibleDrawer.value = false
    } else {
      await addQuestionService(fd)
      ElMessage.success('添加成功')
      emit('success', 'add')
      visibleDrawer.value = false
    }
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

function handleEditorContent(content) {
  formQuestion.defaultCode = content
}

function handleEditorMainFunc(content) {
  formQuestion.mainFunc = content
}
</script>

<style lang="scss" scoped>
.drawer-content {
  padding: 16px 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--oj-line);
  margin-left: 6px;
  margin-right: 6px;
}

.drawer-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--oj-ink);
  margin: 0;
  letter-spacing: -0.02em;
}

.close-btn {
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  
  &:hover {
    background: var(--oj-surface-soft);
  }
}

.drawer-form {
  overflow-y: auto;
  flex: 1;
  padding: 6px 12px 6px 6px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-grid-2 {
  display: flex;
  gap: 20px;
  width: 100%;
  
  & > * {
    flex: 1;
  }
}

.grid-item-70 {
  flex: 7;
}

.grid-item-30 {
  flex: 3;
}

.full-width {
  width: 100%;
}

:deep(.el-form-item) {
  margin-bottom: 0;
  
  .el-form-item__label {
    padding-bottom: 6px;
    font-weight: 600;
    color: var(--oj-ink);
  }
}

.editor-wrapper {
  width: 100%;
  border-radius: var(--oj-radius-sm);
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
  background: #fff;
  
  :deep(.ql-toolbar) {
    border: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    background: var(--oj-surface-soft);
  }
  
  :deep(.ql-container) {
    border: none;
    min-height: 180px;
  }
}

.drawer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--oj-line);
  
  .submit-btn {
    min-width: 140px;
  }
}

.upload-container {
  width: 100%;
}

.case-uploader {
  width: 100%;

  :deep(.el-upload-dragger) {
    background: rgba(255, 255, 255, 0.4);
    border: 1px dashed rgba(0, 0, 0, 0.12);
    border-radius: var(--oj-radius-sm);
    transition: all var(--motion-fast) var(--motion-spring-soft);
    padding: 24px 20px;

    &:hover {
      border-color: var(--oj-primary);
      background: rgba(0, 122, 255, 0.02);
    }
    
    .el-icon--upload {
      font-size: 40px;
      color: var(--oj-muted);
      margin-bottom: 8px;
    }
    
    .el-upload__text {
      font-size: 13px;
      color: var(--oj-muted);
      
      em {
        color: var(--oj-primary);
        font-weight: 600;
        font-style: normal;
      }
    }
  }

  :deep(.el-upload__tip) {
    color: var(--oj-subtle);
    font-size: 12px;
    margin-top: 6px;
  }
}
</style>
