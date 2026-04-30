/**
 * AI 工具模块 - 统一管理 AI API 调用
 * 复用翻译页面的 API 配置
 */

import { getStorage } from './storage'

function getAIConfig() {
  return getStorage('translate_config', {
    provider: 'openai',
    apiKey: '',
    baseUrl: '',
    model: 'gpt-4o-mini'
  })
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
  const config = getAIConfig()
  if (!config.apiKey) {
    throw new Error('请先在"翻译"页面配置 API Key')
  }

  const { temperature = 0.7, maxTokens = 2000 } = options

  if (config.provider === 'deepl') {
    throw new Error('DeepL 不支持 AI 对话，请使用 OpenAI 或自定义 API')
  }

  const url = config.provider === 'openai'
    ? 'https://api.openai.com/v1/chat/completions'
    : config.baseUrl

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
    throw new Error(err.error?.message || `API 请求失败 (${resp.status})`)
  }

  const data = await resp.json()
  return data.choices[0].message.content.trim()
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
