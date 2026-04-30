<template>
  <div class="polish-page">
    <h1 class="page-title">论文润色提示词</h1>

    <div class="card intro">
      <p>复制以下提示词到 ChatGPT / Claude / DeepL Write 等 AI 工具中，粘贴你的论文段落即可获得润色建议。</p>
    </div>

    <!-- 分类筛选 -->
    <div class="filters">
      <button v-for="cat in categories" :key="cat.key" class="filter-btn" :class="{ active: activeCat === cat.key }" @click="activeCat = cat.key">
        {{ cat.label }}
      </button>
    </div>

    <!-- 提示词列表 -->
    <div class="prompt-list">
      <div v-for="prompt in filtered" :key="prompt.id" class="card prompt-card">
        <div class="prompt-header">
          <h3 class="prompt-title">{{ prompt.title }}</h3>
          <button class="btn-copy" @click="copyPrompt(prompt.text)">
            {{ copiedId === prompt.id ? '✓ 已复制' : '📋 复制' }}
          </button>
        </div>
        <div class="prompt-desc">{{ prompt.desc }}</div>
        <div class="prompt-text">
          <pre>{{ prompt.text }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const PROMPTS = [
  // 润色
  {
    id: 1, cat: 'polish', title: '学术润色（通用）',
    desc: '适用于大多数学术段落的润色',
    text: `Please polish the following academic text for clarity, coherence, and readability. Maintain the original meaning and technical accuracy. Fix any grammar, spelling, or punctuation errors. Improve sentence flow and word choice. Output the polished version only.

Text to polish:
[Paste your text here]`
  },
  {
    id: 2, cat: 'polish', title: '深度润色（含修改说明）',
    desc: '不仅润色，还解释每处修改的原因',
    text: `Please polish the following academic text. For each change you make, provide:
1. The original sentence
2. The revised sentence
3. A brief explanation of why the change was made

Focus on: grammar, clarity, conciseness, academic tone, and natural flow.

Text to polish:
[Paste your text here]`
  },
  {
    id: 3, cat: 'polish', title: 'SCI 期刊级别润色',
    desc: '针对高影响因子期刊的严格润色标准',
    text: `You are an expert scientific editor for top-tier SCI journals (Nature, Science, Advanced Materials, etc.). Please thoroughly revise the following manuscript text to meet the highest publication standards:

1. Ensure precise and concise scientific language
2. Eliminate redundancy and wordiness
3. Strengthen logical flow between sentences and paragraphs
4. Use appropriate hedging language where needed
5. Ensure consistency in terminology
6. Optimize figure/table references in text

Please output the revised text with tracked changes implied (show the full revised version).

Original text:
[Paste your text here]`
  },
  // 语法
  {
    id: 4, cat: 'grammar', title: '语法检查与修复',
    desc: '专注语法错误的检查和修正',
    text: `Please check the following academic text for grammar errors. For each error found:
1. Quote the original phrase
2. Explain the error type
3. Provide the correction

Then output the fully corrected version.

Text to check:
[Paste your text here]`
  },
  {
    id: 5, cat: 'grammar', title: '冠词和介词修正',
    desc: '特别针对中国学生常见的冠词介词错误',
    text: `Please review the following English text, focusing specifically on:
1. Article usage (a/an/the) — correct any misuse
2. Preposition choice — ensure correct collocations
3. Singular/plural noun agreement

For each correction, explain the grammar rule involved.

Text to review:
[Paste your text here]`
  },
  // 简洁
  {
    id: 6, cat: 'concise', title: '精简压缩',
    desc: '在不丢失信息的前提下压缩字数',
    text: `Please condense the following text while preserving all key information and scientific accuracy. Target: reduce word count by 20-30% without losing meaning. Eliminate redundancy, combine similar sentences, and use more concise expressions.

Original text:
[Paste your text here]`
  },
  {
    id: 7, cat: 'concise', title: '消除冗余表达',
    desc: '识别并删除不必要的修饰和重复',
    text: `Please identify and eliminate redundant expressions in the following academic text. Common redundancies to look for:
- "basic fundamentals" → "fundamentals"
- "past history" → "history"
- "each and every" → "each/every"
- "In order to" → "To"
- "It is important to note that" → remove
- "Due to the fact that" → "Because"
- Repeated information across sentences

Output the cleaned version with word count savings noted.

Text:
[Paste your text here]`
  },
  // 学术表达
  {
    id: 8, cat: 'academic', title: '学术句式升级',
    desc: '将普通表达替换为高级学术表达',
    text: `Please upgrade the following text to use more sophisticated academic language. Replace common/vague expressions with precise, field-appropriate terminology. Suggest stronger verbs, more specific nouns, and better transitions. Maintain the original meaning.

Examples of upgrades:
- "shows" → "demonstrates / reveals / indicates"
- "big" → "significant / substantial / considerable"
- "important" → "crucial / pivotal / instrumental"
- "more and more" → "an increasing number of"

Text to upgrade:
[Paste your text here]`
  },
  {
    id: 9, cat: 'academic', title: '被动语态转换',
    desc: '将主动语态转为学术常用的被动语态',
    text: `Please convert the following text to use appropriate academic passive voice where suitable. Academic writing often uses passive voice to:
1. Emphasize the action/object over the actor
2. Create a more objective tone
3. Maintain formal register

Note: Do not convert all sentences — use passive voice where it improves the text. Keep active voice where it creates clearer, more direct sentences.

Text:
[Paste your text here]`
  },
  // 结构
  {
    id: 10, cat: 'structure', title: '段落逻辑优化',
    desc: '检查段落内部的逻辑连贯性',
    text: `Please analyze the logical flow of the following paragraph(s). Check:
1. Topic sentence clarity
2. Supporting sentences relevance
3. Transition smoothness between sentences
4. Paragraph unity (one main idea per paragraph)

Suggest restructuring if needed, and provide the improved version with explanations.

Text:
[Paste your text here]`
  },
  {
    id: 11, cat: 'structure', title: 'Introduction 段落重组',
    desc: '按照漏斗结构重组引言段落',
    text: `Please restructure the following Introduction paragraph(s) following the "funnel" structure:
1. Start broad (general context)
2. Narrow down (specific problem/gap)
3. State the purpose/objective
4. Briefly mention approach/methods

Maintain all existing information but reorder and refine for better logical flow.

Text:
[Paste your text here]`
  },
  // 中译英
  {
    id: 12, cat: 'cn2en', title: '中文论文英译（学术）',
    desc: '将中文学术文本翻译为地道英文',
    text: `You are a professional academic translator specializing in scientific papers. Please translate the following Chinese text into publication-ready English. Requirements:
1. Use appropriate academic vocabulary
2. Follow English academic writing conventions
3. Maintain technical accuracy
4. Ensure natural sentence flow (not word-for-word translation)
5. Add articles (a/an/the) where appropriate
6. Use correct tense (past for methods/results, present for established knowledge)

Chinese text:
[Paste your text here]`
  },
  {
    id: 13, cat: 'cn2en', title: '逐句对照翻译',
    desc: '中英对照，便于检查和学习',
    text: `Please translate the following Chinese academic text into English, sentence by sentence. Format:

[Chinese sentence 1]
→ [English translation 1]

[Chinese sentence 2]
→ [English translation 2]

...and so on.

At the end, provide the complete English version as a continuous paragraph.

Chinese text:
[Paste your text here]`
  },
  // 回复审稿人
  {
    id: 14, cat: 'response', title: '审稿意见回复模板',
    desc: '生成规范的审稿意见回复',
    text: `Please help me draft a professional response to the following reviewer comment. Structure the response as:

1. **Acknowledgment**: Thank the reviewer for their constructive feedback
2. **Action taken**: Describe what changes were made
3. **Location of changes**: Reference specific sections/lines modified
4. **Explanation** (if applicable): Briefly explain rationale if the suggestion was not fully adopted

Reviewer comment:
[Paste reviewer comment here]

My response (draft):
[Paste your draft response here or leave blank for AI to generate]`
  },
  {
    id: 15, cat: 'response', title: 'Cover Letter 生成',
    desc: '根据论文标题和摘要生成投稿信',
    text: `Please write a professional cover letter for the following manuscript submission. Include:
1. Manuscript title and authors
2. Journal name and why it is a good fit
3. Brief summary of key findings (2-3 sentences)
4. Statement of novelty and significance
5. Confirmation that the work is original and not under consideration elsewhere

Manuscript title: [Your title]
Target journal: [Journal name]
Key findings: [Brief description]
Author corresponding: [Your name]`
  },
  // 热电专用
  {
    id: 16, cat: 'thermo', title: '热电材料论文 Introduction',
    desc: '专为热电材料研究设计的引言模板',
    text: `Please help me write/polish an Introduction section for a thermoelectric materials paper. Follow this structure:

1. **Energy context**: Global energy challenges, waste heat recovery importance
2. **Thermoelectric fundamentals**: Seebeck effect, ZT = S²σT/κ, brief explanation
3. **Material challenges**: Trade-off between S and σ (power factor), lattice thermal conductivity reduction strategies
4. **Specific material system**: [Your material system] - current state of the art
5. **Research gap**: What limitation or question your work addresses
6. **Objective**: Clear statement of your work's contribution

Material system: [e.g., SnSe, Bi₂Te₃, half-Heuslers, skutterudites]
Key finding: [Your main result]

Please write in publication-ready English with appropriate citations placeholder [ref].`
  }
]

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'polish', label: '润色' },
  { key: 'grammar', label: '语法' },
  { key: 'concise', label: '精简' },
  { key: 'academic', label: '学术表达' },
  { key: 'structure', label: '结构优化' },
  { key: 'cn2en', label: '中译英' },
  { key: 'response', label: '投稿回复' },
  { key: 'thermo', label: '热电专用' }
]

