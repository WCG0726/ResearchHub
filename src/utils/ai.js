/**
 * AI 工具模块 - 统一管理 AI API 调用
 */

import { getStorage, setStorage, removeStorage } from './storage'

function getAIConfig() {
  const aiConfig = getStorage('ai_config', null)
  if (aiConfig && aiConfig.apiKey) return aiConfig
  // 迁移旧配置
  const legacy = getStorage('translate_config', null)
  if (legacy && legacy.apiKey) {
    setStorage('ai_config', legacy)
    removeStorage('translate_config')
    return legacy
  }
  return { provider: 'openai', apiKey: '', baseUrl: '', model: 'gpt-4o-mini' }
}

// 内存缓存：TTL 5分钟，最多 50 条
const _cache = new Map()
const CACHE_TTL = 5 * 60 * 1000
const CACHE_MAX = 50

function cacheGet(key) {
  const entry = _cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL) { _cache.delete(key); return null }
  return entry.value
}

function cacheSet(key, value) {
  if (_cache.size >= CACHE_MAX) {
    const oldest = _cache.keys().next().value
    _cache.delete(oldest)
  }
  _cache.set(key, { value, ts: Date.now() })
}

export function isAIConfigured() {
  const config = getAIConfig()
  return !!config.apiKey
}

function getAPIUrl() {
  const config = getAIConfig()
  return config.provider === 'openai'
    ? 'https://api.openai.com/v1/chat/completions'
    : config.baseUrl
}

function validateConfig() {
  const config = getAIConfig()
  if (!config.apiKey) throw new Error('请先在"设置"页面配置 API Key')
  if (config.provider === 'deepl') throw new Error('DeepL 不支持 AI 对话，请使用 OpenAI 或自定义 API')
  return config
}

function messagesToCacheKey(messages) {
  return messages.map(m => m.content.slice(0, 80)).join('|')
}

/**
 * 多轮对话 AI 调用
 * @param {Array} messages - [{role, content}] 消息数组
 * @param {object} options - { temperature, maxTokens, useCache }
 * @returns {Promise<string>} AI 回复
 */
export async function callAIChat(messages, options = {}) {
  const { temperature = 0.7, maxTokens = 2000, useCache = true } = options

  const cacheKey = useCache ? `chat|${messagesToCacheKey(messages)}|${temperature}` : null
  if (cacheKey) {
    const cached = cacheGet(cacheKey)
    if (cached) return cached
  }

  const config = validateConfig()
  const url = getAPIUrl()

  let lastError
  for (let attempt = 0; attempt <= 2; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)))
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
        body: JSON.stringify({ model: config.model || 'gpt-4o-mini', messages, temperature, max_tokens: maxTokens })
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        lastError = new Error(err.error?.message || `API 请求失败 (${resp.status})`)
        if (resp.status === 429 || resp.status >= 500) continue
        throw lastError
      }
      const data = await resp.json()
      const result = data.choices[0].message.content.trim()
      if (cacheKey) cacheSet(cacheKey, result)
      return result
    } catch (e) {
      lastError = e
      if (e.message.includes('API 请求失败')) continue
      throw e
    }
  }
  throw lastError
}

/**
 * 单轮 AI 调用（callAIChat 的便捷包装）
 */
export async function callAI(systemPrompt, userMessage, options = {}) {
  return callAIChat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ], options)
}

/**
 * 流式 AI 调用
 * @param {string} systemPrompt - 系统提示词
 * @param {string} userMessage - 用户消息
 * @param {object} options - { temperature, maxTokens, onChunk, signal }
 * @returns {Promise<string>} 完整回复
 */
export async function callAIStream(systemPrompt, userMessage, options = {}) {
  const { temperature = 0.7, maxTokens = 2000, onChunk, signal } = options
  const config = validateConfig()
  const url = getAPIUrl()

  let lastError
  for (let attempt = 0; attempt <= 2; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)))
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
        body: JSON.stringify({
          model: config.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature,
          max_tokens: maxTokens,
          stream: true
        }),
        signal
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        lastError = new Error(err.error?.message || `API 请求失败 (${resp.status})`)
        if (resp.status === 429 || resp.status >= 500) continue
        throw lastError
      }

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) {
              fullText += delta
              onChunk?.(fullText)
            }
          } catch { /* skip malformed chunks */ }
        }
      }
      return fullText
    } catch (e) {
      if (e.name === 'AbortError') throw e
      lastError = e
      if (e.message.includes('API 请求失败')) continue
      throw e
    }
  }
  throw lastError
}

// ===== 预设 AI 功能 =====

/**
 * 论文润色
 */
