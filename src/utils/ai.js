/**
 * AI 工具模块 - 统一管理 AI API 调用
 */

import { getStorage } from './storage'

function getAIConfig() {
  // 优先读取 ai_config，兼容旧的 translate_config
  const aiConfig = getStorage('ai_config', null)
  if (aiConfig && aiConfig.apiKey) return aiConfig
  return getStorage('translate_config', {
    provider: 'openai',
    apiKey: '',
    baseUrl: '',
    model: 'gpt-4o-mini'
  })
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

/**
 * 通用 AI 调用
 * @param {string} systemPrompt - 系统提示词
 * @param {string} userMessage - 用户消息
 * @param {object} options - 额外选项 { temperature, maxTokens }
 * @returns {Promise<string>} AI 回复
 */
export async function callAI(systemPrompt, userMessage, options = {}) {
  const { temperature = 0.7, maxTokens = 2000, useCache = true } = options

  // 缓存检查
  const cacheKey = useCache ? `${systemPrompt.slice(0, 60)}|${userMessage.slice(0, 100)}|${temperature}` : null
  if (cacheKey) {
    const cached = cacheGet(cacheKey)
    if (cached) return cached
  }

  const config = getAIConfig()
  if (!config.apiKey) {
    throw new Error('请先在"设置"或"翻译"页面配置 API Key')
  }

  if (config.provider === 'deepl') {
    throw new Error('DeepL 不支持 AI 对话，请使用 OpenAI 或自定义 API')
  }

  const url = config.provider === 'openai'
    ? 'https://api.openai.com/v1/chat/completions'
    : config.baseUrl

  // 重试逻辑：指数退避，最多 2 次重试
  let lastError
  for (let attempt = 0; attempt <= 2; attempt++) {
    if (attempt > 0) {
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)))
    }

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature,
          max_tokens: maxTokens
        })
      })

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        lastError = new Error(err.error?.message || `API 请求失败 (${resp.status})`)
        // 429/5xx 可重试
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
