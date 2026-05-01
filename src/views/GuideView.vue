<template>
  <div class="guide-page">
    <h1 class="page-title">科研论文写作指南</h1>

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

      <!-- ===== 1. 论文整体结构 ===== -->
      <div v-if="activeCategory === 'structure'" class="guide-section">
        <h2>英文论文结构</h2>

        <div class="guide-card">
          <h3>📄 Title（标题）</h3>
          <div class="tip-block">
            <p class="tip-title">原则</p>
            <ul class="tip-list">
              <li>简洁（通常 10-15 个词），包含核心关键词</li>
              <li>避免缩写、化学式（除非非常通用）、冒号</li>
              <li>体现研究对象 + 方法/发现</li>
            </ul>
            <p class="tip-title">常用结构</p>
            <div class="example-block">
              <p><strong>方法 + 对象：</strong>Enhanced Thermoelectric Performance of ... via ...</p>
              <p><strong>对象 + 发现：</strong>Ultra-high ZT in Layered ... Driven by ...</p>
              <p><strong>问题 + 方法：</strong>Achieving High ... in ... through ...</p>
            </div>
          </div>
        </div>

        <div class="guide-card">
          <h3>📄 Abstract（摘要）</h3>
          <div class="tip-block">
            <p class="tip-title">四段式结构（IMRD）</p>
            <div class="structure-list">
              <div class="structure-item">
                <span class="structure-idx">1</span>
                <div>
                  <span class="structure-name">Background（背景）</span>
                  <span class="structure-desc">1-2 句话，说明研究领域和重要性</span>
                </div>
              </div>
              <div class="structure-item">
                <span class="structure-idx">2</span>
                <div>
                  <span class="structure-name">Method / Approach（方法）</span>
                  <span class="structure-desc">做了什么，怎么做的</span>
                </div>
              </div>
              <div class="structure-item">
                <span class="structure-idx">3</span>
                <div>
                  <span class="structure-name">Results（结果）</span>
                  <span class="structure-desc">关键数据和发现（必须量化）</span>
                </div>
              </div>
              <div class="structure-item">
                <span class="structure-idx">4</span>
                <div>
                  <span class="structure-name">Conclusion（结论）</span>
                  <span class="structure-desc">意义和影响</span>
                </div>
              </div>
            </div>
            <p class="tip-title" style="margin-top:16px">注意事项</p>
            <ul class="tip-list">
              <li>字数：150-300 词（看期刊要求）</li>
              <li>不引用参考文献，不使用缩写（首次出现除外）</li>
              <li>用过去时描述自己的工作，现在时描述普遍事实</li>
              <li>包含具体数字（如 ZT = 1.5 at 773 K）</li>
            </ul>
          </div>
        </div>

        <div class="guide-card">
          <h3>📄 Introduction（引言）</h3>
          <div class="tip-block">
            <p class="tip-title">倒三角结构（Funnel Shape）</p>
            <div class="funnel">
              <div class="funnel-level level-1">大背景：领域重要性</div>
              <div class="funnel-level level-2">文献综述：已有工作和进展</div>
              <div class="funnel-level level-3">研究空白：尚未解决的问题</div>
              <div class="funnel-level level-4">本文工作：创新点和目标</div>
            </div>
            <p class="tip-title" style="margin-top:16px">每段开头常用句式</p>
            <ul class="tip-list">
              <li><em>Paragraph 1:</em> "Thermoelectric materials can directly convert ... into ..."</li>
              <li><em>Paragraph 2:</em> "Several strategies have been developed to ..."</li>
              <li><em>Paragraph 3:</em> "Despite these advances, ... remains a critical challenge."</li>
              <li><em>Paragraph 4:</em> "Herein, we report ... that achieves ..."</li>
            </ul>
          </div>
        </div>

        <div class="guide-card">
          <h3>📄 Methods（方法）</h3>
          <div class="tip-block">
            <p class="tip-title">写作要点</p>
            <ul class="tip-list">
              <li>使用过去时（"The samples were prepared..."）</li>
              <li>被动语态为主</li>
              <li>详细到他人可以重复实验</li>
              <li>按逻辑顺序组织（制备 → 表征 → 性能测试）</li>
              <li>商用试剂写明公司名和纯度</li>
              <li>仪器写明型号和参数</li>
            </ul>
            <p class="tip-title">常用模板</p>
            <div class="example-block">
              <p><strong>样品制备：</strong>"Polycrystalline samples of ... were synthesized by ..."</p>
              <p><strong>结构表征：</strong>"The crystal structure was characterized by X-ray diffraction (XRD, ...) using Cu Kα radiation (λ = ...)."</p>
              <p><strong>性能测量：</strong>"The electrical conductivity and Seebeck coefficient were simultaneously measured using ..." in the temperature range of ...</p>
            </div>
          </div>
        </div>

        <div class="guide-card">
          <h3>📄 Results（结果）</h3>
          <div class="tip-block">
            <p class="tip-title">写作要点</p>
            <ul class="tip-list">
              <li>只陈述事实，不做解释（解释在 Discussion）</li>
              <li>用图表支撑每个关键点</li>
              <li>按逻辑顺序组织（不是按实验顺序）</li>
              <li>突出关键数据，但不要过度解读</li>
            </ul>
            <p class="tip-title">常用句式</p>
            <div class="example-block">
              <p>"Fig. 1a shows the XRD patterns of ..."</p>
              <p>"As can be seen from Fig. 2, the electrical conductivity increases with temperature..."</p>
              <p>"Notably, the sample with x = 0.1 achieves a peak ZT of 1.5 at 773 K."</p>
              <p>"Compared with the pristine sample, the doped samples exhibit ..."</p>
            </div>
          </div>
        </div>

        <div class="guide-card">
          <h3>📄 Discussion（讨论）</h3>
          <div class="tip-block">
            <p class="tip-title">讨论的核心任务</p>
            <ul class="tip-list">
              <li><strong>解释</strong>结果的物理/化学意义</li>
              <li><strong>对比</strong>与文献报道的异同</li>
              <li><strong>分析</strong>机理（为什么会有这样的结果）</li>
              <li><strong>承认</strong>局限性和不足</li>
            </ul>
            <p class="tip-title">常用句式</p>
            <div class="example-block">
              <p>"The enhancement in ... can be attributed to ..."</p>
              <p>"This is in contrast to the report by Smith et al., who observed ..."</p>
              <p>"The underlying mechanism can be understood as follows: ..."</p>
              <p>"A possible explanation for this phenomenon is ..."</p>
              <p>"It should be noted that ... limits the performance at high temperatures."</p>
            </div>
          </div>
        </div>

        <div class="guide-card">
          <h3>📄 Conclusion（结论）</h3>
          <div class="tip-block">
            <p class="tip-title">写作要点</p>
            <ul class="tip-list">
              <li>简洁（通常 1 段，100-200 词）</li>
              <li>总结主要发现（不要重复数据）</li>
              <li>强调创新点和意义</li>
              <li>可以提未来研究方向</li>
              <li><strong>不要</strong>引入新信息或新数据</li>
            </ul>
            <div class="example-block">
              <p>"In conclusion, we have successfully developed a novel ... strategy to enhance the thermoelectric performance of ... The optimized sample achieves a peak ZT of ... at ... K, which is among the highest reported values for ... This work provides new insights into ... and opens up opportunities for ..."</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 2. 英文写作规范 ===== -->
      <div v-if="activeCategory === 'english'" class="guide-section">
        <h2>英文写作规范</h2>

        <div class="guide-card">
          <h3>✍️ 时态使用</h3>
          <div class="table-block">
            <table>
              <thead>
                <tr><th>部分</th><th>时态</th><th>例句</th></tr>
              </thead>
              <tbody>
                <tr><td>Abstract（描述自己的工作）</td><td>过去时</td><td>"We <strong>synthesized</strong> ... samples"</td></tr>
                <tr><td>Introduction（普遍事实）</td><td>现在时</td><td>"Thermoelectric materials <strong>can</strong> convert ..."</td></tr>
                <tr><td>Introduction（前人工作）</td><td>现在完成时 / 过去时</td><td>"Several studies <strong>have investigated</strong>..."</td></tr>
                <tr><td>Methods</td><td>过去时</td><td>"The samples <strong>were prepared</strong> by ..."</td></tr>
                <tr><td>Results</td><td>过去时</td><td>"Fig. 1 <strong>shows</strong>..."（图表用现在时）</td></tr>
                <tr><td>Discussion（解释）</td><td>现在时</td><td>"This <strong>can be attributed</strong> to ..."</td></tr>
                <tr><td>Conclusion</td><td>过去时 / 现在时</td><td>"We <strong>have demonstrated</strong>..."</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="guide-card">
          <h3>✍️ 语态选择</h3>
          <div class="tip-block">
            <ul class="tip-list">
              <li><strong>被动语态为主</strong>：Methods 和 Results 中优先使用</li>
              <li><strong>主动语态</strong>：引言和讨论中可以使用 "we"（看期刊偏好）</li>
              <li><strong>避免</strong>："I think" → "It is suggested that..."</li>
              <li><strong>避免</strong>："We did an experiment" → "An experiment was conducted"</li>
            </ul>
          </div>
        </div>

        <div class="guide-card">
          <h3>✍️ 冠词使用（a/an/the）</h3>
          <div class="tip-block">
            <ul class="tip-list">
              <li><strong>a/an</strong>：泛指首次提到的可数名词（"a novel method"）</li>
              <li><strong>the</strong>：特指（"the sample prepared at 500°C"）</li>
              <li><strong>the</strong>：独一无二的事物（"the Earth"）</li>
              <li><strong>the</strong>：最高级前（"the highest ZT"）</li>
              <li><strong>零冠词</strong>：不可数名词泛指时（"electricity"）</li>
              <li><strong>复数泛指</strong>：不用冠词（"Thermoelectric materials are ..."）</li>
            </ul>
            <div class="example-block">
              <p>❌ "A thermoelectric material is useful" → ✅ "Thermoelectric materials are useful"</p>
              <p>❌ "We measured the electrical conductivity" → ✅ "We measured electrical conductivity"</p>
              <p>✅ "The electrical conductivity of the sample"（特指）</p>
            </div>
          </div>
        </div>

        <div class="guide-card">
          <h3>✍️ 常见语法错误</h3>
          <div class="error-list">
            <div class="error-item">
              <div class="error-wrong">❌ "The results shows that..."</div>
              <div class="error-right">✅ "The results <strong>show</strong> that..."</div>
              <div class="error-note">主谓一致：复数主语 + 复数动词</div>
            </div>
            <div class="error-item">
              <div class="error-wrong">❌ "In order to improve the performance, ..."</div>
              <div class="error-right">✅ "To improve the performance, ..."</div>
              <div class="error-note">简洁：去掉 "in order"</div>
            </div>
            <div class="error-item">
              <div class="error-wrong">❌ "This is due to that ..."</div>
              <div class="error-right">✅ "This is due to the fact that ..." / "This is because ..."</div>
              <div class="error-note">"due to" 后面不能直接跟从句</div>
            </div>
            <div class="error-item">
              <div class="error-wrong">❌ "More and more researchers pay attention to ..."</div>
              <div class="error-right">✅ "Increasing attention has been paid to ..." / "There is growing interest in ..."</div>
              <div class="error-note">学术英语偏好被动/名词化表达</div>
            </div>
            <div class="error-item">
              <div class="error-wrong">❌ "The XRD pattern is shown in Fig. 1."</div>
              <div class="error-right">✅ "Fig. 1 shows the XRD pattern." / "The XRD pattern is presented in Fig. 1."</div>
              <div class="error-note">图引用：主动态更优</div>
            </div>
            <div class="error-item">
              <div class="error-wrong">❌ "It can be seen that the conductivity is high."</div>
              <div class="error-right">✅ "The conductivity is notably high." / 直接陈述事实</div>
              <div class="error-note">避免冗余的 "it can be seen that"</div>
            </div>
          </div>
        </div>

        <div class="guide-card">
          <h3>✍️ 学术写作连接词</h3>
          <div class="table-block">
            <table>
              <thead>
                <tr><th>功能</th><th>连接词</th></tr>
              </thead>
              <tbody>
                <tr><td>添加信息</td><td>Furthermore, Moreover, In addition, Additionally</td></tr>
                <tr><td>对比转折</td><td>However, Nevertheless, In contrast, On the other hand</td></tr>
                <tr><td>因果关系</td><td>Therefore, Thus, Hence, As a result, Consequently</td></tr>
                <tr><td>举例说明</td><td>For example, For instance, Such as, Specifically</td></tr>
                <tr><td>强调</td><td>Notably, Importantly, In particular, Indeed</td></tr>
                <tr><td>总结</td><td>In summary, In conclusion, To summarize, Overall</td></tr>
                <tr><td>顺序</td><td>Firstly, Secondly, Subsequently, Finally</td></tr>
                <tr><td>让步</td><td>Although, Despite, Even though, While</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ===== 3. 常用句式库 ===== -->
      <div v-if="activeCategory === 'phrases'" class="guide-section">
        <h2>学术句式库</h2>

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

      <!-- ===== 4. 图表与参考文献 ===== -->
      <div v-if="activeCategory === 'figures'" class="guide-section">
        <h2>图表与参考文献</h2>

        <div class="guide-card">
          <h3>📈 图（Figures）规范</h3>
          <div class="tip-block">
            <p class="tip-title">分辨率要求</p>
            <ul class="tip-list">
              <li>线条图：≥ 600 dpi</li>
              <li>灰度图：≥ 1200 dpi</li>
              <li>彩色/半色调图：≥ 300 dpi</li>
            </ul>
            <p class="tip-title">格式要求</p>
            <ul class="tip-list">
              <li>推荐格式：TIFF、EPS、PDF、PNG</li>
              <li>字体：Arial 或 Helvetica，8-12 pt</li>
              <li>线宽：≥ 0.5 pt（通常 1-2 pt）</li>
              <li>颜色：考虑色盲友好（推荐 ColorBrewer 配色）</li>
            </ul>
            <p class="tip-title">图题格式</p>
            <div class="example-block">
              <p>"<strong>Figure 1.</strong> (a) XRD patterns of ... (b) Temperature-dependent electrical conductivity."</p>
              <p>"<strong>Fig. 2.</strong> SEM images of the samples prepared at (a) 400°C, (b) 500°C, and (c) 600°C."</p>
            </div>
          </div>
        </div>

        <div class="guide-card">
          <h3>📊 表（Tables）规范</h3>
          <div class="tip-block">
            <ul class="tip-list">
              <li>使用三线表（顶线、栏目线、底线）</li>
              <li>表题在表格上方</li>
              <li>表注在表格下方</li>
              <li>数值对齐，保留适当有效数字</li>
              <li>单位放在栏目名后，用括号括起</li>
            </ul>
            <div class="example-block">
              <p>"<strong>Table 1.</strong> Thermoelectric properties of the ... samples at 773 K."</p>
            </div>
          </div>
        </div>

        <div class="guide-card">
          <h3>📚 参考文献格式</h3>
          <div class="tip-block">
            <p class="tip-title">常用引用格式</p>
            <ul class="tip-list">
              <li><strong>ACS（美国化学会）：</strong>上标数字 [1] 或作者-年 (Smith, 2020)</li>
              <li><strong>Nature：</strong>上标数字</li>
              <li><strong>Elsevier：</strong>方括号 [1]（大多数期刊）</li>
              <li><strong>IEEE：</strong>方括号 [1]</li>
            </ul>
            <p class="tip-title">推荐工具</p>
            <ul class="tip-list">
              <li>Zotero（免费，推荐）</li>
              <li>EndNote（学校通常提供）</li>
              <li>Mendeley（Elsevier 旗下）</li>
            </ul>
            <p class="tip-title">引用注意事项</p>
            <ul class="tip-list">
              <li>避免引用过多自己的文章（自引率 < 20%）</li>
              <li>引用最新文献（近 5 年为主）</li>
              <li>引用目标期刊的相关文章</li>
              <li>确保所有引用在正文中出现，反之亦然</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- ===== 5. 投稿与回复 ===== -->
      <div v-if="activeCategory === 'submission'" class="guide-section">
        <h2>投稿与回复</h2>

        <div class="guide-card">
          <h3>📮 Cover Letter 模板</h3>
          <div class="template-block">
            <p>Dear Editor,</p>
            <p>We would like to submit our manuscript entitled "[Title]" for consideration for publication in [Journal Name].</p>
            <p><strong>[第一段：研究背景和重要性]</strong></p>
            <p>[Topic] has attracted great attention due to ... However, ... remains a challenge.</p>
            <p><strong>[第二段：本文工作和主要发现]</strong></p>
            <p>In this work, we report ... The key findings include: (1) ... (2) ... (3) ...</p>
            <p><strong>[第三段：为什么适合本期刊]</strong></p>
            <p>We believe this work is of great interest to the readers of [Journal Name] because ...</p>
            <p>We confirm that this manuscript has not been published elsewhere and is not under consideration by another journal. All authors have approved the manuscript and agree with its submission to [Journal Name].</p>
            <p>Thank you for your consideration.</p>
            <p>Sincerely,<br/>[Corresponding Author]</p>
          </div>
        </div>

        <div class="guide-card">
          <h3>💬 Response to Reviewers</h3>
          <div class="tip-block">
            <p class="tip-title">回复原则</p>
            <ul class="tip-list">
              <li>逐条回复，不要遗漏任何意见</li>
              <li>先感谢，再解释或修改</li>
              <li>语气礼貌、专业</li>
              <li>指出修改的位置（页码、行号）</li>
              <li>不同意的意见要礼貌地解释理由</li>
            </ul>
            <p class="tip-title">常用回复句式</p>
            <div class="example-block">
              <p><strong>感谢：</strong>"We sincerely thank the reviewer for the constructive comments."</p>
              <p><strong>同意并修改：</strong>"We agree with the reviewer's suggestion. We have revised the manuscript accordingly (see Page X, Line Y)."</p>
              <p><strong>补充实验：</strong>"Following the reviewer's suggestion, we have performed additional experiments ... The results are shown in Fig. X."</p>
              <p><strong>礼貌不同意：</strong>"We appreciate the reviewer's comment. However, we respectfully point out that ... Therefore, we have not modified this section."</p>
            </div>
          </div>
        </div>

        <div class="guide-card">
          <h3>📋 投稿前检查清单</h3>
          <div class="checklist">
            <label v-for="(item, idx) in submissionChecklist" :key="idx" class="checklist-item">
              <input type="checkbox" v-model="item.checked" />
              <span>{{ item.text }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- ===== 6. 热电材料专用 ===== -->
      <div v-if="activeCategory === 'thermoelectric'" class="guide-section">
        <h2>热电材料论文专用</h2>

        <div class="guide-card">
          <h3>🔬 Introduction 写作框架</h3>
          <div class="template-block">
            <p><strong>第 1 段（背景）：</strong></p>
            <p>• 能源危机 / 废热回收的重要性</p>
            <p>• 热电效应简介：Seebeck 效应、Peltier 效应</p>
            <p>• 热电优值 ZT = S²σT/κ（公式说明各参数）</p>
            <p><strong>第 2 段（文献综述）：</strong></p>
            <p>• 已有材料体系：Bi₂Te₃、PbTe、SnSe、Half-Heusler 等</p>
            <p>• 提升 ZT 的策略：能带工程、声子工程、能量过滤等</p>
            <p>• 重点关注层状材料的优势</p>
            <p><strong>第 3 段（研究空白）：</strong></p>
            <p>• 现有材料的局限性</p>
            <p>• 尚未解决的关键问题</p>
            <p><strong>第 4 段（本文工作）：</strong></p>
            <p>• 研究目标</p>
            <p>• 方法概述</p>
            <p>• 主要发现</p>
          </div>
        </div>

        <div class="guide-card">
          <h3>📊 Results 常见图表</h3>
          <div class="table-block">
            <table>
              <thead>
                <tr><th>图/表</th><th>内容</th><th>关键信息</th></tr>
              </thead>
              <tbody>
                <tr><td>Fig. 1</td><td>XRD 图谱</td><td>相纯度、晶格参数</td></tr>
                <tr><td>Fig. 2</td><td>SEM/TEM 微观结构</td><td>晶粒尺寸、形貌、元素分布</td></tr>
                <tr><td>Fig. 3</td><td>电导率 σ vs 温度</td><td>金属/半导体行为、各向异性</td></tr>
                <tr><td>Fig. 4</td><td>Seebeck 系数 S vs 温度</td><td>n/p 型、载流子浓度</td></tr>
                <tr><td>Fig. 5</td><td>功率因子 PF vs 温度</td><td>最大值</td></tr>
                <tr><td>Fig. 6</td><td>热导率 κ vs 温度</td><td>晶格/电子贡献</td></tr>
                <tr><td>Fig. 7</td><td>ZT 值 vs 温度</td><td>最大值及对应温度</td></tr>
                <tr><td>Fig. 8</td><td>性能对比</td><td>与文献值对比</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="guide-card">
          <h3>💬 Discussion 常用分析角度</h3>
          <div class="tip-block">
            <ul class="tip-list">
              <li><strong>电学性能：</strong>载流子浓度 vs 迁移率平衡、有效质量、能带结构</li>
              <li><strong>热学性能：</strong>声子散射机制（点缺陷、晶界、层间散射）、Callaway 模型</li>
              <li><strong>各向异性：</strong>层内 vs 层间传输差异</li>
              <li><strong>织构效应：</strong>取向因子、极图分析</li>
              <li><strong>微观结构：</strong>晶界、缺陷、第二相对性能的影响</li>
              <li><strong>性能优化：</strong>多尺度调控策略的协同效应</li>
            </ul>
            <p class="tip-title" style="margin-top:16px">常用句式</p>
            <div class="example-block">
              <p>"The enhancement in electrical conductivity can be attributed to the increased carrier concentration, as evidenced by the Hall coefficient measurements."</p>
              <p>"The reduction in lattice thermal conductivity is primarily due to the enhanced phonon scattering at grain boundaries and point defects."</p>
              <p>"The anisotropic thermoelectric properties can be understood from the layered crystal structure, where the in-plane transport is superior to the out-of-plane direction."</p>
            </div>
          </div>
        </div>

        <div class="guide-card">
          <h3>📖 常用术语对照</h3>
          <div class="table-block">
            <table>
              <thead>
                <tr><th>中文</th><th>English</th></tr>
              </thead>
              <tbody>
                <tr><td>热电优值</td><td>thermoelectric figure of merit (ZT)</td></tr>
                <tr><td>Seebeck 系数</td><td>Seebeck coefficient</td></tr>
                <tr><td>电导率</td><td>electrical conductivity</td></tr>
                <tr><td>热导率</td><td>thermal conductivity</td></tr>
                <tr><td>功率因子</td><td>power factor (PF = S²σ)</td></tr>
                <tr><td>晶格热导率</td><td>lattice thermal conductivity</td></tr>
                <tr><td>载流子浓度</td><td>carrier concentration</td></tr>
                <tr><td>迁移率</td><td>mobility</td></tr>
                <tr><td>费米能级</td><td>Fermi level</td></tr>
                <tr><td>有效质量</td><td>effective mass</td></tr>
                <tr><td>声子散射</td><td>phonon scattering</td></tr>
                <tr><td>各向异性</td><td>anisotropy</td></tr>
                <tr><td>层状结构</td><td>layered structure</td></tr>
                <tr><td>织构</td><td>texture</td></tr>
                <tr><td>晶界</td><td>grain boundary</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ===== 7. 中文论文写作 ===== -->
      <div v-if="activeCategory === 'chinese'" class="guide-section">
        <h2>中文论文写作指南</h2>

        <div class="guide-card">
          <h3>📄 中文论文结构</h3>
          <div class="tip-block">
            <p class="tip-title">标准结构</p>
            <div class="structure-list">
              <div class="structure-item">
                <span class="structure-idx">1</span>
                <div>
                  <span class="structure-name">题目</span>
                  <span class="structure-desc">简洁、准确，一般不超过 20 个字，避免使用缩写</span>
                </div>
              </div>
              <div class="structure-item">
                <span class="structure-idx">2</span>
                <div>
                  <span class="structure-name">摘要</span>
                  <span class="structure-desc">目的、方法、结果、结论四要素，200-300 字</span>
                </div>
              </div>
              <div class="structure-item">
                <span class="structure-idx">3</span>
                <div>
                  <span class="structure-name">关键词</span>
                  <span class="structure-desc">3-8 个，按学科体系排列，避免与题目重复</span>
                </div>
              </div>
              <div class="structure-item">
                <span class="structure-idx">4</span>
                <div>
                  <span class="structure-name">引言</span>
                  <span class="structure-desc">研究背景、文献综述、研究目的和意义</span>
                </div>
              </div>
              <div class="structure-item">
                <span class="structure-idx">5</span>
                <div>
                  <span class="structure-name">正文</span>
                  <span class="structure-desc">实验方法、结果与讨论（可合并或分开）</span>
                </div>
              </div>
              <div class="structure-item">
                <span class="structure-idx">6</span>
                <div>
                  <span class="structure-name">结论</span>
                  <span class="structure-desc">总结主要发现，不引入新内容</span>
                </div>
              </div>
              <div class="structure-item">
                <span class="structure-idx">7</span>
                <div>
                  <span class="structure-name">参考文献</span>
                  <span class="structure-desc">格式统一，近 5 年文献为主</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="guide-card">
          <h3>✍️ 中文摘要写作</h3>
          <div class="tip-block">
            <p class="tip-title">四要素结构</p>
            <ul class="tip-list">
              <li><strong>目的：</strong>用 1-2 句话说明研究的背景和目的</li>
              <li><strong>方法：</strong>简要描述实验方法、材料和手段</li>
              <li><strong>结果：</strong>列出关键数据和主要发现（必须有具体数字）</li>
              <li><strong>结论：</strong>总结研究意义和应用前景</li>
            </ul>
            <p class="tip-title">常见问题</p>
            <ul class="tip-list">
              <li>避免在摘要中引用参考文献</li>
              <li>不要使用"本文""本研究"等主语开头（看期刊要求）</li>
              <li>避免出现公式和化学式</li>
              <li>不要重复题目中已有的信息</li>
            </ul>
            <p class="tip-title">示例模板</p>
            <div class="example-block">
              <p>为了解决……问题，采用……方法，制备了……样品。通过……表征手段，研究了……性能。结果表明：（1）……；（2）……；（3）……。该研究为……提供了新的思路/途径。</p>
            </div>
          </div>
        </div>

        <div class="guide-card">
          <h3>📝 中文标点与格式规范</h3>
          <div class="tip-block">
            <p class="tip-title">标点符号</p>
            <ul class="tip-list">
              <li>使用中文全角标点（，。；：？！）</li>
              <li>数字与中文之间加空格（如"温度为 773 K"）</li>
              <li>英文单词与中文之间加空格（如"采用 XRD 表征"）</li>
              <li>百分号用中文"%"或"百分之"（看期刊要求）</li>
              <li>并列成分之间用顿号"、"</li>
            </ul>
            <p class="tip-title">数字使用</p>
            <ul class="tip-list">
              <li>统计数据、实验数据用阿拉伯数字</li>
              <li>概数用中文数字（如"十几个""三五天"）</li>
              <li>编号用阿拉伯数字（如"图 1""表 2"）</li>
              <li>小数点用实心圆点"."</li>
            </ul>
            <p class="tip-title">单位规范</p>
            <ul class="tip-list">
              <li>使用国际单位制（SI）</li>
              <li>单位与数字之间加空格（如"25 °C""100 MPa"）</li>
              <li>组合单位用斜线或负指数（如"W/(m·K)"或"W·m⁻¹·K⁻¹"）</li>
            </ul>
          </div>
        </div>

        <div class="guide-card">
          <h3>📊 图表规范（中文）</h3>
          <div class="tip-block">
            <p class="tip-title">图的规范</p>
            <ul class="tip-list">
              <li>图题在图的下方，序号用"图 1""图 2"</li>
              <li>坐标轴标注中文名称和单位，如"温度/°C""电导率/(S·cm⁻¹)"</li>
              <li>图中文字用宋体或黑体，大小与正文协调</li>
              <li>多图用(a)(b)(c)标注，图题中说明</li>
            </ul>
            <p class="tip-title">表的规范</p>
            <ul class="tip-list">
              <li>表题在表的上方</li>
              <li>使用三线表（顶线、栏目线、底线）</li>
              <li>表注在表的下方</li>
              <li>数值对齐，保留一致的有效数字</li>
            </ul>
            <p class="tip-title">引用格式</p>
            <div class="example-block">
              <p>如图 1 所示，……</p>
              <p>从表 2 可以看出，……</p>
              <p>实验结果（见图 3）表明，……</p>
            </div>
          </div>
        </div>

        <div class="guide-card">
          <h3>📚 参考文献格式（中文期刊）</h3>
          <div class="tip-block">
            <p class="tip-title">GB/T 7714 格式（国标）</p>
            <div class="example-block">
              <p><strong>期刊：</strong>[序号] 作者. 题名[J]. 刊名, 年, 卷(期): 页码.</p>
              <p>例：[1] 张三, 李四. 热电材料研究进展[J]. 材料科学, 2024, 50(3): 123-130.</p>
              <p><strong>专著：</strong>[序号] 作者. 书名[M]. 出版地: 出版社, 年: 页码.</p>
              <p><strong>学位论文：</strong>[序号] 作者. 题名[D]. 学校所在地: 学校名, 年.</p>
              <p><strong>会议论文：</strong>[序号] 作者. 题名[C]//会议名. 地点: 出版者, 年: 页码.</p>
            </div>
            <p class="tip-title">作者姓名格式</p>
            <ul class="tip-list">
              <li>中文作者：全名，多作者用逗号分隔，超过 3 人写前 3 人加"等"</li>
              <li>英文作者：姓在前名在后（大写），如 SMITH J K</li>
              <li>超过 3 人：写前 3 人加", et al"或"，等"</li>
            </ul>
          </div>
        </div>

        <div class="guide-card">
          <h3>💬 中文论文常用表达</h3>
          <div class="tip-block">
            <p class="tip-title">引言常用</p>
            <ul class="tip-list">
              <li>近年来，……受到了广泛关注</li>
              <li>……是当前研究的热点问题之一</li>
              <li>然而，……仍然面临……的挑战</li>
              <li>为了解决这一问题，本文提出/采用……</li>
              <li>据我们所知，……尚未见报道</li>
            </ul>
            <p class="tip-title">结果讨论常用</p>
            <ul class="tip-list">
              <li>从图 X 可以看出，……</li>
              <li>结果表明/显示/证实，……</li>
              <li>这主要是由于……的原因</li>
              <li>与……相比，……提高了 X%</li>
              <li>这与文献[XX]的结果一致/吻合</li>
            </ul>
            <p class="tip-title">结论常用</p>
            <ul class="tip-list">
              <li>本文通过……方法，成功制备了……</li>
              <li>研究结果表明，……具有优异的……性能</li>
              <li>本研究为……提供了新的思路和理论依据</li>
              <li>该方法有望应用于……领域</li>
            </ul>
          </div>
        </div>

        <div class="guide-card">
          <h3>⚠️ 中文论文常见问题</h3>
          <div class="error-list">
            <div class="error-item">
              <div class="error-wrong">❌ "通过实验结果可以看出，该材料的性能较好"</div>
              <div class="error-right">✅ "实验结果表明，该材料的热电优值 ZT 达到 1.5"</div>
              <div class="error-note">避免模糊表述，用具体数据替代"较好""较高""显著"等词</div>
            </div>
            <div class="error-item">
              <div class="error-wrong">❌ "做了XRD测试"</div>
              <div class="error-right">✅ "采用X射线衍射（XRD）对样品进行了结构表征"</div>
              <div class="error-note">学术论文应使用书面语，避免口语化表达</div>
            </div>
            <div class="error-item">
              <div class="error-wrong">❌ "图1为样品的SEM照片"</div>
              <div class="error-right">✅ "图1展示了样品的扫描电子显微镜（SEM）形貌"</div>
              <div class="error-note">图引用应描述图的内容，而非简单说"为"</div>
            </div>
            <div class="error-item">
              <div class="error-wrong">❌ "本研究具有重要意义"</div>
              <div class="error-right">✅ "本研究为热电材料的性能优化提供了新的思路"</div>
              <div class="error-note">说明具体意义，而非空泛自评</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 8. 文献检索技巧 ===== -->
      <div v-if="activeCategory === 'search'" class="guide-section">
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

      <!-- ===== 9. 学术社交 ===== -->
      <div v-if="activeCategory === 'social'" class="guide-section">
        <h2>学术社交与职业发展</h2>

        <div class="guide-card">
          <h3>🌐 学术社交平台</h3>
          <div class="tip-block">
            <p class="tip-title">ResearchGate</p>
            <ul class="tip-list">
              <li>创建个人档案，上传已发表论文（注意版权政策）</li>
              <li>关注同领域研究者，追踪其最新工作</li>
              <li>在"Questions"板块提问和回答学术问题</li>
              <li>查看论文的阅读量和引用数据</li>
              <li>Request full-text 功能获取全文</li>
            </ul>
            <p class="tip-title">Google Scholar Profile</p>
            <ul class="tip-list">
              <li>创建个人学术档案，自动追踪引用</li>
              <li>验证机构邮箱，确保文章归属正确</li>
              <li>定期检查合并重复条目</li>
              <li>H-index 和 i10-index 是重要的学术指标</li>
            </ul>
            <p class="tip-title">ORCID</p>
            <ul class="tip-list">
              <li>全球唯一的研究者标识符</li>
              <li>投稿时很多期刊要求填写 ORCID</li>
              <li>自动关联你的发表记录</li>
              <li>注册地址：orcid.org（免费）</li>
            </ul>
          </div>
        </div>

        <div class="guide-card">
          <h3>🎤 学术会议技巧</h3>
          <div class="tip-block">
            <p class="tip-title">会前准备</p>
            <ul class="tip-list">
              <li>提前研究会议日程，标记感兴趣的报告</li>
              <li>准备 30 秒的"电梯演讲"（Elevator Pitch）介绍自己的研究</li>
              <li>打印名片或准备电子名片（含 ORCID 二维码）</li>
              <li>准备 Poster 或 Talk 的英文版本</li>
              <li>预约想见面的研究者（提前发邮件）</li>
            </ul>
            <p class="tip-title">Poster 展示技巧</p>
            <ul class="tip-list">
              <li>站在 Poster 旁主动与参观者交流</li>
              <li>用 2-3 分钟简要介绍核心发现</li>
              <li>准备常见问题的回答（方法细节、未来计划等）</li>
              <li>准备名片或小纸条供参观者带走</li>
            </ul>
            <p class="tip-title">会后跟进</p>
            <ul class="tip-list">
              <li>24-48 小时内发邮件感谢交流</li>
              <li>附上你的论文或 Poster PDF</li>
              <li>在 LinkedIn 或 ResearchGate 添加联系</li>
              <li>记录讨论的要点和后续行动</li>
            </ul>
          </div>
        </div>

        <div class="guide-card">
          <h3>📧 学术邮件礼仪</h3>
          <div class="tip-block">
            <p class="tip-title">邮件格式规范</p>
            <ul class="tip-list">
              <li><strong>主题行：</strong>简洁明了，如 "Regarding collaboration on thermoelectric research"</li>
              <li><strong>称呼：</strong>Dear Prof. / Dr. + 姓（不要用名，除非对方允许）</li>
              <li><strong>正文：</strong>简短、有重点，每段不超过 3-4 句</li>
              <li><strong>签名：</strong>包含姓名、职位、单位、邮箱</li>
            </ul>
            <p class="tip-title">常见错误</p>
            <ul class="tip-list">
              <li>❌ "Dear Teacher" → ✅ "Dear Prof. Smith"</li>
              <li>❌ 写太长（教授没有时间读长邮件）</li>
              <li>❌ 没有说明来意就要求帮助</li>
              <li>❌ 忘记附上提到的附件</li>
              <li>❌ 使用过于随意的语气（Hey, What's up）</li>
            </ul>
          </div>
        </div>

        <div class="guide-card">
          <h3>📝 科研时间管理</h3>
          <div class="tip-block">
            <p class="tip-title">番茄工作法在科研中的应用</p>
            <ul class="tip-list">
              <li>25 分钟专注 + 5 分钟休息为一个番茄钟</li>
              <li>适合：论文写作、数据分析、文献阅读</li>
              <li>不适合：实验操作（需要连续时间）</li>
              <li>每天设定番茄钟目标（如 8-10 个）</li>
            </ul>
            <p class="tip-title">每周计划模板</p>
            <ul class="tip-list">
              <li><strong>周一：</strong>制定本周目标，安排实验</li>
              <li><strong>周二-周四：</strong>集中实验和数据处理</li>
              <li><strong>周五：</strong>整理数据、写周报、规划下周</li>
              <li>每天留 1-2 小时用于论文写作（不要等到实验全部完成）</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- ===== 10. 写作工具 ===== -->
      <div v-if="activeCategory === 'tools'" class="guide-section">
        <h2>写作工具推荐</h2>

        <div class="guide-card">
          <h3>🛠️ 语法检查</h3>
          <ul class="tip-list">
            <li><strong>Grammarly</strong> — 语法、拼写、风格检查（浏览器插件）</li>
            <li><strong>LanguageTool</strong> — 开源替代品，支持多语言</li>
            <li><strong>1Checker</strong> — 国产免费工具</li>
            <li><strong>QuillBot</strong> — 改写和润色</li>
          </ul>
        </div>

        <div class="guide-card">
          <h3>🛠️ 参考文献管理</h3>
          <ul class="tip-list">
            <li><strong>Zotero</strong> — 免费开源，浏览器插件抓取文献</li>
            <li><strong>EndNote</strong> — 功能强大，学校通常提供</li>
            <li><strong>Mendeley</strong> — Elsevier 旗下，PDF 管理方便</li>
            <li><strong>JabRef</strong> — 开源，适合 BibTeX 用户</li>
          </ul>
        </div>

        <div class="guide-card">
          <h3>🛠️ 绘图工具</h3>
          <ul class="tip-list">
            <li><strong>Origin</strong> — 科研绘图标准工具</li>
            <li><strong>matplotlib</strong> — Python 绘图（论文级质量）</li>
            <li><strong>GraphPad Prism</strong> — 生物医学常用</li>
            <li><strong>Inkscape</strong> — 矢量图编辑（免费）</li>
            <li><strong>VESTA</strong> — 晶体结构可视化</li>
          </ul>
        </div>

        <div class="guide-card">
          <h3>🛠️ 写作辅助</h3>
          <ul class="tip-list">
            <li><strong>Overleaf</strong> — 在线 LaTeX 编辑器</li>
            <li><strong>Writefull</strong> — 学术写作专用 AI</li>
            <li><strong>Academic Phrasebank</strong> — 曼彻斯特大学学术句式库</li>
            <li><strong>Google Scholar</strong> — 文献搜索</li>
            <li><strong>Connected Papers</strong> — 文献关系图谱</li>
          </ul>
        </div>

        <div class="guide-card">
          <h3>🛠️ AI 辅助</h3>
          <ul class="tip-list">
            <li><strong>Claude / ChatGPT</strong> — 写作润色、翻译、头脑风暴</li>
            <li><strong>Claude Code</strong> — 代码和数据处理</li>
            <li><strong>Consensus</strong> — AI 文献搜索</li>
            <li><strong>Elicit</strong> — AI 文献分析</li>
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
        { id: 'english', name: '英文规范', icon: '✍️' },
        { id: 'phrases', name: '句式库', icon: '💬' },
        { id: 'figures', name: '图表文献', icon: '📊' },
        { id: 'submission', name: '投稿回复', icon: '📮' },
        { id: 'thermoelectric', name: '热电专用', icon: '🔬' },
        { id: 'chinese', name: '中文论文', icon: '🇨🇳' },
        { id: 'search', name: '文献检索', icon: '🔍' },
        { id: 'social', name: '学术社交', icon: '🤝' },
        { id: 'tools', name: '写作工具', icon: '🛠️' },
      ],
      phraseGroups: [
        {
          title: 'Introduction — 引入背景',
          icon: '📖',
          phrases: [
            { en: 'Thermoelectric materials can directly convert heat into electricity via the ... effect.', cn: '热电材料可通过...效应直接将热能转化为电能' },
            { en: 'In recent years, ... has attracted considerable attention due to ...', cn: '近年来，... 因... 而受到广泛关注' },
            { en: '... plays a crucial role in ...', cn: '...在...中扮演关键角色' },
            { en: 'A variety of strategies have been developed to ...', cn: '已开发多种策略来...' },
            { en: 'However, the practical application of ... is still limited by ...', cn: '然而，...的实际应用仍受限于...' },
            { en: 'To address this issue, we propose ...', cn: '为解决此问题，我们提出...' },
            { en: 'Herein, we report a novel approach to ... that achieves ...', cn: '本文报道了一种新的...方法，实现了...' },
            { en: 'To the best of our knowledge, this is the first report on ...', cn: '据我们所知，这是首次关于...的报道' },
          ]
        },
        {
          title: 'Introduction — 文献综述',
          icon: '📚',
          phrases: [
            { en: 'Significant progress has been made in ...', cn: '在...方面已取得重要进展' },
            { en: 'For example, Smith et al. demonstrated that ...', cn: '例如，Smith等人证明了...' },
            { en: 'Building on these studies, ...', cn: '在这些研究的基础上，...' },
            { en: 'Despite these advances, ... remains a critical challenge.', cn: '尽管取得了这些进展，...仍然是一个关键挑战' },
            { en: 'The relationship between ... and ... has not been fully understood.', cn: '...与...之间的关系尚未完全阐明' },
          ]
        },
        {
          title: 'Methods — 实验方法',
          icon: '🔧',
          phrases: [
            { en: 'Polycrystalline samples of ... were synthesized by ...', cn: '多晶样品通过...方法合成' },
            { en: 'The crystal structure was characterized by X-ray diffraction (XRD) using Cu Kα radiation (λ = 1.5406 Å).', cn: '晶体结构通过X射线衍射（Cu Kα辐射）进行表征' },
            { en: 'The morphology was observed by scanning electron microscopy (SEM).', cn: '形貌通过扫描电子显微镜观察' },
            { en: 'The electrical conductivity and Seebeck coefficient were simultaneously measured using ...', cn: '电导率和Seebeck系数通过...同时测量' },
            { en: 'The thermal conductivity was calculated from ...', cn: '热导率通过...计算' },
            { en: 'DFT calculations were performed using the ... code with the ... functional.', cn: 'DFT计算使用...代码和...泛函进行' },
          ]
        },
        {
          title: 'Results — 描述结果',
          icon: '📊',
          phrases: [
            { en: 'Fig. X shows / presents / illustrates ...', cn: '图X展示了...' },
            { en: 'As can be seen from Fig. X, ...', cn: '从图X可以看出...' },
            { en: 'The XRD patterns confirm the formation of ...', cn: 'XRD图谱证实了...的形成' },
            { en: 'Notably, the sample with x = 0.1 exhibits the highest ...', cn: '值得注意的是，x=0.1的样品表现出最高的...' },
            { en: 'The electrical conductivity increases monotonically with temperature ...', cn: '电导率随温度单调增加...' },
            { en: 'A maximum ZT of 1.5 is achieved at 773 K for the optimized sample.', cn: '优化样品在773K达到最大ZT值1.5' },
            { en: 'Compared with the pristine sample, the doped samples show ...', cn: '与原始样品相比，掺杂样品表现出...' },
          ]
        },
        {
          title: 'Discussion — 分析讨论',
          icon: '💬',
          phrases: [
            { en: 'The enhancement in ... can be attributed to ...', cn: '...的增强可归因于...' },
            { en: 'This result is consistent with / in contrast to ...', cn: '此结果与...一致/相反' },
            { en: 'The underlying mechanism can be understood as follows: ...', cn: '底层机理可理解如下...' },
            { en: 'A possible explanation for this phenomenon is ...', cn: '此现象的可能解释是...' },
            { en: 'This can be explained by the fact that ...', cn: '这可以用...来解释' },
            { en: 'The reduced lattice thermal conductivity is primarily due to ...', cn: '晶格热导率的降低主要归因于...' },
            { en: 'It should be noted that ...', cn: '需要注意的是...' },
            { en: 'Despite the progress, several challenges remain ...', cn: '尽管取得了进展，仍存在一些挑战...' },
          ]
        },
        {
          title: 'Conclusion — 总结结论',
          icon: '✅',
          phrases: [
            { en: 'In summary, we have successfully ...', cn: '总之，我们成功地...' },
            { en: 'The key findings of this work are: (1) ... (2) ... (3) ...', cn: '本工作的主要发现是...' },
            { en: 'This work provides new insights into ...', cn: '本工作为...提供了新的见解' },
            { en: 'The strategy developed here can be extended to ...', cn: '本文开发的策略可扩展到...' },
            { en: 'Future work will focus on ...', cn: '未来的工作将集中在...' },
            { en: 'We believe this approach opens up new opportunities for ...', cn: '我们相信此方法为...开辟了新机会' },
          ]
        },
      ],
      submissionChecklist: [
        { text: '论文标题简洁、准确、包含关键词', checked: false },
        { text: '摘要符合字数要求（150-300词）', checked: false },
        { text: '摘要包含具体数据（ZT值、温度等）', checked: false },
        { text: '关键词 4-6 个，覆盖核心内容', checked: false },
        { text: '引言逻辑清晰：背景→综述→空白→本文', checked: false },
        { text: '方法描述完整，他人可重复', checked: false },
        { text: '图表分辨率满足期刊要求（≥300 dpi）', checked: false },
        { text: '坐标轴标签包含单位和符号', checked: false },
        { text: '图题和表题格式统一', checked: false },
        { text: '所有图引用在正文中出现', checked: false },
        { text: '参考文献格式符合期刊要求', checked: false },
        { text: '时态使用正确（Methods用过去时）', checked: false },
        { text: '冠词使用正确（a/an/the）', checked: false },
        { text: '英文语法检查完成', checked: false },
        { text: 'Cover Letter 准备', checked: false },
        { text: '所有作者确认并同意投稿', checked: false },
        { text: '投稿系统要求的文件齐全', checked: false },
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
  position: sticky;
  top: 0;
  background: var(--bg-secondary);
  padding: 12px 0;
  z-index: 10;
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

.tip-block .tip-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  margin-top: 12px;
}