export async function polishText(text, style = 'academic') {
  const prompts = {
    academic: `You are an expert academic editor. Polish the following text for clarity, coherence, and academic tone. Fix grammar errors, improve word choice, and enhance readability. Keep the original meaning. Output only the polished text.`,
    deep: `You are an expert academic editor. Revise the following text and explain each change:
1. The original sentence
2. The revised sentence
3. Reason for change
Focus on: grammar, clarity, conciseness, academic tone.`,
    sci: `You are a scientific editor for top-tier SCI journals. Thoroughly revise the following manuscript text:
- Ensure precise and concise scientific language
- Eliminate redundancy
- Strengthen logical flow
- Use appropriate hedging
- Ensure terminology consistency
Output the revised text only.`
  }
  return callAI(prompts[style] || prompts.academic, text, { temperature: 0.3 })
}

/**
 * 自动标签建议
 */
export async function suggestTags(content) {
  const prompt = `You are a research tag suggestion system. Given the following research record content, suggest 3-5 relevant tags in Chinese. Output only the tags, separated by commas, no numbering.`
  return callAI(prompt, content, { temperature: 0.3, maxTokens: 100 })
}

/**
 * 内容摘要生成
 */
export async function generateSummary(content) {
  const prompt = `You are a research summarizer. Generate a concise 2-3 sentence summary of the following research content in Chinese. Focus on key findings and methods.`
  return callAI(prompt, content, { temperature: 0.3, maxTokens: 200 })
}

/**
 * 文献笔记结构化
 */
export async function generateLitNoteTemplate(title, doi) {
  const prompt = `You are a research assistant. Given a paper title${doi ? ' and DOI' : ''}, generate a structured reading note template in Chinese with these sections:
- 核心要点 (Key Points): 3 bullet points
- 研究方法 (Methods): brief description
- 个人评价 (Comments): questions and thoughts
Keep it concise. Output in Chinese.`
  const input = doi ? `Title: ${title}\nDOI: ${doi}` : `Title: ${title}`
  return callAI(prompt, input, { temperature: 0.7, maxTokens: 500 })
}

/**
 * 组会纪要生成
 */
export async function generateMeetingMinutes(topics, feedback) {
  const prompt = `You are a meeting minutes generator. Given the meeting topics and advisor feedback below, generate structured meeting minutes in Chinese:
1. 会议要点 (Key Points)
2. 导师建议要点 (Advisor Suggestions)
3. 后续待办 (Action Items) - as a checklist
Be concise and actionable.`
  const input = `Topics: ${topics}\nFeedback: ${feedback}`
  return callAI(prompt, input, { temperature: 0.5, maxTokens: 500 })
}

/**
 * 灵感扩展
 */
export async function expandInspiration(title, content) {
  const prompt = `You are a research brainstorming assistant. Given a research idea, provide:
1. 可行性分析 (Feasibility): brief assessment
2. 相关方向 (Related Directions): 2-3 suggestions
3. 初步方案框架 (Preliminary Framework): outline
Output in Chinese, be concise.`
  const input = `Idea: ${title}\nDetails: ${content || '(none)'}`
  return callAI(prompt, input, { temperature: 0.7, maxTokens: 600 })
}

/**
 * 邮件生成
 */
export async function generateEmail(scenario, keyInfo) {
  const prompt = `You are an academic email writer. Generate a professional email in English based on:
- Scenario: ${scenario}
- Key information: ${keyInfo}

Requirements:
- Polite and professional tone
- Appropriate greeting and closing
- Concise and clear
Output the complete email.`
  return callAI(prompt, keyInfo, { temperature: 0.5, maxTokens: 500 })
}

/**
 * AI 期刊推荐
 * @param {string} title - 论文标题
 * @param {string} abstract - 摘要（可选）
 * @param {string} field - 研究领域
 * @returns {Promise<string>} 推荐结果
 */
export async function recommendJournals(title, abstract, field) {
  const prompt = `You are an academic publishing advisor. Based on the paper title${abstract ? ', abstract,' : ''} and research field, recommend 3-5 suitable journals for submission.

For each journal, provide:
1. Journal name (full name + abbreviation)
2. Impact factor range
3. Why it's a good fit (scope match)
4. Acceptance difficulty (easy/moderate/difficult)

Consider: open access options, review speed, and field relevance.
Output in Chinese. Format as a numbered list.`
  const input = `Title: ${title}\n${abstract ? `Abstract: ${abstract}\n` : ''}Field: ${field || 'Not specified'}`
  return callAI(prompt, input, { temperature: 0.5, maxTokens: 800 })
}

/**
 * 自动生成论文摘要
 * @param {string} paperTitle - 论文标题
 * @param {string} sectionNotes - 各章节要点
 * @returns {Promise<string>} 生成的摘要
 */
