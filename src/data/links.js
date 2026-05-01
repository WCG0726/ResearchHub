export const LINK_GROUPS = [
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
