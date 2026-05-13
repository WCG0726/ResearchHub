<template>
  <div class="plot-tips-page">
    <h1 class="page-title">绘图技巧与模板</h1>

    <!-- AI 绑图代码生成器 -->
    <div class="card ai-plot-card">
      <h3 class="card-title" @click="showAIPanel = !showAIPanel" style="cursor:pointer">
        🤖 AI 一键作图
        <span class="toggle-icon">{{ showAIPanel ? '▲' : '▼' }}</span>
      </h3>
      <div v-if="showAIPanel">
        <div class="ai-plot-form">
          <div class="form-group">
            <label>描述你想要的图表</label>
            <textarea v-model="plotDesc" class="input textarea" rows="3" placeholder="例如：画一个 SnSe、Bi2Te3、PbTe 三种材料的 XRD 叠加图，2theta 范围 20-60°"></textarea>
          </div>
          <div class="ai-plot-options">
            <div class="form-group">
              <label>输出语言</label>
              <select v-model="plotLang" class="input">
                <option value="python">Python (matplotlib)</option>
                <option value="origin">Origin (LabTalk)</option>
              </select>
            </div>
            <div class="form-group">
              <label>图表类型</label>
              <select v-model="plotType" class="input">
                <option value="auto">自动检测</option>
                <option value="line">折线图</option>
                <option value="scatter">散点图</option>
                <option value="bar">柱状图</option>
                <option value="heatmap">热力图</option>
                <option value="XRD">XRD 图谱</option>
                <option value="stress_strain">应力-应变曲线</option>
              </select>
            </div>
          </div>
          <button class="btn btn-primary" @click="generatePlot" :disabled="aiPlotLoading || !plotDesc.trim()">
            {{ aiPlotLoading ? '生成中...' : '生成代码' }}
          </button>
        </div>
        <div v-if="plotCode" class="ai-plot-result">
          <div class="result-header">
            <span>生成的代码</span>
            <button class="btn-icon" @click="copyPlotCode" title="复制">📋</button>
          </div>
          <pre class="code-block"><code>{{ plotCode }}</code></pre>
          <p class="ai-hint">提示：请检查代码后在相应环境中运行，AI 生成的代码可能需要微调</p>
        </div>
      </div>
    </div>

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

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getStorage, setStorage } from '../utils/storage'
import { isAIConfigured, generatePlotCode } from '../utils/ai'

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
  },
  {
    category: 'Python 绘图',
    title: '能带结构图 (Band Structure)',
    content: `<p><strong>VASP + pymatgen 流程：</strong></p>
<ol>
<li>用 pymatgen 解析 vasprun.xml 获取能带数据</li>
<li>设置高对称路径（KPOINTS）</li>
<li>绘图时标注费米能级为 0 eV</li>
</ol>
<pre><code>from pymatgen.electronic_structure.bandstructure import BandStructureSymmLine
from pymatgen.io.vasp.outputs import BSVasprun
run = BSVasprun("vasprun.xml")
bs = run.get_band_structure(line_mode=True)
# 用 matplotlib 绘制</code></pre>
<p><strong>技巧：</strong>用不同颜色区分 up/down spin，标注带隙值</p>`,
    tools: ['Python', 'pymatgen', 'Matplotlib']
  },
  {
    category: 'Python 绘图',
    title: '态密度图 (DOS)',
    content: `<p><strong>常见格式：</strong></p>
<ul>
<li>X轴：Energy (eV)，Y轴：DOS (states/eV)</li>
<li>总态密度（TDOS）+ 分波态密度（PDOS）</li>
<li>费米能级对齐到 0 eV</li>
</ul>
<pre><code>import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.fill_between(energy, dos, alpha=0.3)
ax.axvline(x=0, color='k', ls='--', lw=0.8)  # Fermi level
ax.set_xlabel('Energy (eV)')
ax.set_ylabel('DOS (states/eV)')</code></pre>
<p><strong>技巧：</strong>用 subplot 同时展示 TDOS 和各元素 PDOS</p>`,
    tools: ['Python', 'pymatgen', 'Matplotlib']
  },
  {
    category: 'Python 绘图',
    title: '声子谱图 (Phonon)',
    content: `<p><strong>phonopy 输出绘图：</strong></p>
<ul>
<li>X轴：高对称路径上的 q 点</li>
<li>Y轴：频率 Frequency (THz 或 cm⁻¹)</li>
<li>虚频用负值表示，标注声学支</li>
</ul>
<pre><code>import yaml
with open('band.yaml') as f:
    data = yaml.safe_load(f)
# 解析 q-points 和 frequencies，绘制色散关系</code></pre>
<p><strong>注意：</strong>虚频表示结构不稳定，需要优化</p>`,
    tools: ['Python', 'phonopy', 'Matplotlib']
  },
  {
    category: 'Python 绘图',
    title: '3D 晶体结构可视化',
    content: `<p><strong>推荐工具对比：</strong></p>
<table>
<tr><th>工具</th><th>特点</th><th>适用场景</th></tr>
<tr><td>VESTA</td><td>GUI 操作，效果好</td><td>快速查看，论文插图</td></tr>
<tr><td>ASE</td><td>Python 库，可编程</td><td>批量渲染，自动化</td></tr>
<tr><td>pymatgen</td><td>结构分析+绘图</td><td>结构分析流程</td></tr>
<tr><td>OVITO</td><td>MD 轨迹可视化</td><td>分子动力学</td></tr>
</table>
<p><strong>VESTA 技巧：</strong>调整 Bond Radius 和 Polyhedra 显示，导出 PNG 时设置高分辨率</p>`,
    tools: ['VESTA', 'ASE', 'pymatgen', 'OVITO']
  },
  {
    category: 'COMSOL 绘图',
    title: 'COMSOL 结果图导出',
    content: `<p><strong>导出高质量图片：</strong></p>
<ol>
<li>Results → 选中绘图 → 右键 → Image</li>
<li>设置分辨率：File → Preferences → Graphics → DPI</li>
<li>推荐格式：PNG (位图) 或 EPS (矢量)</li>
<li>去除背景网格：取消 Plot Settings → Grid</li>
</ol>
<p><strong>动画导出：</strong></p>
<ul>
<li>Player → 导出为 GIF 或 MP4</li>
<li>帧率 15-30 fps，分辨率 1080p</li>
</ul>`,
    tools: ['COMSOL']
  },
  {
    category: 'COMSOL 绘图',
    title: 'COMSOL 数据导出到 Origin',
    content: `<p><strong>步骤：</strong></p>
<ol>
<li>COMSOL: Results → Export → Data</li>
<li>选择格式：CSV 或 Text</li>
<li>设置导出的坐标范围和分辨率</li>
<li>Origin: File → Import → ASCII</li>
<li>设置列分隔符为逗号</li>
</ol>
<p><strong>技巧：</strong>用 Derived Values 先计算需要的物理量，再导出</p>`,
    tools: ['COMSOL', 'Origin']
  },
  {
    category: 'LaTeX 绘图',
    title: 'TikZ 学术图表示例',
    content: `<p><strong>用 TikZ 画简单示意图：</strong></p>
<pre><code>\\begin{tikzpicture}
  \\draw[->] (0,0) -- (4,0) node[right] {x};
  \\draw[->] (0,0) -- (0,3) node[above] {y};
  \\draw[domain=0:3.5, smooth, thick] plot (\\x, {0.5*\\x*\\x});
  \\node at (2, 2.5) {$y = \\frac{1}{2}x^2$};
\\end{tikzpicture}</code></pre>
<p><strong>常用包：</strong>tikz, pgfplots, standalone</p>
<p><strong>优势：</strong>矢量图，与论文字体一致，可版本控制</p>`,
    tools: ['LaTeX', 'TikZ', 'pgfplots']
  },
  {
    category: 'LaTeX 绘图',
    title: 'pgfplots 数据绘图',
    content: `<p><strong>直接从 CSV 绘图：</strong></p>
<pre><code>\\begin{axis}[
  xlabel={Temperature (K)},
  ylabel={ZT},
  legend pos=north west,
  grid=major
]
\\addplot table[x=temp, y=zt, col sep=comma]{data.csv};
\\addlegendentry{Sample A}
\\end{axis}</code></pre>
<p><strong>技巧：</strong>用 \\pgfplotstableset 设置数据格式，支持误差棒</p>`,
    tools: ['LaTeX', 'pgfplots']
  },
  {
    category: 'Python 绘图',
    title: 'Matplotlib 常用图表模板',
    content: `<p><strong>散点图 + 拟合线：</strong></p>
<pre><code>import numpy as np
import matplotlib.pyplot as plt
from numpy.polynomial.polynomial import polyfit

x, y = np.random.rand(2, 50)
b, m = polyfit(x, y, 1)
fig, ax = plt.subplots(figsize=(6, 4))
ax.scatter(x, y, c='#4DBBD5', s=40, alpha=0.7, edgecolors='k', lw=0.5)
ax.plot(x, b + m * x, 'r--', lw=1.5, label=f'y = {m:.2f}x + {b:.2f}')
ax.set_xlabel('X label', fontsize=12)
ax.set_ylabel('Y label', fontsize=12)
ax.legend()
plt.tight_layout()
plt.savefig('scatter.pdf', dpi=300)</code></pre>
<p><strong>柱状图（带误差棒）：</strong></p>
<pre><code>labels = ['A', 'B', 'C', 'D']
values = [2.3, 3.1, 1.8, 4.2]
errors = [0.2, 0.3, 0.15, 0.25]
fig, ax = plt.subplots(figsize=(6, 4))
ax.bar(labels, values, yerr=errors, capsize=5, color='#E64B35', edgecolor='k', lw=0.8)
ax.set_ylabel('ZT')
plt.tight_layout()</code></pre>`,
    tools: ['Python', 'Matplotlib']
  },
  {
    category: 'Graphical Abstract',
    title: 'Graphical Abstract 制作要点',
    content: `<p><strong>什么是 Graphical Abstract：</strong></p>
<ul>
<li>期刊要求的图片摘要，一图概括论文核心发现</li>
<li>尺寸通常 530 × 600 pixels（看期刊要求）</li>
</ul>
<p><strong>设计原则：</strong></p>
<ul>
<li><strong>简洁：</strong>只展示最核心的信息，避免文字过多</li>
<li><strong>视觉层次：</strong>用箭头、颜色引导阅读顺序</li>
<li><strong>配色：</strong>与论文配色一致，不超过 3-4 种颜色</li>
<li><strong>字体：</strong>清晰可读，最小 10pt</li>
<li><strong>背景：</strong>白色或浅色，避免花哨</li>
</ul>
<p><strong>制作工具：</strong></p>
<ul>
<li>PowerPoint（最常用，导出高分辨率 PNG）</li>
<li>Adobe Illustrator（专业矢量图）</li>
<li>Biorender（生物/化学领域模板丰富）</li>
<li>Canva（快速出图）</li>
</ul>
<p><strong>常见结构：</strong>左→右 或 上→下 流程图，展示"问题→方法→结果"</p>`,
    tools: ['PowerPoint', 'Illustrator', 'Biorender', 'Canva']
  },
  {
    category: '图表选择',
    title: '常见图表类型选择指南',
    content: `<p><strong>根据数据类型选择图表：</strong></p>
<table>
<tr><th>数据类型</th><th>推荐图表</th><th>适用场景</th></tr>
<tr><td>趋势变化</td><td>折线图</td><td>温度-性能曲线、时间序列</td></tr>
<tr><td>分类比较</td><td>柱状图</td><td>不同样品性能对比</td></tr>
<tr><td>分布关系</td><td>散点图</td><td>相关性分析、数据分布</td></tr>
<tr><td>占比构成</td><td>饼图/环形图</td><td>成分比例（谨慎使用）</td></tr>
<tr><td>多维数据</td><td>热图 (heatmap)</td><td>参数优化、矩阵数据</td></tr>
<tr><td>层级关系</td><td>堆叠柱状图</td><td>热导率分解（晶格+电子）</td></tr>
<tr><td>三维数据</td><td>等高线图/3D surface</td><td>相图、参数空间扫描</td></tr>
</table>
<p><strong>注意事项：</strong></p>
<ul>
<li>避免 3D 图（除非必要），2D 更清晰</li>
<li>饼图慎用，柱状图通常更清晰</li>
<li>双 Y 轴图容易误导，尽量避免</li>
<li>箱线图适合展示数据分布和离群值</li>
</ul>`,
    tools: ['Origin', 'Python', 'Excel']
  },
  {
    category: 'Origin 绘图',
    title: 'Origin 模板与批量绑图',
    content: `<p><strong>保存和使用模板：</strong></p>
<ol>
<li>做好一张满意的图后：File → Save Template As (.otp)</li>
<li>下次使用：File → New → Graph from Template</li>
<li>模板保存了坐标轴样式、配色、字体等所有设置</li>
</ol>
<p><strong>批量处理多个数据：</strong></p>
<ul>
<li>选中多个工作表 → Plot → Multi-Curve → 系列自动绑图</li>
<li>使用 Analysis → Batch Processing 批量分析</li>
<li>用 LabTalk 脚本自动化重复操作</li>
</ul>
<p><strong>Origin 快捷操作：</strong></p>
<ul>
<li>双击坐标轴 → 打开坐标轴设置</li>
<li>双击图例 → 编辑图例内容</li>
<li>Ctrl+T → 快速添加文本标注</li>
<li>右键曲线 → Properties → 修改样式</li>
</ul>
<p><strong>导出设置：</strong>File → Export Graph → 格式选 TIFF/EPS，分辨率 300+ dpi</p>`,
    tools: ['Origin']
  }
]

