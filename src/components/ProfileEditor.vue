<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal">
        <h3>编辑资料</h3>
        <div class="form-group">
          <label>昵称</label>
          <input v-model="editName" type="text" maxlength="10" placeholder="输入昵称" />
        </div>
        <div class="form-group">
          <label>头像</label>
          <div class="avatar-upload-area">
            <div class="avatar-preview-lg" @click="fileInput?.click()">
              <img v-if="editAvatarData" :src="editAvatarData" alt="avatar" />
              <span v-else-if="editAvatar">{{ editAvatar }}</span>
              <span v-else>{{ editName.charAt(0) || '?' }}</span>
              <div class="avatar-overlay">📷</div>
            </div>
            <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
            <span class="upload-hint">点击上传自定义头像</span>
          </div>
          <div class="avatar-options">
            <div
              v-for="emoji in avatarOptions"
              :key="emoji"
              class="avatar-option"
              :class="{ active: !editAvatarData && editAvatar === emoji }"
              @click="editAvatar = emoji; editAvatarData = ''"
            >
              {{ emoji }}
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>学校/机构</label>
          <input v-model="editSchool" type="text" placeholder="输入学校名称" list="school-list" />
          <datalist id="school-list">
            <option v-for="s in commonSchools" :key="s" :value="s" />
          </datalist>
        </div>
        <div class="form-group">
          <label>研究方向</label>
          <input v-model="editResearchField" type="text" placeholder="如：热电材料、机器学习..." />
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="$emit('close')">取消</button>
          <button class="btn-save" @click="save">保存</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  profile: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['close', 'save'])

const fileInput = ref(null)
const editName = ref('')
const editAvatar = ref('')
const editAvatarData = ref('')
const editSchool = ref('')
const editResearchField = ref('')

const avatarOptions = ['🧑‍🔬', '👩‍🔬', '👨‍🔬', '🧑‍💻', '👩‍💻', '👨‍💻', '📚', '🔬', '🧪', '🎯', '🌟', '⚡']
const commonSchools = ['清华大学', '北京大学', '浙江大学', '上海交通大学', '复旦大学', '中国科学技术大学', '南京大学', '武汉大学', '华中科技大学', '中山大学', '哈尔滨工业大学', '西安交通大学', '同济大学', '北京航空航天大学', '东南大学', '北京理工大学', '南开大学', '天津大学', '山东大学', '中南大学', '吉林大学', '大连理工大学', '厦门大学', '华南理工大学', '电子科技大学', '中国科学院大学', '北京科技大学', '华东师范大学', '重庆大学', '兰州大学', '南方科技大学', '苏州大学', '暨南大学', '南京理工大学', '北京交通大学', '西北工业大学']

watch(() => props.show, (val) => {
  if (val) {
    editName.value = props.profile.nickname || ''
    editAvatar.value = props.profile.avatar || ''
    editAvatarData.value = props.profile.avatarData || ''
    editSchool.value = props.profile.school || ''
    editResearchField.value = props.profile.researchField || ''
  }
})

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    editAvatarData.value = ev.target.result
    editAvatar.value = ''
  }
  reader.readAsDataURL(file)
}

function save() {
  emit('save', {
    nickname: editName.value.trim() || '研究者',
    avatar: editAvatar.value,
    avatarData: editAvatarData.value,
    school: editSchool.value.trim(),
    researchField: editResearchField.value.trim(),
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 28px;
  width: 400px;
  max-width: 90vw;
  box-shadow: var(--shadow-xl);
}

.modal h3 {
  font-size: 18px;
  margin: 0 0 20px;
  color: var(--text-primary);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: var(--primary);
}

.avatar-upload-area {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.avatar-preview-lg {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--bg-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 2px solid var(--border);
}

.avatar-preview-lg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-preview-lg:hover .avatar-overlay {
  opacity: 1;
}

.upload-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.avatar-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.avatar-option {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.avatar-option:hover {
  border-color: var(--primary);
}

.avatar-option.active {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.btn-cancel {
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
}

.btn-save {
  padding: 8px 20px;
  border: none;
  border-radius: var(--radius);
  background: var(--primary);
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-save:hover {
  background: var(--primary-hover);
}
</style>
