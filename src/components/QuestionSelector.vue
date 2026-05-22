<template>
  <el-select v-model="model" clearable placeholder="请选择题目难度">
    <el-option v-for="item in difficultyList" :key="item.difficulty" :label="item.difficultyName" :value="item.difficulty" />
  </el-select>
</template>

<script setup>
import { reactive } from 'vue'

const model = defineModel()

const difficultyList = reactive([
  {
    "difficulty": 1,
    "difficultyName": "简单",
  },
  {
    "difficulty": 2,
    "difficultyName": "中等",
  },
  {
    "difficulty": 3,
    "difficultyName": "困难",
  }
])
</script>
