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
import { LINK_GROUPS } from '../data/links'

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
      linkGroups: LINK_GROUPS
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
