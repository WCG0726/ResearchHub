<template>
  <div class="links-page">
    <h1 class="page-title">学术导航</h1>

    <!-- 自定义链接区 -->
    <div class="card custom-section">
      <div class="custom-header">
        <h3 class="card-title" style="margin-bottom:0">⭐ 我的收藏</h3>
        <button class="btn btn-primary btn-sm" @click="showAdd = true">+ 添加链接</button>
      </div>
      <div v-if="customLinks.length" class="link-list">
        <div v-for="link in customLinks" :key="link.url" class="link-card custom">
          <a :href="link.url" target="_blank" rel="noopener noreferrer" class="link-main">
            <div class="link-name">{{ link.name }}</div>
            <div class="link-desc">{{ link.desc }}</div>
          </a>
          <button class="btn-del" @click="removeCustom(link.url)">×</button>
        </div>
      </div>
      <div v-else class="empty-hint">点击右上角添加你常用的学术网站</div>
    </div>

    <!-- 添加链接弹窗 -->
    <Teleport to="body">
      <div v-if="showAdd" class="modal-overlay" @click.self="showAdd = false">
        <div class="modal">
          <h3>添加自定义链接</h3>
          <div class="form-group">
            <label>名称</label>
            <input v-model="newName" type="text" placeholder="如：Google Scholar" />
          </div>
          <div class="form-group">
            <label>网址</label>
            <input v-model="newUrl" type="text" placeholder="https://..." />
          </div>
          <div class="form-group">
            <label>描述（可选）</label>
            <input v-model="newDesc" type="text" placeholder="简短描述" />
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showAdd = false">取消</button>
            <button class="btn-save" @click="addCustom">添加</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 内置链接 -->
    <div class="links-grid">
      <div v-for="group in linkGroups" :key="group.title" class="link-group">
        <h3 class="group-title">{{ group.icon }} {{ group.title }}</h3>
        <div class="link-list">
          <a
            v-for="link in group.links"
            :key="link.url"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="link-card"
          >
            <div class="link-name">{{ link.name }}</div>
            <div class="link-desc">{{ link.desc }}</div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const CUSTOM_KEY = 'research_hub_custom_links'

function getCustomLinks() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]')
  } catch { return [] }
}

