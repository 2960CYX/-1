<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

defineOptions({ name: 'RichCommentEditor' })

const props = defineProps<{ modelValue?: string; placeholder?: string; maxLength?: number }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const editorEl = ref<HTMLDivElement | null>(null)
let quill: Quill | undefined

onMounted(() => {
  const toolbarOptions = [["bold", "italic"], [{ list: 'bullet' }]]
  quill = new Quill(editorEl.value!, {
    theme: 'snow',
    modules: { toolbar: toolbarOptions },
    formats: ['bold', 'italic', 'list'],
    placeholder: props.placeholder || '写下你的评论（支持加粗、斜体、无序列表）',
  })
  if (props.modelValue) {
    quill.clipboard.dangerouslyPasteHTML(props.modelValue)
  }
  quill.on('text-change', () => {
    if (!quill) return
    const max = props.maxLength || 0
    const textLen = Math.max(0, quill.getLength() - 1) // quill 末尾有一个换行
    if (max > 0 && textLen > max) {
      const over = textLen - max
      quill.deleteText(max, over)
    }
    const html = quill.root.innerHTML
    emit('update:modelValue', html)
  })
})

onBeforeUnmount(() => {
  quill = undefined
})

function getHtml(): string {
  return quill?.root.innerHTML || ''
}

defineExpose({ getHtml })
</script>

<template>
  <div class="editor-wrapper">
    <div ref="editorEl" class="quill-editor" />
  </div>
  
</template>

<style scoped>
.ql-container { min-height: 160px; }
.ql-editor { min-height: 120px; }
</style>