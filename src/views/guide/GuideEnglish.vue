<template>
  <div class="guide-section">
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
</template>
