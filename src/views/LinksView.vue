<template>
  <div class="links-page">
    <h1 class="page-title">学术导航</h1>

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
export default {
  name: 'LinksView',
  data() {
    return {
      linkGroups: [
        {
          title: '文献检索', icon: '🔍',
          links: [
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
          title: '预印本与开源', icon: '📖',
          links: [
            { name: 'arXiv', desc: '物理/数学/CS 预印本', url: 'https://arxiv.org' },
            { name: 'bioRxiv', desc: '生物学预印本', url: 'https://www.biorxiv.org' },
            { name: 'ResearchGate', desc: '学术社交网络', url: 'https://www.researchgate.net' },
            { name: 'GitHub', desc: '代码托管平台', url: 'https://github.com' },
          ]
        },
        {
          title: '期刊与投稿', icon: '📮',
          links: [
            { name: 'Journal Finder (Elsevier)', desc: 'Elsevier 期刊推荐', url: 'https://journalfinder.elsevier.com' },
            { name: 'Journal Suggester (Springer)', desc: 'Springer 期刊推荐', url: 'https://journalsuggester.springer.com' },
            { name: 'LetPub', desc: 'SCI 期刊查询和投稿经验', url: 'https://www.letpub.com.cn' },
            { name: '小木虫', desc: '学术论坛和投稿经验', url: 'http://muchong.com' },
          ]
        }
      ]
    }
  }
}
</script>

<style scoped>
.links-page {
  max-width: 1000px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 30px;
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
  display: block;
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
</style>
