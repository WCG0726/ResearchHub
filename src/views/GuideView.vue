<template>
  <div class="guide-page">
    <h1 class="page-title">写作指南</h1>

    <!-- 分类导航 -->
    <div class="guide-nav">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="guide-nav-btn"
        :class="{ active: activeCategory === cat.id }"
        @click="activeCategory = cat.id"
      >
        {{ cat.icon }} {{ cat.name }}
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="guide-content">
      <!-- 论文结构 -->
      <div v-if="activeCategory === 'structure'" class="guide-section">
        <h2>论文结构</h2>

        <div class="guide-card">
          <h3>📄 标准论文结构</h3>
          <div class="structure-list">
            <div class="structure-item">
              <span class="structure-name">Abstract</span>
              <span class="structure-desc">全文精华，200-300词，包含目的、方法、结果、结论</span>
            </div>
            <div class="structure-item">
              <span class="structure-name">Introduction</span>
              <span class="structure-desc">研究背景、文献综述、研究空白、研究目的</span>
            </div>
            <div class="structure-item">
              <span class="structure-name">Methods</span>
              <span class="structure-desc">实验材料、制备方法、表征手段、计算方法</span>
            </div>
            <div class="structure-item">
              <span class="structure-name">Results</span>
              <span class="structure-desc">实验结果、数据图表、对比分析</span>
            </div>
            <div class="structure-item">
              <span class="structure-name">Discussion</span>
              <span class="structure-desc">结果解释、机理分析、与文献对比、局限性</span>
            </div>
            <div class="structure-item">
              <span class="structure-name">Conclusion</span>
              <span class="structure-desc">主要发现、意义、未来展望</span>
            </div>
          </div>
        </div>

        <div class="guide-card">
          <h3>💡 写作顺序建议</h3>
          <p>推荐写作顺序：Methods → Results → Discussion → Introduction → Abstract → Conclusion</p>
          <p>先写最熟悉的部分，最后写摘要和引言。</p>
        </div>
      </div>

      <!-- 常用句式 -->
      <div v-if="activeCategory === 'phrases'" class="guide-section">
        <h2>常用学术句式</h2>

        <div v-for="group in phraseGroups" :key="group.title" class="guide-card">
          <h3>{{ group.icon }} {{ group.title }}</h3>
          <div class="phrase-list">
            <div v-for="(phrase, idx) in group.phrases" :key="idx" class="phrase-item">
              <span class="phrase-en">{{ phrase.en }}</span>
              <span class="phrase-cn">{{ phrase.cn }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 写作技巧 -->
      <div v-if="activeCategory === 'tips'" class="guide-section">
        <h2>写作技巧</h2>

        <div v-for="tip in tips" :key="tip.title" class="guide-card">
          <h3>{{ tip.icon }} {{ tip.title }}</h3>
          <ul class="tip-list">
            <li v-for="(item, idx) in tip.items" :key="idx">{{ item }}</li>
          </ul>
        </div>
      </div>

      <!-- 期刊投稿 -->
      <div v-if="activeCategory === 'submission'" class="guide-section">
        <h2>期刊投稿</h2>

        <div class="guide-card">
          <h3>📋 投稿前检查清单</h3>
          <div class="checklist">
            <label v-for="(item, idx) in submissionChecklist" :key="idx" class="checklist-item">
              <input type="checkbox" v-model="item.checked" />
              <span>{{ item.text }}</span>
            </label>
          </div>
        </div>

        <div class="guide-card">
          <h3>🎯 期刊选择建议</h3>
          <ul class="tip-list">
            <li>影响因子：匹配自己研究水平</li>
            <li>审稿周期：急用选快的期刊</li>
            <li>接收范围：仔细阅读 Aim & Scope</li>
            <li>开放获取：考虑 OA 费用</li>
            <li>参考文献：多引用该期刊文章</li>
          </ul>
        </div>
      </div>

      <!-- 热电材料专用 -->
      <div v-if="activeCategory === 'thermoelectric'" class="guide-section">
        <h2>热电材料论文模板</h2>

        <div class="guide-card">
          <h3>🔬 Introduction 常用框架</h3>
          <div class="template-block">
            <p>1. 热电材料背景（能源危机、废热回收）</p>
            <p>2. 热电优值 ZT = S²σT/κ 的重要性</p>
            <p>3. 已有材料体系（Bi₂Te₃、PbTe、SnSe 等）</p>
            <p>4. 层状材料优势（各向异性、声子工程）</p>
            <p>5. 本研究创新点</p>
          </div>
        </div>

        <div class="guide-card">
          <h3>📊 Results 常见图表</h3>
          <ul class="tip-list">
            <li>XRD 图谱 + Rietveld 精修</li>
            <li>SEM/TEM 微观结构</li>
            <li>Seebeck 系数 vs 温度</li>
            <li>电导率 vs 温度</li>
            <li>热导率 vs 温度</li>
            <li>ZT 值 vs 温度</li>
            <li>性能对比图（vs 文献值）</li>
          </ul>
        </div>

        <div class="guide-card">
          <h3>💡 Discussion 常用分析角度</h3>
          <ul class="tip-list">
            <li>载流子浓度与迁移率平衡</li>
            <li>声子散射机制（点缺陷、晶界、层间）</li>
            <li>各向异性对性能的影响</li>
            <li>织构与热电性能的关系</li>
            <li>与类似材料体系的对比</li>
            <li>PFmax 或 ZTmax 的物理解释</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GuideView',
  data() {
    return {
      activeCategory: 'structure',
      categories: [
        { id: 'structure', name: '论文结构', icon: '📄' },
        { id: 'phrases', name: '常用句式', icon: '💬' },
        { id: 'tips', name: '写作技巧', icon: '💡' },
        { id: 'submission', name: '期刊投稿', icon: '📮' },
        { id: 'thermoelectric', name: '热电专用', icon: '🔬' },
      ],
      phraseGroups: [
        {
          title: '引言常用句式',
          icon: '📖',
          phrases: [
            { en: 'Recently, ... has attracted considerable attention due to...', cn: '近年来，... 因... 而受到广泛关注' },
            { en: 'However, the performance of ... is still limited by...', cn: '然而，... 的性能仍受限于...' },
            { en: 'Herein, we report a novel approach to...', cn: '本文报道了一种新的...方法' },
            { en: 'This work aims to address the challenge of...', cn: '本工作旨在解决...的挑战' },
            { en: 'To the best of our knowledge, this is the first report on...', cn: '据我们所知，这是首次关于...的报道' },
          ]
        },
        {
          title: '方法常用句式',
          icon: '🔧',
          phrases: [
            { en: 'The samples were prepared by...', cn: '样品通过...方法制备' },
            { en: 'The crystal structure was characterized using...', cn: '晶体结构通过...进行表征' },
            { en: 'The thermoelectric properties were measured by...', cn: '热电性能通过...测量' },
            { en: 'DFT calculations were performed using...', cn: 'DFT计算使用...进行' },
          ]
        },
        {
          title: '结果常用句式',
          icon: '📊',
          phrases: [
            { en: 'As shown in Fig. X, ...', cn: '如图X所示，...' },
            { en: 'The results indicate that...', cn: '结果表明...' },
            { en: 'Notably, the ... exhibits a remarkable ... of ...', cn: '值得注意的是，...表现出显著的...（值）' },
            { en: 'This can be attributed to...', cn: '这可归因于...' },
          ]
        },
        {
          title: '讨论常用句式',
          icon: '💬',
          phrases: [
            { en: 'The enhancement in ... can be explained by...', cn: '...的增强可以用...来解释' },
            { en: 'This is consistent with the previous report by ...', cn: '这与...之前的报道一致' },
            { en: 'The possible mechanism is proposed as follows...', cn: '可能的机理如下...' },
            { en: 'Despite the progress, several challenges remain...', cn: '尽管取得了进展，但仍存在一些挑战...' },
          ]
        },
        {
          title: '结论常用句式',
          icon: '✅',
          phrases: [
            { en: 'In summary, we have successfully...', cn: '总之，我们成功地...' },
            { en: 'The key findings of this work are...', cn: '本工作的主要发现是...' },
            { en: 'This work provides new insights into...', cn: '本工作为...提供了新的见解' },
            { en: 'Future work will focus on...', cn: '未来的工作将集中在...' },
          ]
        },
      ],
      tips: [
        {
          title: '语言表达',
          icon: '✍️',
          items: [
            '避免口语化表达，使用正式学术语言',
            '句子长度适中，避免过长复合句',
            '使用被动语态（"was measured"而非"I measured"）',
            '避免缩写（如 don\'t → do not）',
            '使用连接词保持逻辑流畅',
            '每个段落有明确的主题句',
          ]
        },
        {
          title: '图表规范',
          icon: '📈',
          items: [
            '图题和表题要简洁明了',
            '坐标轴标签包含单位',
            '字体大小统一，通常 8-12 pt',
            '分辨率至少 300 dpi',
            '颜色选择考虑色盲友好',
            '误差线和统计信息要标注',
          ]
        },
        {
          title: '逻辑结构',
          icon: '🧩',
          items: [
            '每段围绕一个核心观点',
            '段落间要有过渡句',
            '论证要有数据支撑',
            '避免重复表述',
            '引用要准确、相关',
            '结论要与引言呼应',
          ]
        },
        {
          title: '常见错误',
          icon: '⚠️',
          items: [
            '时态使用混乱（方法用过去时，普遍事实用现在时）',
            '主谓不一致',
            '冠词使用错误（a/an/the）',
            '参考文献格式不统一',
            '图表与正文描述不一致',
            '过度使用第一人称',
          ]
        },
      ],
      submissionChecklist: [
        { text: '论文标题简洁、准确、有吸引力', checked: false },
        { text: '摘要包含目的、方法、结果、结论', checked: false },
        { text: '关键词 4-6 个，覆盖主要内容', checked: false },
        { text: '引言逻辑清晰，研究空白明确', checked: false },
        { text: '方法描述完整，可重复', checked: false },
        { text: '图表清晰，坐标轴标签完整', checked: false },
        { text: '结果与讨论分开（或合理整合）', checked: false },
        { text: '结论回应引言，不过度推断', checked: false },
        { text: '参考文献格式符合期刊要求', checked: false },
        { text: '英文润色或语法检查', checked: false },
        { text: 'Cover letter 准备', checked: false },
        { text: '所有作者确认', checked: false },
      ],
    }
  }
}
</script>

