<template>
  <div class="admin-layout">
    <!-- Glass header -->
    <header class="admin-header">
      <div class="header-left">
        <img class="header-logo" src="@/assets/oj-logo.svg" alt="CodeFlow" />
        <span class="header-kicker">ADMIN</span>
      </div>
      <el-dropdown placement="bottom-end" class="header-user-dropdown">
        <span class="header-user">
          <div class="avatar-circle">
            {{ nickName ? nickName.charAt(0).toUpperCase() : 'A' }}
          </div>
          <span class="user-name">{{ nickName }}</span>
          <el-icon class="arrow-icon"><ArrowDownBold /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="user-menu-dropdown">
            <el-dropdown-item :icon="SwitchButton" class="logout-menu-item" @click="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </header>

    <div class="admin-body">
      <!-- Glass sidebar -->
      <aside class="admin-sidebar floating-card">
        <el-menu class="side-menu" router :default-active="$route.path">
          <el-menu-item index="/oj/layout/cuser">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/oj/layout/question">
            <el-icon><Notebook /></el-icon>
            <span>题目管理</span>
          </el-menu-item>
          <el-menu-item index="/oj/layout/exam">
            <el-icon><TrophyBase /></el-icon>
            <span>竞赛管理</span>
          </el-menu-item>
        </el-menu>
      </aside>

      <!-- Main content -->
      <main class="admin-main">
        <div class="admin-content-card floating-card">
          <RouterView v-slot="{ Component }">
            <Transition name="admin-page" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import {
  User,
  Notebook,
  TrophyBase,
  ArrowDownBold,
  SwitchButton
} from '@element-plus/icons-vue'
import { getAdminInfoService, adminLogout } from '@/apis/admin'
import { ref } from 'vue'
import { removeToken } from '@/utils/cookie'
import router from '@/router'

const nickName = ref('')

const loadUserInfo = async () => {
  try {
    const result = await getAdminInfoService()
    nickName.value = result.data.nickName
  } catch (error) {
    ElMessage.error(error.message || '获取管理员信息失败')
  }
}

loadUserInfo()

const logout = async () => {
  try {
    await ElMessageBox.confirm(
      '确认退出登录？',
      '温馨提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'apple-message-box'
      }
    )
    await adminLogout()
    removeToken()
    router.push('/oj/login')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || error)
    }
  }
}
</script>

<style lang="scss" scoped>
.admin-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: transparent;
}

/* Glass header */
.admin-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 24px;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: saturate(160%) blur(24px);
  -webkit-backdrop-filter: saturate(160%) blur(24px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.01);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-logo {
  height: 38px;
  width: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 122, 255, 0.12));
}
.header-kicker {
  font-size: 9px;
  font-weight: 800;
  color: var(--oj-primary);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: var(--oj-primary-soft);
  padding: 3px 8px;
  border-radius: 6px;
  margin-left: 2px;
}

.header-user-dropdown {
  outline: none;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 14px 6px 8px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.03);
  box-shadow: var(--oj-shadow-sm);
  color: var(--oj-ink);
  font-size: 14px;
  font-weight: 600;
  transition:
    background var(--motion-fast) var(--motion-spring-soft),
    box-shadow var(--motion-fast) var(--motion-spring-soft),
    transform var(--motion-fast) var(--motion-spring);

  &:hover {
    background: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    transform: translateY(-0.5px);
  }
  
  &:active {
    transform: translateY(0) scale(0.98);
  }

  .avatar-circle {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--oj-primary), #5ac8fa);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 800;
    box-shadow: 0 2px 6px rgba(0, 122, 255, 0.15);
    flex-shrink: 0;
  }

  .user-name {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
  }

  .arrow-icon {
    font-size: 10px;
    color: var(--oj-muted);
    transition: transform var(--motion-fast);
  }
}

.header-user-dropdown:focus-within .arrow-icon {
  transform: rotate(180deg);
}

/* User Menu Dropdown styles */
.user-menu-dropdown {
  border-radius: 12px !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08) !important;
  padding: 6px !important;
  
  :deep(.logout-menu-item) {
    color: var(--oj-danger) !important;
    font-weight: 600;
    border-radius: 8px;
    padding: 10px 16px;
    margin: 2px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    
    &:hover {
      background: var(--oj-danger-soft) !important;
    }
  }
}

/* Body: sidebar + main */
.admin-body {
  display: flex;
  flex: 1;
  padding: 20px;
  gap: 20px;
  overflow: hidden;
  min-height: 0;
}

/* Glass sidebar */
.admin-sidebar {
  width: 220px;
  flex-shrink: 0;
  padding: 16px 8px;
  background: rgba(255, 255, 255, 0.45) !important;
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.5) !important;

  :deep(.side-menu) {
    border-right: none;
    background: transparent;

    .el-menu-item {
      border-radius: var(--oj-radius-sm);
      margin-bottom: 6px;
      padding: 0 16px !important;
      height: 46px;
      line-height: 46px;
      font-size: 14px;
      font-weight: 500;
      color: var(--oj-muted);
      position: relative;
      transition:
        color var(--motion-fast) var(--motion-spring-soft),
        background var(--motion-fast) var(--motion-spring-soft),
        padding var(--motion-fast) var(--motion-spring);

      &:hover {
        background: rgba(255, 255, 255, 0.6);
        color: var(--oj-ink);
        padding-left: 20px !important;
      }

      &.is-active {
        background: var(--oj-primary-soft) !important;
        color: var(--oj-primary) !important;
        font-weight: 700;
        box-shadow: 0 2px 8px rgba(0, 122, 255, 0.05);

        &::before {
          content: '';
          position: absolute;
          left: 6px;
          top: 25%;
          height: 50%;
          width: 3.5px;
          background: var(--oj-primary);
          border-radius: 99px;
        }
      }

      .el-icon {
        font-size: 18px;
        margin-right: 10px;
      }
    }
  }
}

/* Main content area */
.admin-main {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  
  /* Page Transition Animation styles */
  .admin-page-enter-active,
  .admin-page-leave-active {
    transition: all 0.25s var(--motion-spring-soft);
  }

  .admin-page-enter-from {
    opacity: 0;
    transform: translateY(12px) scale(0.995);
  }

  .admin-page-leave-to {
    opacity: 0;
    transform: translateY(-8px) scale(0.995);
  }
}

.admin-content-card {
  padding: 24px;
  min-height: 100%;
  background: rgba(255, 255, 255, 0.45) !important;
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--oj-shadow);
}
</style>
