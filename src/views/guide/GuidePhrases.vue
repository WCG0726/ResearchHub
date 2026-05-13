<template>
  <div class="guide-section">
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
</template>

<script setup>
const phraseGroups = [
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
]
</script>