.tip-block .tip-title:first-child {
  margin-top: 0;
}

/* 论文结构 */
.structure-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.structure-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--bg-surface);
  border-radius: var(--radius);
}

.structure-idx {
  width: 28px;
  height: 28px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.structure-name {
  font-weight: 600;
  color: var(--text-primary);
}

.structure-desc {
  font-size: 13px;
  color: var(--text-secondary);
}

/* 漏斗图 */
.funnel {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.funnel-level {
  padding: 12px 16px;
  text-align: center;
  font-size: 14px;
  color: var(--text-primary);
}

.funnel-level.level-1 { background: rgba(99,102,241,0.1); border-radius: var(--radius) var(--radius) 0 0; }
.funnel-level.level-2 { background: rgba(99,102,241,0.2); }
.funnel-level.level-3 { background: rgba(99,102,241,0.3); }
.funnel-level.level-4 { background: rgba(99,102,241,0.4); border-radius: 0 0 var(--radius) var(--radius); }

/* 示例 */
.example-block {
  padding: 12px 16px;
  background: var(--bg-surface);
  border-radius: var(--radius);
  border-left: 4px solid var(--primary);
}

.example-block p {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 4px;
  font-style: italic;
}

/* 常用句式 */
.phrase-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  line-height: 1.6;
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

/* 表格 */
.table-block {
  overflow-x: auto;
}

.table-block table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table-block th {
  text-align: left;
  padding: 10px 12px;
  background: var(--bg-surface);
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border);
}

.table-block td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  color: var(--text-secondary);
}

/* 错误示例 */
.error-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error-item {
  padding: 12px;
  background: var(--bg-surface);
  border-radius: var(--radius);
}

.error-wrong {
  color: var(--danger);
  font-size: 14px;
  margin-bottom: 4px;
}

.error-right {
  color: var(--success);
  font-size: 14px;
  margin-bottom: 4px;
}

.error-note {
  font-size: 12px;
  color: var(--text-muted);
  font-style: italic;
}

/* 模板 */
.template-block {
  padding: 16px;
  background: var(--bg-surface);
  border-radius: var(--radius);
  border-left: 4px solid var(--primary);
  line-height: 1.8;
}

.template-block p {
  margin-bottom: 8px;
  font-size: 14px;
  white-space: pre-line;
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
