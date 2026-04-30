<template>
  <div class="plot-tips-page">
    <h1 class="page-title">绘图技巧与模板</h1>

    <div class="toolbar">
      <input v-model="search" class="input search-input" placeholder="搜索绘图技巧..." />
      <select v-model="filterCat" class="input filter-select">
        <option value="">全部分类</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>

    <div v-for="cat in displayCategories" :key="cat" class="category-section">
      <h2 class="cat-title" @click="toggleCat(cat)">
        <span class="cat-arrow" :class="{ open: openCats[cat] }">▶</span>
        {{ cat }}
        <span class="cat-count">{{ tipsByCat(cat).length }}</span>
      </h2>
      <div v-if="openCats[cat]" class="cat-body">
        <div v-for="tip in tipsByCat(cat)" :key="tip.title" class="card tip-card">
          <h3 class="tip-title">{{ tip.title }}</h3>
          <div class="tip-content" v-html="tip.content"></div>
          <div v-if="tip.tools" class="tip-tools">
            <span class="tools-label">推荐工具：</span>
            <span v-for="t in tip.tools" :key="t" class="tag tag-primary">{{ t }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义笔记 -->
    <div class="section-divider"></div>
    <h2 class="section-title">我的绘图笔记</h2>
    <div class="toolbar">
      <button class="btn btn-primary btn-sm" @click="showForm = true">+ 添加笔记</button>
    </div>
    <div v-if="showForm" class="card form-card">
      <div class="form-group">
        <label>标题</label>
        <input v-model="form.title" class="input" placeholder="如 Origin 画XRD图步骤" />
      </div>
      <div class="form-group">
        <label>内容</label>
        <textarea v-model="form.content" class="input textarea" rows="5" placeholder="记录你的绘图经验..."></textarea>
      </div>
      <div class="form-actions">
        <button class="btn btn-outline" @click="showForm = false">取消</button>
        <button class="btn btn-primary" @click="saveNote">保存</button>
      </div>
    </div>
    <div v-for="n in customNotes" :key="n.id" class="card tip-card">
      <div class="tip-header">
        <h3 class="tip-title">{{ n.title }}</h3>
        <button class="btn-icon" @click="removeNote(n.id)">🗑️</button>
      </div>
      <div class="tip-content"><p>{{ n.content }}</p></div>
      <div class="tip-time">{{ new Date(n.createdAt).toLocaleDateString('zh-CN') }}</div>
    </div>
  </div>
</template>

<script>
import { getStorage, setStorage } from '../utils/storage'

const TIPS = [
  {
    category: 'Origin 绘图',
    title: 'XRD 图谱绘制',
    content: `<p><strong>步骤：</strong></p>
<ol>
<li>导入数据：File → Import → ASCII，选择 .dat 或 .txt 文件</li>
<li>设置坐标轴：X轴为 2θ (°)，Y轴为 Intensity (a.u.)</li>
<li>多组数据偏移：选中曲线 → Plot → Offset，设置 Y 偏移量</li>
<li>添加 PDF 标准卡片对比：导入 JCPDS 数据叠加</li>
<li>标注峰位：Tools → Pick Peaks，自动标注特征峰</li>
</ol>
<p><strong>技巧：</strong>使用 Layer 管理多图层，上层放数据，下层放标注</p>`,
    tools: ['Origin', 'Jade', 'MDI']
  },
  {
    category: 'Origin 绘图',
    title: 'SEM/TEM 形貌图比例尺',
    content: `<p><strong>关键点：</strong></p>
<ul>
<li>从原始图片获取比例尺信息（通常在图片底部）</li>
<li>Origin 中：Image → Resize 设置实际尺寸</li>
<li>使用 Line + Text 工具手动添加比例尺标注</li>
<li>导出时分辨率 ≥ 300 dpi</li>
</ul>
<p><strong>注意：</strong>切勿拉伸图片导致比例失真</p>`,
    tools: ['Origin', 'ImageJ', 'Digital Micrograph']
  },
  {
    category: 'Origin 绘图',
    title: '热电性能 ZT 图',
    content: `<p><strong>标准格式：</strong></p>
<ul>
<li>X轴：Temperature (K)，Y轴：ZT</li>
<li>多组样品用不同颜色/标记区分</li>
<li>添加误差棒：Analysis → Error Bar</li>
<li>图例放在图内空白处，避免遮挡数据</li>
</ul>
<p><strong>进阶：</strong>用双Y轴同时展示 ZT 和 power factor</p>`,
    tools: ['Origin', 'Excel']
  },
  {
    category: 'Origin 绘图',
    title: 'Seebeck 系数 / 电阻率 / 热导率',
    content: `<p><strong>三合一图（常用）：</strong></p>
<ol>
<li>创建 3 行 1 列的 Graph Page（Graph → New → Multi-Layer）</li>
<li>从上到下依次：Seebeck (μV/K)、电阻率 (mΩ·cm)、热导率 (W/mK)</li>
<li>X轴共享：Temperature (K)</li>
<li>统一配色方案，保持风格一致</li>
</ol>
<p><strong>模板：</strong>保存为 .otp 模板文件，后续直接套用</p>`,
    tools: ['Origin']
  },
  {
    category: 'Python 绘图',
    title: 'Matplotlib 基础设置',
    content: `<p><strong>科研论文常用配置：</strong></p>
<pre><code>import matplotlib.pyplot as plt
plt.rcParams['font.family'] = 'Times New Roman'
plt.rcParams['font.size'] = 12
plt.rcParams['axes.linewidth'] = 1.5
plt.rcParams['xtick.major.width'] = 1.2
plt.rcParams['ytick.major.width'] = 1.2
plt.rcParams['figure.dpi'] = 300</code></pre>
<p><strong>导出：</strong>savefig 用 pdf 或 eps 矢量格式</p>`,
    tools: ['Python', 'Matplotlib']
  },
  {
    category: 'Python 绘图',
    title: '科研配色方案',
    content: `<p><strong>推荐配色库：</strong></p>
<ul>
<li><strong>colorcet</strong>：感知均匀色图，适合热图</li>
<li><strong>seaborn</strong>：内置多种学术风格配色</li>
<li><strong>cmocean</strong>：海洋/地球科学专用色图</li>
</ul>
<p><strong>经典组合（4组数据）：</strong></p>
<pre><code>colors = ['#E64B35', '#4DBBD5', '#00A087', '#3C5488']
# 或使用 Tableau 10 配色</code></pre>
<p><strong>避免：</strong>纯红纯绿（色盲不友好），rainbow 色图（感知不均匀）</p>`,
    tools: ['Python', 'Seaborn']
  },
  {
    category: 'Python 绘图',
    title: 'XRD 堆叠图 (Python)',
    content: `<pre><code>import numpy as np
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(8, 6))
offset = 0
for i, (name, data) in enumerate(datasets):
    ax.plot(data[:,0], data[:,1] + offset, label=name, lw=1.5)
    offset += max(data[:,1]) * 0.3

ax.set_xlabel('2θ (°)')
ax.set_ylabel('Intensity (a.u.)')
ax.legend()
plt.tight_layout()
plt.savefig('xrd_stacked.pdf')</code></pre>`,
    tools: ['Python', 'Matplotlib']
  },
  {
    category: 'PPT / 文档',
    title: '学术海报设计要点',
    content: `<ul>
<li><strong>尺寸：</strong>常用 A0 (841×1189mm) 或 36×48 inch</li>
<li><strong>字体：</strong>标题 72-96pt，正文 24-32pt，确保 2 米外可读</li>
<li><strong>布局：</strong>左→右 或 上→下 阅读动线</li>
<li><strong>配色：</strong>不超过 3-4 种主色，白色/浅灰背景</li>
<li><strong>图片：</strong>分辨率 ≥ 150 dpi（打印用）</li>
<li><strong>内容：</strong>Title → Introduction → Methods → Results → Conclusions → References</li>
</ul>`,
    tools: ['PowerPoint', 'Canva', 'LaTeX']
  },
  {
    category: 'PPT / 文档',
    title: '组会 PPT 模板结构',
    content: `<p><strong>推荐页面结构（15-20页）：</strong></p>
<ol>
<li>封面（题目、姓名、日期）</li>
<li>目录</li>
<li>背景/Introduction（2-3页）</li>
<li>实验方法（1-2页）</li>
<li>结果与讨论（6-8页）</li>
<li>下一步计划（1-2页）</li>
<li>致谢</li>
</ol>
<p><strong>技巧：</strong>每页一个核心观点，标题即结论</p>`,
    tools: ['PowerPoint', 'Keynote', 'Beamer']
  },
  {
    category: '图片处理',
    title: 'SCI 论文图片尺寸标准',
    content: `<p><strong>常见期刊要求：</strong></p>
<ul>
<li>单栏图：宽 8.5 cm（约 3.3 inch）</li>
<li>1.5栏图：宽 11.6 cm（约 4.5 inch）</li>
<li>双栏图：宽 17.6 cm（约 6.9 inch）</li>
<li>分辨率：线图 ≥ 600 dpi，照片 ≥ 300 dpi</li>
<li>格式：TIFF（位图）或 EPS/PDF（矢量图）</li>
</ul>
<p><strong>注意：</strong>提交前用 Acrobat 检查 PDF 中图片清晰度</p>`,
    tools: ['Photoshop', 'Illustrator', 'Inkscape']
  },
  {
    category: '图片处理',
    title: 'ImageJ 图片处理',
    content: `<p><strong>常用操作：</strong></p>
<ul>
<li>比例尺标定：Analyze → Set Scale</li>
<li>粒子统计：Analyze → Analyze Particles</li>
<li>FFT 滤波：Process → FFT → Bandpass Filter</li>
<li>亮度对比度：Image → Adjust → Brightness/Contrast</li>
<li>批量处理：Plugins → Macros → Record</li>
</ul>
<p><strong>注意：</strong>论文中不能对图片做影响数据解读的处理（如去除特定区域）</p>`,
    tools: ['ImageJ/Fiji']
  },
  {
    category: '图表规范',
    title: '论文图表 Checklist',
    content: `<p><strong>提交前检查清单：</strong></p>
<ul>
<li>☐ 坐标轴标签完整（变量名 + 单位）</li>
<li>☐ 图例清晰，不遮挡数据</li>
<li>☐ 字体大小 ≥ 8pt（缩小后仍可读）</li>
<li>☐ 颜色区分明确（考虑色盲读者）</li>
<li>☐ 误差棒标注说明（标准差/标准误）</li>
<li>☐ 分辨率符合期刊要求</li>
<li>☐ 图片编号与正文引用一致</li>
<li>☐ 所有缩写在图注中解释</li>
</ul>`,
    tools: []
  }
]

export default {
  name: 'PlotTipsView',
  data() {
    return {
      search: '',
      filterCat: '',
      openCats: {},
      customNotes: [],
      showForm: false,
      form: { title: '', content: '' }
    }
  },
  computed: {
    categories() { return [...new Set(TIPS.map(t => t.category))] },
    displayCategories() {
      let cats = this.categories
      if (this.filterCat) cats = cats.filter(c => c === this.filterCat)
      return cats
    }
  },
  methods: {
    tipsByCat(cat) {
      return TIPS.filter(t => {
        const matchCat = t.category === cat
        const matchSearch = !this.search || t.title.includes(this.search) || t.content.includes(this.search)
        return matchCat && matchSearch
      })
    },
    toggleCat(cat) { this.openCats = { ...this.openCats, [cat]: !this.openCats[cat] } },
    saveNote() {
      if (!this.form.title.trim()) return alert('请输入标题')
      const notes = getStorage('plot_notes', [])
      notes.unshift({ ...this.form, id: Date.now(), createdAt: new Date().toISOString() })
      setStorage('plot_notes', notes)
      this.customNotes = notes
      this.showForm = false
      this.form = { title: '', content: '' }
    },
    removeNote(id) {
      if (!confirm('确定删除？')) return
      const notes = getStorage('plot_notes', []).filter(n => n.id !== id)
      setStorage('plot_notes', notes)
      this.customNotes = notes
    }
  },
  mounted() {
    this.customNotes = getStorage('plot_notes', [])
    this.openCats = { 'Origin 绘图': true }
  }
}
</script>

<style scoped>
.plot-tips-page { max-width: 900px; }
.toolbar { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
.search-input { flex: 1; min-width: 200px; }
.filter-select { width: 130px; }
.category-section { margin-bottom: 20px; }
.cat-title { font-size: 16px; font-weight: 600; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 8px 0; user-select: none; }
.cat-title:hover { color: var(--primary); }
.cat-arrow { font-size: 12px; transition: transform 0.2s; display: inline-block; }
.cat-arrow.open { transform: rotate(90deg); }
.cat-count { font-size: 12px; color: var(--text-muted); font-weight: 400; }
.cat-body { display: flex; flex-direction: column; gap: 12px; }
.tip-card { padding: 18px; }
.tip-header { display: flex; justify-content: space-between; align-items: center; }
.tip-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin: 0 0 10px; }
.tip-content { font-size: 14px; line-height: 1.8; color: var(--text-primary); }
.tip-content :deep(ul), .tip-content :deep(ol) { padding-left: 20px; margin: 8px 0; }
.tip-content :deep(li) { margin-bottom: 4px; }
.tip-content :deep(pre) { background: var(--bg-surface); padding: 12px; border-radius: var(--radius); overflow-x: auto; font-size: 12px; margin: 8px 0; }
.tip-content :deep(code) { font-family: 'Consolas', monospace; font-size: 13px; }
.tip-tools { display: flex; align-items: center; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
.tools-label { font-size: 12px; color: var(--text-muted); }
.tip-time { font-size: 12px; color: var(--text-muted); margin-top: 8px; }
.section-divider { height: 1px; background: var(--border); margin: 30px 0 20px; }
.section-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
.form-card { margin-bottom: 16px; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; border-radius: 4px; }
.btn-icon:hover { background: var(--bg-hover); }
</style>