<style scoped>
.guide-page {
  max-width: 900px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
}

.guide-nav {
  display: flex;
  gap: 8px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.guide-nav-btn {
  padding: 10px 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.guide-nav-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.guide-nav-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.guide-section h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.guide-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 20px;
}

.guide-card h3 {
  font-size: 16px;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.guide-card p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 8px;
}

/* 论文结构 */
.structure-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.structure-item {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: var(--bg-surface);
  border-radius: var(--radius);
}

.structure-name {
  font-weight: 600;
  color: var(--primary);
  min-width: 120px;
}

.structure-desc {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 常用句式 */
.phrase-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.phrase-item {
  padding: 12px;
  background: var(--bg-surface);
  border-radius: var(--radius);
}

.phrase-en {
  display: block;
  font-size: 14px;
  color: var(--text-primary);
  font-style: italic;
  margin-bottom: 4px;
}

.phrase-cn {
  display: block;
  font-size: 13px;
  color: var(--text-muted);
}

/* 技巧 */
.tip-list {
  list-style: none;
  padding: 0;
}

.tip-list li {
  padding: 8px 0;
  font-size: 14px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
}

.tip-list li:last-child {
  border-bottom: none;
}

.tip-list li::before {
  content: '•';
  color: var(--primary);
  margin-right: 8px;
}

/* 模板 */
.template-block {
  padding: 16px;
  background: var(--bg-surface);
  border-radius: var(--radius);
  border-left: 4px solid var(--primary);
}

.template-block p {
  margin-bottom: 8px;
  font-size: 14px;
}

/* 检查清单 */
.checklist {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
}

.checklist-item input {
  width: 18px;
  height: 18px;
  accent-color: var(--primary);
}

.checklist-item span {
  flex: 1;
}
</style>