export default {
  name: 'PolishView',
  data() {
    return {
      prompts: PROMPTS,
      categories: CATEGORIES,
      activeCat: 'all',
      copiedId: null
    }
  },
  computed: {
    filtered() {
      if (this.activeCat === 'all') return this.prompts
      return this.prompts.filter(p => p.cat === this.activeCat)
    }
  },
  methods: {
    copyPrompt(text) {
      navigator.clipboard.writeText(text).then(() => {
        // Find the prompt to mark as copied
        const prompt = this.prompts.find(p => p.text === text)
        if (prompt) {
          this.copiedId = prompt.id
          setTimeout(() => { this.copiedId = null }, 2000)
        }
      })
    }
  }
}
</script>

<style scoped>
.polish-page { max-width: 800px; margin: 0 auto; }

.intro {
  margin-bottom: 16px;
}

.intro p {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.filter-btn {
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: none;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.prompt-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prompt-card { margin-bottom: 0; }

.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.prompt-title {
  font-size: 16px;
  margin: 0;
  color: var(--text-primary);
}

.btn-copy {
  padding: 4px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: none;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-copy:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.prompt-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.prompt-text {
  background: var(--bg-secondary);
  border-radius: var(--radius);
  padding: 12px;
  overflow-x: auto;
}

.prompt-text pre {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
}
</style>