export async function generateAbstract(paperTitle, sectionNotes) {
  const prompt = `You are a scientific writing assistant. Based on the paper title and key points from each section, generate a structured abstract (200-300 words) in English.

Structure:
- Background (1-2 sentences)
- Methods (1-2 sentences)
- Results (2-3 sentences)
- Conclusion (1-2 sentences)

Requirements:
- Formal academic tone
- No citations
- Self-contained and clear
- Follow standard journal abstract format`
  const input = `Title: ${paperTitle}\nSection Notes:\n${sectionNotes}`
  return callAI(prompt, input, { temperature: 0.3, maxTokens: 500 })
}

/**
 * 生成论文章节草稿
 * @param {string} sectionName - 章节名称（如 Introduction, Methods）
 * @param {string} paperTitle - 论文标题
 * @param {string} notes - 相关笔记/要点
 * @returns {Promise<string>} 章节草稿
 */
export async function generateSectionDraft(sectionName, paperTitle, notes) {
  const prompt = `You are a scientific writing assistant. Write a draft for the "${sectionName}" section of an academic paper.

Title: ${paperTitle}

Guidelines:
- Use formal academic English
- Follow standard conventions for the ${sectionName} section
- Be concise and logically structured
- Use appropriate hedging language
- Include topic sentences and transitions
- Do NOT fabricate specific data or results

Output only the section text, ready to be edited.`
  return callAI(prompt, notes || '(No additional notes provided)', { temperature: 0.5, maxTokens: 1500 })
}

/**
 * AI 研究方向建议
 * @param {string} currentWork - 当前研究内容
 * @param {string} field - 研究领域
 * @returns {Promise<string>} 研究方向建议
 */
export async function suggestResearchDirections(currentWork, field) {
  const prompt = `You are a research strategy advisor. Based on the researcher's current work and field, suggest 3-5 promising research directions.

For each direction:
1. Direction name
2. Why it's promising (trend, gap, or application)
3. Difficulty level (beginner/intermediate/advanced)
4. Estimated timeline

Output in Chinese. Be specific and actionable.`
  const input = `Current Work: ${currentWork}\nField: ${field || 'Not specified'}`
  return callAI(prompt, input, { temperature: 0.7, maxTokens: 800 })
}

/**
 * 翻译文本
 * @param {string} text - 待翻译文本
 * @param {string} direction - 'en2zh' 或 'zh2en'
 * @param {string} style - 'academic' | 'natural' | 'formal' | 'simple'
 * @returns {Promise<string>} 翻译结果
 */
export async function translateText(text, direction = 'en2zh', style = 'academic') {
  const prompts = {
    en2zh: {
      academic: 'You are an academic translator. Translate the following text into natural, fluent Chinese suitable for academic papers. Preserve technical terminology. Output only the translation.',
      natural: 'Translate the following text into natural, fluent Chinese. Output only the translation.',
      formal: 'Translate the following text into formal business Chinese. Output only the translation.',
      simple: 'Translate the following text into simple, clear Chinese. Output only the translation.'
    },
    zh2en: {
      academic: 'You are an academic translator. Translate the following text into polished, publication-ready English suitable for academic papers. Preserve technical terminology. Output only the translation.',
      natural: 'Translate the following text into natural, fluent English. Output only the translation.',
      formal: 'Translate the following text into formal business English. Output only the translation.',
      simple: 'Translate the following text into simple, clear English. Output only the translation.'
    }
  }
  const prompt = prompts[direction]?.[style] || prompts.en2zh.academic
  return callAI(prompt, text, { temperature: 0.3 })
}

// ===== 文献分析 =====

export async function summarizePaper(title, abstract, fullText) {
  const prompt = `You are a research paper analyst. Generate a structured summary of this paper in Chinese:
- 研究问题 (Problem): 1-2 sentences
- 研究方法 (Methods): 1-2 sentences
- 关键结果 (Key Results): 2-3 sentences
- 研究意义 (Significance): 1 sentence
Be concise and accurate. Output in Chinese.`
  const input = `Title: ${title}\n${abstract ? `Abstract: ${abstract}\n` : ''}${fullText ? `Full Text: ${fullText}\n` : ''}`
  return callAI(prompt, input, { temperature: 0.3, maxTokens: 600 })
}

export async function extractKeyFindings(title, abstract, fullText) {
  const prompt = `You are a research paper analyst. Extract 3-5 key findings from this paper. Each finding should be one concise sentence in Chinese. Output as a numbered list.`
  const input = `Title: ${title}\n${abstract ? `Abstract: ${abstract}\n` : ''}${fullText ? `Full Text: ${fullText}\n` : ''}`
  return callAI(prompt, input, { temperature: 0.2, maxTokens: 400 })
}

