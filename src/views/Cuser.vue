<template>
  <div class="page-user">
    <!-- Search form -->
    <div class="filter-card">
      <el-form :inline="true" class="search-form-layout">
        <el-form-item label="用户ID">
          <el-input v-model="params.userId" placeholder="请输入用户ID" clearable @keyup.enter="onSearch" />
        </el-form-item>
        <el-form-item label="用户昵称">
          <el-input v-model="params.nickName" placeholder="请输入用户昵称" clearable @keyup.enter="onSearch" />
        </el-form-item>
        <el-form-item class="button-group">
          <el-button type="primary" @click="onSearch">搜索</el-button>
          <el-button @click="onReset" type="info" plain>重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Table -->
    <el-table height="calc(100vh - 270px)" :data="userList" class="user-table">
      <el-table-column prop="userId" label="用户ID" width="180px" :show-overflow-tooltip="true" />
      <el-table-column prop="nickName" label="用户昵称" :show-overflow-tooltip="true" />
      <el-table-column prop="gender" label="用户性别" width="90px">
        <template #default="{ row }">
          <span v-if="row.gender === 1" class="gender-male">男</span>
          <span v-if="row.gender === 0" class="gender-female">女</span>
          <span v-if="row.gender === 2" class="gender-unknown">未知</span>
        </template>
      </el-table-column>
      <el-table-column prop="phone" width="130px" label="手机号" :show-overflow-tooltip="true" />
      <el-table-column prop="email" width="150px" label="邮箱" :show-overflow-tooltip="true" />
      <el-table-column prop="wechat" width="130px" label="微信号" :show-overflow-tooltip="true" />
      <el-table-column label="学校/专业" width="180px">
        <template #default="{ row }">
          <span class="block-span">学校: {{ row.school || '-' }}</span>
          <span class="block-span">专业: {{ row.major || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="introduce" label="个人介绍" :show-overflow-tooltip="true" />
      <el-table-column prop="status" width="95px" label="用户状态">
        <template #default="{ row }">
          <el-tag type="success" v-if="row.status === 1">正常</el-tag>
          <el-tag type="danger" v-else>拉黑</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="90px" fixed="right">
        <template #default="{ row }">
          <el-button class="action-danger" v-if="row.status === 1" type="primary" link
            @click="onUpdateUserStatus(row.userId, 0)">拉黑</el-button>
          <el-button v-if="row.status === 0" type="primary" link @click="onUpdateUserStatus(row.userId, 1)">解禁</el-button>
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
import { reactive, ref } from 'vue'
import { getUserListService, updateStatusService } from '@/apis/cuser'

const params = reactive({
  pageNum: 1,
  pageSize: 10,
  userId: '',
  nickName: '',
})

const userList = ref([])
const total = ref(0)

async function getUserList() {
  try {
    const refData = await getUserListService(params)
    userList.value = refData.rows
    total.value = refData.total
  } catch (error) {
    ElMessage.error(error.message || '获取用户列表失败')
  }
}
getUserList()

function onSearch() {
  params.pageNum = 1
  getUserList()
}

function onReset() {
  params.pageNum = 1
  params.pageSize = 10
  params.userId = ''
  params.nickName = ''
  getUserList()
}

function handleSizeChange() {
  params.pageNum = 1
  getUserList()
}

function handleCurrentChange() {
  getUserList()
}

const updateStatusParams = reactive({
  userId: '',
  status: '',
})

async function onUpdateUserStatus(userId, status) {
  try {
    await ElMessageBox.confirm(
      status === 0 ? '确认将该用户拉黑？拉黑后用户将无法正常使用部分功能。' : '确认解禁该用户？',
      '操作确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: status === 0 ? 'danger' : 'warning',
        customClass: 'apple-message-box'
      }
    )
    updateStatusParams.userId = userId
    updateStatusParams.status = status
    await updateStatusService(updateStatusParams)
    ElMessage.success(status === 0 ? '拉黑用户成功' : '解禁用户成功')
    getUserList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || error)
    }
  }
}
</script>

<style lang="scss" scoped>
.page-user {
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

.block-span {
  display: block;
  font-size: 12px;
  color: var(--oj-muted);
  line-height: 1.6;
}

.gender-male {
  color: var(--oj-primary);
  font-weight: 600;
}

.gender-female {
  color: var(--oj-danger);
  font-weight: 600;
}

.gender-unknown {
  color: var(--oj-muted);
  font-weight: 600;
}

.action-danger {
  color: var(--oj-danger) !important;
  
  &:hover {
    color: #ff6b6b !important;
  }
}

.user-table {
  width: 100%;
}

:deep(.el-pagination) {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
