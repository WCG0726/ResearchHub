<template>
  <div class="writing-page">
    <h1 class="page-title">论文写作</h1>

    <WritingPaperList :papers="papers" @new="showEditor = true" @select="selectPaper" />

    <WritingPaperDetail
      v-if="selectedPaper"
      :paper="selectedPaper"
      :ai-loading="aiLoading"
      :ai-abstract="aiAbstractResult"
      @update-status="val => { selectedPaper.status = val; savePapers() }"
      @delete="deletePaper(selectedPaper.id)"
      @ai-abstract="aiGenerateAbstract"
      @copy-abstract="copyAbstract"
      @clear-abstract="aiAbstractResult = ''"
      @ai-draft="aiDraftSection"
      @update-section-status="(idx, val) => { selectedPaper.sections[idx].status = val; savePapers() }"
      @update-section-notes="(idx, val) => { selectedPaper.sections[idx].notes = val; savePapers() }"
      @update-progress="val => { selectedPaper.progress = val; savePapers() }"
    />

    <WritingNewPaperModal
      v-if="showEditor"
      :title="newPaper.title"
      :journal="newPaper.journal"
      :topic="newPaper.topic"
      :ai-loading="aiLoading"
      :journal-cards="aiJournalCards"
      :journal-result="aiJournalResult"
      @close="closeEditor"
      @create="createPaper"
      @ai-recommend="aiRecommendJournals"
      @update:title="newPaper.title = $event"
      @update:journal="newPaper.journal = $event"
      @update:topic="newPaper.topic = $event"
      @select-journal="j => newPaper.journal = j"
      @clear-journal-cards="aiJournalCards = []"
      @clear-journal-result="aiJournalResult = ''"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useWritingStore } from '../stores/writing'
import { recommendJournalsDetailed, generateAbstract, generateSectionDraft, isAIConfigured } from '../utils/ai'
import WritingPaperList from '../components/writing/WritingPaperList.vue'
import WritingPaperDetail from '../components/writing/WritingPaperDetail.vue'
import WritingNewPaperModal from '../components/writing/WritingNewPaperModal.vue'

const writingStore = useWritingStore()

const papers = ref([])
const selectedPaper = ref(null)
const showEditor = ref(false)
const newPaper = ref({ title: '', journal: '', topic: '' })
const aiLoading = ref(false)
const aiJournalResult = ref('')
const aiJournalCards = ref([])
const aiAbstractResult = ref('')

function selectPaper(paper) {
  selectedPaper.value = paper
}

function createPaper() {
  const paper = {
    id: Date.now(),
    title: newPaper.value.title,
    journal: newPaper.value.journal,
    topic: newPaper.value.topic,
    status: '构思',
    progress: 0,
    sections: [
      { name: '摘要 (Abstract)', status: '未开始', notes: '' },
      { name: '引言 (Introduction)', status: '未开始', notes: '' },
      { name: '方法 (Methods)', status: '未开始', notes: '' },
      { name: '结果 (Results)', status: '未开始', notes: '' },
      { name: '讨论 (Discussion)', status: '未开始', notes: '' },
      { name: '结论 (Conclusion)', status: '未开始', notes: '' },
      { name: '参考文献 (References)', status: '未开始', notes: '' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  papers.value.unshift(paper)
  savePapers()
  closeEditor()
}

function savePapers() {
  papers.value.forEach(p => {
    if (p.sections) {
      const completed = p.sections.filter(s => s.status === '已完成').length
      p.progress = Math.round((completed / p.sections.length) * 100)
    }
    p.updatedAt = new Date().toISOString()
  })
  writingStore.save({ papers: papers.value })
}

function deletePaper(id) {
  if (!confirm('确定删除这篇论文？')) return
  papers.value = papers.value.filter(p => p.id !== id)
  selectedPaper.value = null
  savePapers()
}

function closeEditor() {
  showEditor.value = false
  newPaper.value = { title: '', journal: '', topic: '' }
  aiJournalResult.value = ''
  aiJournalCards.value = []
}

async function aiRecommendJournals() {
  if (!isAIConfigured()) { alert('请先在设置中配置 AI API Key'); return }
  aiLoading.value = true
  aiJournalResult.value = ''
  aiJournalCards.value = []
  try {
    const result = await recommendJournalsDetailed(newPaper.value.title, '', newPaper.value.topic)
    if (Array.isArray(result)) {
      aiJournalCards.value = result
    } else {
      aiJournalResult.value = result
    }
  } catch (e) {
    alert('AI 推荐失败：' + e.message)
  }
  aiLoading.value = false
}

async function aiDraftSection(idx) {
  if (!isAIConfigured()) { alert('请先在设置中配置 AI API Key'); return }
  if (!selectedPaper.value) return
  const section = selectedPaper.value.sections[idx]
  aiLoading.value = true
  try {
    const sectionName = section.name.replace(/\s*\(.*?\)/, '')
    const draft = await generateSectionDraft(sectionName, selectedPaper.value.title, section.notes || selectedPaper.value.topic)
    section.notes = (section.notes ? section.notes + '\n\n' : '') + '--- AI 生成草稿 ---\n' + draft
    section.status = '进行中'
    savePapers()
  } catch (e) {
    alert('AI 生成失败：' + e.message)
  }
  aiLoading.value = false
}

async function aiGenerateAbstract() {
  if (!isAIConfigured()) { alert('请先在设置中配置 AI API Key'); return }
  if (!selectedPaper.value) return
  const completedSections = selectedPaper.value.sections
    .filter(s => s.status === '已完成' && s.notes)
    .map(s => `## ${s.name}\n${s.notes}`)
    .join('\n\n')
  if (!completedSections) { alert('请先完成至少一个章节并填写笔记'); return }
  aiLoading.value = true
  aiAbstractResult.value = ''
  try {
    aiAbstractResult.value = await generateAbstract(selectedPaper.value.title, completedSections)
  } catch (e) {
    alert('AI 生成摘要失败：' + e.message)
  }
  aiLoading.value = false
}

function copyAbstract() {
  navigator.clipboard.writeText(aiAbstractResult.value).then(() => {
    alert('已复制到剪贴板')
  })
}

function loadData() {
  writingStore.load()
  papers.value = writingStore.papers || []
}

loadData()
</script>

<style scoped>
.writing-page {
  max-width: 900px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 30px;
}
</style>