const search = ref('')
const filterCat = ref('')
const openCats = ref({})
const customNotes = ref([])
const showForm = ref(false)
const form = ref({ title: '', content: '' })
const showAIPanel = ref(isAIConfigured())
const plotDesc = ref('')
const plotLang = ref('python')
const plotType = ref('auto')
const plotCode = ref('')
const aiPlotLoading = ref(false)

const categories = computed(() => [...new Set(TIPS.map(t => t.category))])

const displayCategories = computed(() => {
  let cats = categories.value
  if (filterCat.value) cats = cats.filter(c => c === filterCat.value)
  return cats
})

function tipsByCat(cat) {
  return TIPS.filter(t => {
    const matchCat = t.category === cat
    const matchSearch = !search.value || t.title.includes(search.value) || t.content.includes(search.value)
    return matchCat && matchSearch
  })
}

function toggleCat(cat) {
  openCats.value = { ...openCats.value, [cat]: !openCats.value[cat] }
}

function saveNote() {
  if (!form.value.title.trim()) return alert('请输入标题')
  const notes = getStorage('plot_notes', [])
  notes.unshift({ ...form.value, id: Date.now(), createdAt: new Date().toISOString() })
  setStorage('plot_notes', notes)
  customNotes.value = notes
  showForm.value = false
  form.value = { title: '', content: '' }
}