export default {
  name: 'LinksView',
  data() {
    return {
      customLinks: getCustomLinks(),
      showAdd: false,
      newName: '',
      newUrl: '',
      newDesc: '',
      linkGroups: [
        {
          title: '文献检索', icon: '🔍',
          links: [
            { name: '玻尔学术', desc: '中文学术搜索与文献发现平台', url: 'https://bohr.cn' },
            { name: 'Google Scholar', desc: '谷歌学术，最全面的学术搜索引擎', url: 'https://scholar.google.com' },
            { name: '中国知网 (CNKI)', desc: '中文学术文献数据库', url: 'https://www.cnki.net' },
            { name: 'Web of Science', desc: 'SCI/SSCI 文献检索', url: 'https://www.webofscience.com' },
            { name: 'PubMed', desc: '生物医学文献数据库', url: 'https://pubmed.ncbi.nlm.nih.gov' },
            { name: 'Semantic Scholar', desc: 'AI 驱动的学术搜索', url: 'https://www.semanticscholar.org' },
            { name: 'Connected Papers', desc: '文献关系图谱可视化', url: 'https://www.connectedpapers.com' },
          ]
        },
        {
          title: '文献管理', icon: '📚',
          links: [
            { name: 'Zotero', desc: '免费开源文献管理工具', url: 'https://www.zotero.org' },
            { name: 'Mendeley', desc: 'Elsevier 旗下文献管理', url: 'https://www.mendeley.com' },
            { name: 'EndNote', desc: '专业文献管理软件', url: 'https://endnote.com' },
            { name: 'JabRef', desc: '开源 BibTeX 文献管理', url: 'https://www.jabref.org' },
          ]
        },
        {
          title: '论文写作', icon: '✏️',
          links: [
            { name: 'Overleaf', desc: '在线 LaTeX 编辑器', url: 'https://www.overleaf.com' },
            { name: 'Grammarly', desc: '英文语法检查工具', url: 'https://www.grammarly.com' },
            { name: 'Writefull', desc: '学术写作专用 AI 辅助', url: 'https://www.writefull.com' },
            { name: 'Academic Phrasebank', desc: '曼彻斯特大学学术句式库', url: 'https://www.phrasebank.manchester.ac.uk' },
            { name: 'QuillBot', desc: 'AI 改写和润色工具', url: 'https://quillbot.com' },
            { name: 'DeepL Write', desc: 'AI 写作辅助', url: 'https://www.deepl.com/write' },
          ]
        },
        {
          title: '翻译工具', icon: '🌐',
          links: [
            { name: 'DeepL 翻译', desc: '高质量 AI 翻译', url: 'https://www.deepl.com/translator' },
            { name: 'Google 翻译', desc: '谷歌翻译', url: 'https://translate.google.com' },
            { name: '有道翻译', desc: '网易有道翻译', url: 'https://fanyi.youdao.com' },
            { name: 'CNKI 翻译助手', desc: '学术专用翻译', url: 'https://dict.cnki.net' },
          ]
        },
        {
          title: '科研绘图', icon: '📊',
          links: [
            { name: 'Origin', desc: '科研数据绘图标准工具', url: 'https://www.originlab.com' },
            { name: 'GraphPad Prism', desc: '生物医学统计绘图', url: 'https://www.graphpad.com' },
            { name: 'matplotlib', desc: 'Python 科研绘图库', url: 'https://matplotlib.org' },
            { name: 'Inkscape', desc: '免费矢量图编辑器', url: 'https://inkscape.org' },
            { name: 'VESTA', desc: '晶体结构可视化', url: 'https://jp-minerals.org/vesta' },
            { name: 'Figdraw', desc: '科研绘图模板平台', url: 'https://www.figdraw.com' },
          ]
        },
        {
          title: 'AI 辅助科研', icon: '🤖',
          links: [
            { name: 'Claude', desc: 'Anthropic AI 助手', url: 'https://claude.ai' },
            { name: 'ChatGPT', desc: 'OpenAI 对话式 AI', url: 'https://chat.openai.com' },
            { name: 'Consensus', desc: 'AI 学术文献搜索', url: 'https://consensus.app' },
            { name: 'Elicit', desc: 'AI 文献分析工具', url: 'https://elicit.com' },
            { name: 'SciSpace', desc: 'AI 论文阅读助手', url: 'https://typeset.io' },
          ]
        },
        {
          title: '计算材料学', icon: '💻',
          links: [
            { name: 'VASP Wiki', desc: 'VASP 官方文档与教程', url: 'https://www.vasp.at/wiki/' },
            { name: 'VASP Manual', desc: 'VASP 官方手册', url: 'https://www.vasp.at/wiki/index.php/The_VASP_Manual' },
            { name: 'Materials Project', desc: '材料数据库，DFT 计算数据', url: 'https://materialsproject.org' },
            { name: 'AFLOW', desc: '自动计算材料数据库', url: 'https://aflow.org' },
            { name: 'OQMD', desc: '开放量子材料数据库', url: 'http://oqmd.org' },
            { name: 'phonopy', desc: '声子计算工具', url: 'https://phonopy.github.io/phonopy/' },
            { name: 'pymatgen', desc: 'Python 材料分析库', url: 'https://pymatgen.org' },
            { name: 'ASE', desc: '原子模拟环境', url: 'https://wiki.fysik.dtu.dk/ase/' },
            { name: 'VESTA', desc: '晶体结构可视化', url: 'https://jp-minerals.org/vesta/en/' },
            { name: 'Bilbao Crystallographic', desc: '晶体学数据库', url: 'https://www.cryst.ehu.es' },
          ]
        },
        {
          title: '仿真与模拟', icon: '🔬',
          links: [
            { name: 'COMSOL 官网', desc: '多物理场仿真软件', url: 'https://www.comsol.com' },
            { name: 'ANSYS 官网', desc: '工程仿真软件', url: 'https://www.ansys.com' },
            { name: 'LAMMPS', desc: '分子动力学模拟', url: 'https://www.lammps.org' },
            { name: 'GROMACS', desc: '生物分子动力学', url: 'https://www.gromacs.org' },
            { name: 'Quantum ESPRESSO', desc: '开源 DFT 计算', url: 'https://www.quantum-espresso.org' },
            { name: 'ABINIT', desc: '从头算材料模拟', url: 'https://www.abinit.org' },
          ]
        },
        {
          title: '预印本与社区', icon: '📖',
          links: [
            { name: 'arXiv', desc: '物理/数学/CS 预印本', url: 'https://arxiv.org' },
            { name: 'bioRxiv', desc: '生物学预印本', url: 'https://www.biorxiv.org' },
            { name: 'ResearchGate', desc: '学术社交网络', url: 'https://www.researchgate.net' },
            { name: 'GitHub', desc: '代码托管平台', url: 'https://github.com' },
            { name: '小木虫', desc: '国内学术论坛', url: 'http://muchong.com' },
            { name: '材料人', desc: '材料科学社区', url: 'https://www.cailiaoren.com' },
          ]
        },
        {
          title: '数据处理与可视化', icon: '📈',
          links: [
            { name: 'Origin', desc: '科研数据绘图标准工具', url: 'https://www.originlab.com' },
            { name: 'matplotlib', desc: 'Python 科研绘图库', url: 'https://matplotlib.org' },
            { name: 'Plotly', desc: '交互式绘图库', url: 'https://plotly.com' },
            { name: 'Gnuplot', desc: '命令行绘图工具', url: 'http://www.gnuplot.info' },
            { name: 'VMD', desc: '分子可视化', url: 'https://www.ks.uiuc.edu/Research/vmd/' },
            { name: 'ParaView', desc: '科学数据可视化', url: 'https://www.paraview.org' },
          ]
        },
        {
          title: '期刊与投稿', icon: '📮',
          links: [
            { name: 'Journal Finder (Elsevier)', desc: 'Elsevier 期刊推荐', url: 'https://journalfinder.elsevier.com' },
            { name: 'Journal Suggester (Springer)', desc: 'Springer 期刊推荐', url: 'https://journalsuggester.springer.com' },
            { name: 'LetPub', desc: 'SCI 期刊查询和投稿经验', url: 'https://www.letpub.com.cn' },
            { name: 'Journal Citation Reports', desc: '期刊影响因子查询', url: 'https://jcr.clarivate.com' },
            { name: '中科院分区表', desc: '期刊分区查询', url: 'https://www.fenqubiao.com' },
          ]
        }
      ]
    }
  },
  methods: {
    addCustom() {
      if (!this.newName || !this.newUrl) return
      const url = this.newUrl.startsWith('http') ? this.newUrl : 'https://' + this.newUrl
      this.customLinks.push({ name: this.newName, url, desc: this.newDesc || '' })
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(this.customLinks))
      this.newName = ''
      this.newUrl = ''
      this.newDesc = ''
      this.showAdd = false
    },
    removeCustom(url) {
      this.customLinks = this.customLinks.filter(l => l.url !== url)
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(this.customLinks))
    }
  }
}
</script>

<style scoped>
.links-page { max-width: 1000px; }

.custom-section { margin-bottom: 30px; }

.custom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.empty-hint {
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  padding: 20px;
}

.links-grid {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.group-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.link-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.link-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  text-decoration: none;
  transition: all 0.2s;
}

.link-card:hover {
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.link-card.custom { position: relative; }
.link-card.custom .link-main { flex: 1; text-decoration: none; color: inherit; }

.btn-del {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: var(--text-muted);
  font-size: 18px;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-del:hover { background: var(--danger); color: white; }

.link-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.link-desc {
  font-size: 13px;
  color: var(--text-secondary);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 24px;
  width: 400px;
  max-width: 90vw;
}

.modal h3 { margin: 0 0 20px; font-size: 18px; color: var(--text-primary); }

.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 4px; }
.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  box-sizing: border-box;
}

.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.btn-cancel {
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: none;
  color: var(--text-primary);
  cursor: pointer;
}
.btn-save {
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius);
  background: var(--primary);
  color: white;
  cursor: pointer;
  font-weight: 500;
}
</style>