export async function recommendRelatedPapers(title, abstract, field) {
  const prompt = `You are a research advisor. Based on this paper, suggest 3-5 related research directions or search queries for finding related work. For each suggestion, provide:
1. Research direction or search query
2. Why it's relevant
Output in Chinese.`
  const input = `Title: ${title}\n${abstract ? `Abstract: ${abstract}\n` : ''}Field: ${field || 'Not specified'}`
  return callAI(prompt, input, { temperature: 0.5, maxTokens: 500 })
}

export async function assessReadingDifficulty(title, abstract) {
  const prompt = `You are a reading advisor. Assess the reading difficulty of this paper:
- 难度等级 (Difficulty): beginner / intermediate / advanced
- 前置知识 (Prerequisites): 2-3 bullet points
- 预计阅读时间 (Estimated Time): in minutes
- 简要说明 (Rationale): 1 sentence
Output in Chinese.`
  const input = `Title: ${title}\n${abstract ? `Abstract: ${abstract}` : '(No abstract available)'}`
  return callAI(prompt, input, { temperature: 0.3, maxTokens: 300 })
}

// ===== 格式改写 =====

export async function rewriteFormat(text, sourceFormat, targetFormat, options = {}) {
  const { restructureParagraphs = true, convertCitations = true, adjustTone = 'formal' } = options
  const prompt = `You are an academic format editor. Rewrite the following text from "${sourceFormat}" style to "${targetFormat}" style.

Tasks:
${convertCitations ? '- Convert all citation formats to match the target style' : '- Keep citation formats unchanged'}
${restructureParagraphs ? '- Restructure paragraphs to fit the target format conventions' : '- Keep paragraph structure unchanged'}
- Adjust tone to: ${adjustTone}
- Preserve all technical content and meaning
- Output only the rewritten text`
  return callAI(prompt, text, { temperature: 0.3, maxTokens: 2000 })
}

export async function convertCitations(text, sourceStyle, targetStyle) {
  const prompt = `You are a citation format specialist. Convert all citations in the following text from "${sourceStyle}" format to "${targetStyle}" format. Only change the citation format, do not modify any other text. Output only the converted text.`
  return callAI(prompt, text, { temperature: 0.2, maxTokens: 2000 })
}

// ===== 一键作图 =====

export async function generatePlotCode(description, chartType, dataFormat, outputLang = 'python') {
  const langGuide = outputLang === 'origin'
    ? 'Generate Origin LabTalk script (.ogg) with proper Origin commands.'
    : 'Generate Python code using matplotlib. Include all necessary imports.'
  const prompt = `You are a scientific plotting expert. Generate complete, runnable ${outputLang} code for the following plot.

Chart type: ${chartType || 'auto-detect the best type'}
${dataFormat ? `Data format: ${dataFormat}` : ''}

Requirements:
- ${langGuide}
- Use publication-quality styling (clear fonts, proper labels, legend if needed)
- Include comments explaining each section
- For materials science: use appropriate axis labels, units, and formatting
- The code should be immediately copy-pasteable and runnable

Output only the code, wrapped in a code block.`
  return callAI(prompt, description, { temperature: 0.3, maxTokens: 1500 })
}

export async function suggestChartType(dataDescription) {
  const prompt = `You are a data visualization expert. Given a description of data, suggest the best chart type and explain why.

Provide:
1. Recommended chart type
2. Why it's the best choice
3. Alternative options
4. Key styling tips

Output in Chinese. Be concise.`
  return callAI(prompt, dataDescription, { temperature: 0.3, maxTokens: 400 })
}

// ===== 增强期刊推荐 =====

export async function recommendJournalsDetailed(title, abstract, field, preferences = {}) {
  const prefStr = Object.entries(preferences).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(', ')
  const prompt = `You are an academic publishing advisor. Recommend 3-5 journals for this paper.

Return a JSON array (no other text, just the JSON):
[{
  "name": "Full Journal Name",
  "abbreviation": "J. Abbrev.",
  "impactFactor": "11.9",
  "scope": "Brief scope description",
  "acceptanceRate": "Easy/Moderate/Difficult",
  "reviewSpeed": "4-6 weeks",
  "openAccess": true,
  "fitScore": 85,
  "reasoning": "Why this journal fits"
}]

${prefStr ? `Preferences: ${prefStr}` : ''}`
  const input = `Title: ${title}\n${abstract ? `Abstract: ${abstract}\n` : ''}Field: ${field || 'Not specified'}`
  const raw = await callAI(prompt, input, { temperature: 0.5, maxTokens: 1200 })
  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : raw
  } catch { return raw }
}
