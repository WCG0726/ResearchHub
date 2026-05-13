<template>
  <div class="guide-section">
    <h2>文献检索技巧</h2>

    <div class="guide-card">
      <h3>🔍 Google Scholar 高级搜索</h3>
      <div class="tip-block">
        <p class="tip-title">常用搜索语法</p>
        <div class="table-block">
          <table>
            <thead>
              <tr><th>语法</th><th>功能</th><th>示例</th></tr>
            </thead>
            <tbody>
              <tr><td>"..."</td><td>精确匹配短语</td><td>"thermoelectric performance"</td></tr>
              <tr><td>author:</td><td>按作者搜索</td><td>author:"J He"</td></tr>
              <tr><td>intitle:</td><td>标题包含关键词</td><td>intitle:thermoelectric ZT</td></tr>
              <tr><td>site:</td><td>限定网站</td><td>site:nature.com thermoelectric</td></tr>
              <tr><td>-</td><td>排除关键词</td><td>thermoelectric -bismuth</td></tr>
              <tr><td>OR</td><td>二选一</td><td>"Seebeck coefficient" OR "thermopower"</td></tr>
              <tr><td>*</td><td>通配符</td><td>"thermoelectric * materials"</td></tr>
            </tbody>
          </table>
        </div>
        <p class="tip-title">实用技巧</p>
        <ul class="tip-list">
          <li>点击"被引用次数"查看引用该文章的后续研究</li>
          <li>点击"相关文章"发现同领域文献</li>
          <li>设置"创建快讯"跟踪新文献（邮件提醒）</li>
          <li>使用"时间范围"筛选近 5 年文献</li>
          <li>点击 📥 图标获取免费 PDF（如果有）</li>
        </ul>
      </div>
    </div>

    <div class="guide-card">
      <h3>🔬 Web of Science / Scopus</h3>
      <div class="tip-block">
        <p class="tip-title">Web of Science 高级检索</p>
        <ul class="tip-list">
          <li><strong>TS=</strong> 主题检索（标题+摘要+关键词）</li>
          <li><strong>TI=</strong> 标题检索</li>
          <li><strong>AU=</strong> 作者检索</li>
          <li><strong>SO=</strong> 期刊名检索</li>
          <li>示例：TS=(thermoelectric AND "SnSe" AND ZT) AND PY=2020-2024</li>
        </ul>
        <p class="tip-title">引文分析功能</p>
        <ul class="tip-list">
          <li><strong>Cited References：</strong>查看该文章引用了哪些文献（追溯上游）</li>
          <li><strong>Times Cited：</strong>查看谁引用了该文章（追踪下游）</li>
          <li><strong>Related Records：</strong>找到引用相同文献的文章（同领域）</li>
          <li><strong>创建引文报告：</strong>分析 H-index、年引用趋势</li>
        </ul>
        <p class="tip-title">Scopus 特色</p>
        <ul class="tip-list">
          <li>覆盖范围更广（包含更多会议论文）</li>
          <li>作者档案页面展示完整的发表记录和引用统计</li>
          <li>SciVal 分析工具：机构/国家层面的科研产出分析</li>
        </ul>
      </div>
    </div>

    <div class="guide-card">
      <h3>📚 专业数据库</h3>
      <div class="table-block">
        <table>
          <thead>
            <tr><th>数据库</th><th>学科领域</th><th>特色</th></tr>
          </thead>
          <tbody>
            <tr><td>PubMed</td><td>生物医学</td><td>免费，MeSH 主题词检索</td></tr>
            <tr><td>IEEE Xplore</td><td>电子/计算机</td><td>IEEE 会议和期刊</td></tr>
            <tr><td>ACS Publications</td><td>化学</td><td>ACS 旗下期刊全文</td></tr>
            <tr><td>SpringerLink</td><td>综合</td><td>Springer 期刊和图书</td></tr>
            <tr><td>ScienceDirect</td><td>综合</td><td>Elsevier 期刊全文</td></tr>
            <tr><td>arXiv</td><td>物理/数学/CS</td><td>预印本，最新研究</td></tr>
            <tr><td>CNKI / 万方</td><td>中文学术</td><td>中文期刊和学位论文</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="guide-card">
      <h3>📋 文献管理最佳实践</h3>
      <div class="tip-block">
        <p class="tip-title">Zotero 使用技巧</p>
        <ul class="tip-list">
          <li>安装浏览器插件，一键抓取网页文献信息</li>
          <li>使用文件夹和标签分类管理文献</li>
          <li>利用"笔记"功能记录阅读心得</li>
          <li>使用 Zotero Connector 在线保存 PDF</li>
          <li>通过 Groups 功能与团队共享文献库</li>
        </ul>
        <p class="tip-title">文献阅读策略</p>
        <ul class="tip-list">
          <li><strong>第一遍：</strong>读标题、摘要、结论（5 分钟判断相关性）</li>
          <li><strong>第二遍：</strong>读图表和关键段落（15 分钟理解主要内容）</li>
          <li><strong>第三遍：</strong>精读方法和讨论（深入理解细节）</li>
          <li>建立文献笔记模板：研究问题 / 方法 / 关键发现 / 局限性 / 对我的启发</li>
        </ul>
      </div>
    </div>
  </div>
</template>
