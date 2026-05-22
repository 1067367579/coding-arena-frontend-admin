<script setup>
import { RouterView } from 'vue-router'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
</script>

<template>
  <el-config-provider :locale="zhCn">
    <Suspense>
      <RouterView v-slot="{ Component, route }">
        <Transition name="admin-page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </Suspense>
  </el-config-provider>
</template>
