<template>
  <div class="records-page">
    <RecordsSidebar
      :records="filteredRecords"
      :search-query="searchQuery"
      :all-tags="allTags"
      :selected-tags="selectedTags"
      :active-id="editingId"
      :list-height="listHeight"
      @new="newRecord"
      @update:searchQuery="searchQuery = $event"
      @toggle-tag="toggleTag"
      @select="selectRecord"
    />

    <RecordsEditor
      :active="showEditor || !!editingId"
      :editing-id="editingId"
      :form="form"
      :ai-loading="aiLoading"
      :ai-msg="aiMsg"
      @new="newRecord"
      @save="saveRecord"
      @delete="deleteRecord"
      @ai-summarize="aiSummarize"
      @ai-tags="aiSuggestTags"
      @update:form="form = $event"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRecordsStore } from '../stores/records'
import { suggestTags, generateSummary, isAIConfigured } from '../utils/ai'
import { useDebounce } from '../composables/useDebounce'
import RecordsSidebar from '../components/records/RecordsSidebar.vue'
import RecordsEditor from '../components/records/RecordsEditor.vue'

const recordsStore = useRecordsStore()
const records = ref([])
const searchQuery = ref('')
const debouncedSearch = useDebounce(searchQuery, 300)
const selectedTags = ref([])
const listHeight = ref(600)
const showEditor = ref(false)
const editingId = ref(null)
const form = ref({ title: '', content: '', tagsStr: '', category: 'experiment', updatedAt: null })
const aiLoading = ref(false)
const aiMsg = ref('')

recordsStore.load()
records.value = recordsStore.records

const allTags = computed(() => {
  const tags = new Set()
  records.value.forEach(r => r.tags?.forEach(t => tags.add(t)))
  return [...tags]
})

const filteredRecords = computed(() => {
  return records.value.filter(r => {
    const q = debouncedSearch.value.toLowerCase()
    const matchSearch = !q ||
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.content && r.content.toLowerCase().includes(q))
    const matchTags = selectedTags.value.length === 0 ||
      selectedTags.value.some(t => r.tags?.includes(t))
    return matchSearch && matchTags
  })
})

onMounted(() => {
  const sidebar = document.querySelector('.records-sidebar')
  if (sidebar) listHeight.value = sidebar.clientHeight - 180
})

function toggleTag(tag) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx === -1) selectedTags.value.push(tag)
  else selectedTags.value.splice(idx, 1)
}

function selectRecord(record) {
  editingId.value = record.id
  showEditor.value = true
  form.value = {
    title: record.title,
    content: record.content,
    tagsStr: record.tags?.join(', ') || '',
    category: record.category || 'experiment',
    updatedAt: record.updatedAt
  }
}

function newRecord() {
  editingId.value = null
  showEditor.value = true
  form.value = { title: '', content: '', tagsStr: '', category: 'experiment', updatedAt: null }
}

function saveRecord() {
  const data = {
    title: form.value.title,
    content: form.value.content,
    tags: form.value.tagsStr.split(',').map(t => t.trim()).filter(Boolean),
    category: form.value.category
  }

  if (editingId.value) {
    recordsStore.update(editingId.value, data)
  } else {
    recordsStore.add(data)
  }

  records.value = recordsStore.records
  if (!editingId.value) {
    const newest = records.value[0]
    if (newest) selectRecord(newest)
  }
}

function deleteRecord() {
  if (!editingId.value) return
  if (confirm('确定删除这条记录？')) {
    recordsStore.remove(editingId.value)
    records.value = recordsStore.records
    editingId.value = null
    showEditor.value = false
    form.value = { title: '', content: '', tagsStr: '', category: 'experiment', updatedAt: null }
  }
}

async function aiSuggestTags() {
  if (!isAIConfigured()) { aiMsg.value = '请先在设置中配置 API Key'; return }
  if (!form.value.content.trim()) { aiMsg.value = '请先填写内容'; return }
  aiLoading.value = true
  aiMsg.value = ''
  try {
    const tags = await suggestTags(form.value.title + '\n' + form.value.content)
    form.value = { ...form.value, tagsStr: tags }
    aiMsg.value = '标签已生成'
  } catch (e) {
    aiMsg.value = e.message
  } finally {
    aiLoading.value = false
  }
}

async function aiSummarize() {
  if (!isAIConfigured()) { aiMsg.value = '请先在设置中配置 API Key'; return }
  if (!form.value.content.trim()) { aiMsg.value = '请先填写内容'; return }
  aiLoading.value = true
  aiMsg.value = ''
  try {
    const summary = await generateSummary(form.value.title + '\n' + form.value.content)
    form.value = { ...form.value, content: form.value.content + '\n\n【AI 摘要】' + summary }
    aiMsg.value = '摘要已添加到内容末尾'
  } catch (e) {
    aiMsg.value = e.message
  } finally {
    aiLoading.value = false
  }
}
</script>

<style scoped>
.records-page {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 0;
  height: calc(100vh - var(--header-h) - 60px);
  margin: -30px -40px;
  max-width: none;
}

@media (max-width: 768px) {
  .records-page {
    grid-template-columns: 1fr;
    grid-template-rows: 200px 1fr;
  }
}
</style>
