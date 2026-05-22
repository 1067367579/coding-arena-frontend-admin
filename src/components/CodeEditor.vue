<template>
  <div class="code-editor-shell">
    <div class="editor-toolbar">
      <div class="window-dots">
        <span class="dot dot-red"></span>
        <span class="dot dot-yellow"></span>
        <span class="dot dot-green"></span>
      </div>
      <span class="toolbar-label">Code Editor</span>
    </div>
    <div ref="editorform" class="ace-editor"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue"
import ace from "ace-builds"
import "ace-builds/src-noconflict/mode-java"
import "ace-builds/src-noconflict/theme-tomorrow_night"
import "ace-builds/src-noconflict/ext-language_tools"

const options = {
  theme: "ace/theme/tomorrow_night",
  mode: "ace/mode/java",
  maxLines: 20,
  minLines: 10,
  fontSize: 15,
}

let editor = null
const emit = defineEmits(['update:value'])
const editorform = ref(null)
const pendingValue = ref('')

onMounted(() => {
  editor = ace.edit(editorform.value, options)
  editor.setOptions({
    enableBasicAutocompletion: true,
  })
  
  if (pendingValue.value) {
    editor.setValue(pendingValue.value, -1)
    pendingValue.value = ''
  }
  
  editor.getSession().on('change', () => {
    emit('update:value', editor.getValue())
  })
})

onBeforeUnmount(() => {
  if (editor) {
    editor.destroy()
    editor = null
  }
})

function setAceCode(content) {
  if (editor) {
    editor.setValue(content, -1)
  } else {
    pendingValue.value = content
  }
}

defineExpose({
  setAceCode
})
</script>

<style lang="scss" scoped>
.code-editor-shell {
  margin: 10px 0 0 0;
  width: 100%;
  border-radius: var(--oj-radius-sm);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #0f1720;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 36px;
  padding: 0 14px;
  background: #111a24;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.window-dots {
  display: flex;
  gap: 7px;
}

.dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
}

.dot-red { background: #ef4444; }
.dot-yellow { background: #f59e0b; }
.dot-green { background: #22c55e; }

.toolbar-label {
  font-size: 11px;
  color: #6b7a8d;
  font-weight: 600;
  margin-left: 4px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.ace-editor {
  width: 100%;
  min-height: 200px;
}
</style>
