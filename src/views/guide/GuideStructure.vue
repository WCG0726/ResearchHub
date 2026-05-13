<template>
  <div class="guide-section">
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
</template>
