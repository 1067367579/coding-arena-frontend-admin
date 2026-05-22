<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <Suspense>
    <RouterView v-slot="{ Component, route }">
      <Transition name="admin-page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </Suspense>
</template>
