<template>
  <div class="login-page">
    <!-- Decorative blobs with floating animations -->
    <div class="blob blob-blue-large"></div>
    <div class="blob blob-blue-small"></div>
    <div class="blob blob-orange"></div>

    <!-- Glass login card -->
    <div class="login-card">
      <div class="login-header">
        <img class="login-logo" src="@/assets/oj-logo.svg" alt="CodeFlow" />
        <p class="login-subtitle">管理控制台</p>
      </div>

      <div class="login-form">
        <!-- Account input -->
        <div class="input-group">
          <el-icon class="input-icon"><User /></el-icon>
          <el-input
            v-model="userAccount"
            placeholder="请输入账号"
            @keyup.enter="login"
            :disabled="loading"
          />
        </div>
        
        <!-- Password input -->
        <div class="input-group">
          <el-icon class="input-icon"><Lock /></el-icon>
          <el-input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            show-password
            @keyup.enter="login"
            :disabled="loading"
          />
        </div>
        
        <!-- Submit button -->
        <button class="login-submit-btn" :disabled="loading" @click="login">
          <span v-if="!loading">登录</span>
          <el-icon v-else class="is-loading"><Loading /></el-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { loginService } from '@/apis/admin'
import router from '@/router'
import { ref } from 'vue'
import { setToken } from '@/utils/cookie'
import { User, Lock, Loading } from '@element-plus/icons-vue'

const userAccount = ref('')
const password = ref('')
const loading = ref(false)

async function login() {
  if (!userAccount.value.trim()) {
    ElMessage.warning('请输入账号')
    return
  }
  if (!password.value.trim()) {
    ElMessage.warning('请输入密码')
    return
  }

  loading.value = true
  try {
    const loginRes = await loginService(userAccount.value, password.value)
    setToken(loginRes.data)
    ElMessage.success('登录成功，欢迎回来！')
    router.push('/oj/layout/cuser')
  } catch (error) {
    ElMessage.error(error.message || '登录失败，请检查账号和密码')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--oj-app-background);
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

/* Decorative blur blobs with floating animations */
.blob {
  position: absolute;
  border-radius: 50%;
  opacity: 0.25;
  filter: blur(90px);
  pointer-events: none;
}

.blob-blue-large {
  width: 450px;
  height: 450px;
  background: linear-gradient(135deg, var(--oj-primary), #308efe);
  opacity: 0.22;
  top: 8%;
  right: 12%;
  animation: float-blob-blue 20s infinite ease-in-out;
}

.blob-blue-small {
  width: 260px;
  height: 260px;
  background: linear-gradient(135deg, #5ac8fa, var(--oj-primary));
  opacity: 0.18;
  top: 60%;
  right: 40%;
  animation: float-blob-small 16s infinite ease-in-out;
}

.blob-orange {
  width: 380px;
  height: 380px;
  background: linear-gradient(135deg, var(--oj-accent), #ffb03a);
  opacity: 0.16;
  top: 15%;
  left: 8%;
  animation: float-blob-orange 24s infinite ease-in-out;
}

@keyframes float-blob-blue {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -60px) scale(1.08); }
}

@keyframes float-blob-small {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(50px, 30px) scale(1.12); }
}

@keyframes float-blob-orange {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, 40px) scale(0.95); }
}

/* Glass login card */
.login-card {
  position: relative;
  z-index: 2;
  width: 400px;
  padding: 44px 36px 40px;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.05),
    0 1px 0 rgba(255, 255, 255, 0.4) inset;
  transition: transform 0.4s var(--motion-spring), box-shadow 0.4s;

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 20px 50px rgba(0, 0, 0, 0.08),
      0 1px 0 rgba(255, 255, 255, 0.5) inset;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  height: 54px;
  width: auto;
  margin: 0 auto 16px;
  filter: drop-shadow(0 6px 12px rgba(0, 122, 255, 0.15));
}

.login-subtitle {
  font-size: 14px;
  font-weight: 600;
  color: var(--oj-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Input groups */
.input-group {
  display: flex;
  align-items: center;
  height: 48px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: var(--oj-radius-sm);
  padding: 0 16px;
  transition:
    background var(--motion-fast) var(--motion-spring-soft),
    border-color var(--motion-fast) var(--motion-spring-soft),
    box-shadow var(--motion-fast) var(--motion-spring-soft);

  &:focus-within {
    background: var(--oj-surface);
    border-color: rgba(0, 122, 255, 0.3);
    box-shadow:
      0 0 0 3px rgba(0, 122, 255, 0.1),
      0 4px 12px rgba(0, 122, 255, 0.04);
  }

  .input-icon {
    font-size: 18px;
    color: var(--oj-muted);
    margin-right: 12px;
    flex-shrink: 0;
    transition: color 0.2s;
  }

  &:focus-within .input-icon {
    color: var(--oj-primary);
  }

  :deep(.el-input) {
    flex: 1;
  }

  :deep(.el-input__wrapper) {
    background: transparent !important;
    box-shadow: none !important;
    padding: 0;

    &:hover,
    &.is-focus {
      background: transparent !important;
      box-shadow: none !important;
      transform: none;
    }
  }

  :deep(.el-input__inner) {
    color: var(--oj-ink);
    font-size: 14px;
    font-weight: 500;
    height: 100%;

    &::placeholder {
      color: var(--oj-subtle);
      font-weight: 400;
    }
  }
}

/* Submit button */
.login-submit-btn {
  margin-top: 10px;
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, var(--oj-primary), #0062cc);
  border-radius: var(--oj-radius-sm);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 15px;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 0.05em;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2);
  transition:
    background var(--motion-fast) var(--motion-spring-soft),
    transform var(--motion-fast) var(--motion-spring),
    box-shadow var(--motion-fast) var(--motion-spring-soft);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0088ff, var(--oj-primary-strong));
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(0, 122, 255, 0.35);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }
  
  .is-loading {
    animation: rotating 2s linear infinite;
    font-size: 18px;
  }
}
</style>