function removeNote(id) {
  if (!confirm('确定删除？')) return
  const notes = getStorage('plot_notes', []).filter(n => n.id !== id)
  setStorage('plot_notes', notes)
  customNotes.value = notes
}

async function generatePlot() {
  aiPlotLoading.value = true
  plotCode.value = ''
  try {
    const raw = await generatePlotCode(plotDesc.value, plotType.value === 'auto' ? '' : plotType.value, '', plotLang.value)
    // 提取代码块内容
    const match = raw.match(/```(?:python|origin|labtalk)?\n?([\s\S]*?)```/)
    plotCode.value = match ? match[1].trim() : raw
  } catch (e) {
    plotCode.value = '生成失败: ' + e.message
  }
  aiPlotLoading.value = false
}

function copyPlotCode() {
  if (plotCode.value) navigator.clipboard.writeText(plotCode.value)
}

onMounted(() => {
  customNotes.value = getStorage('plot_notes', [])
  openCats.value = { 'Origin 绘图': true }
})
</script>

<style scoped>
.plot-tips-page { max-width: 900px; }
.toolbar { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }

.ai-plot-card { margin-bottom: 16px; }
.card-title { display: flex; align-items: center; gap: 8px; }
.toggle-icon { font-size: 12px; color: var(--text-muted); margin-left: auto; }
.ai-plot-form { margin-top: 12px; }
.ai-plot-options { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 4px; }
.ai-plot-result { margin-top: 16px; }
.result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; font-weight: 500; color: var(--text-secondary); }
.code-block {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
  max-height: 400px;
  color: var(--text-primary);
}
.ai-hint { font-size: 12px; color: var(--text-muted); margin-top: 8px; }
.btn { padding: 10px 32px; border: none; border-radius: var(--radius); font-size: 15px; font-weight: 500; cursor: pointer; }
.btn-primary { background: var(--primary); color: white; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-icon { background: none; border: none; font-size: 14px; cursor: pointer; padding: 4px; color: var(--text-muted); }
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
