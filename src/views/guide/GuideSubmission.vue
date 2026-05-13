<template>
  <div class="guide-section">
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
</template>

<script setup>
import { reactive } from 'vue'

const submissionChecklist = reactive([
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
])
</script>
