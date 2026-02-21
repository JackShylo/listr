<template>
  <div class="settings-page">
    <div class="settings-header">
      <h1>⚙️ Settings</h1>
      <button class="btn-close" @click="goBack" title="Back to lists">✕</button>
    </div>

    <div class="settings-container">
      <div class="settings-section">
        <h2>General</h2>
        
        <div class="setting-item">
          <label for="default-category">Default Category:</label>
          <select id="default-category" v-model.number="localSettings.defaultCategory">
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
          <p class="setting-help">Category selected by default when creating new lists</p>
        </div>

        <div class="setting-item">
          <label for="theme">Theme:</label>
          <select id="theme" v-model="localSettings.theme">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto</option>
          </select>
          <p class="setting-help">Choose your preferred theme</p>
        </div>
      </div>

      <div class="settings-section">
        <h2>Display</h2>
        
        <div class="setting-item">
          <label>
            <input 
              type="checkbox" 
              v-model="localSettings.showCompletedItems"
            />
            <span>Show Completed Items</span>
          </label>
          <p class="setting-help">Display or hide items marked as completed</p>
        </div>
      </div>

      <div class="settings-section">
        <h2>Categories</h2>
        
        <div class="categories-list">
          <div class="category-item" v-for="cat in categories" :key="cat.id">
            <div class="category-color-picker">
              <input 
                type="color" 
                v-model="cat.color"
                @change="updateCategoryColor(cat.id, cat.color)"
              />
              <span class="category-name">{{ cat.name }}</span>
            </div>
            <span class="category-list-count">({{ getListsByCategory(cat.id).length }} lists)</span>
          </div>
        </div>
      </div>

      <div class="settings-section danger-zone">
        <h2>Danger Zone</h2>
        
        <button class="btn-danger" @click="resetSettings">
          🔄 Reset All Settings
        </button>
        <p class="setting-help">Reset all settings to their default values</p>
      </div>
    </div>

    <div class="settings-footer">
      <button class="btn-save" @click="saveSettings">💾 Save Settings</button>
      <button class="btn-cancel" @click="goBack">Cancel</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { listStore } from '../stores/listStore';

const localSettings = ref({ ...listStore.settings });
const categories = computed(() => listStore.categories);

const getListsByCategory = (categoryId) => {
  return listStore.getListsByCategory(categoryId);
};

const goBack = () => {
  listStore.goToLists();
};

const saveSettings = () => {
  listStore.updateSettings(localSettings.value);
  listStore.goToLists();
};

const resetSettings = () => {
  if (confirm('Are you sure you want to reset all settings to their defaults?')) {
    listStore.resetSettings();
    localSettings.value = { ...listStore.settings };
  }
};

const updateCategoryColor = (categoryId, color) => {
  const category = categories.value.find(c => c.id === categoryId);
  if (category) {
    listStore.updateCategory(categoryId, category.name, color);
  }
};
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1a1a1a;
  color: #e0e0e0;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid #404040;
}

.settings-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #fff;
}

.btn-close {
  width: 36px;
  height: 36px;
  padding: 0;
  background: #404040;
  color: #e0e0e0;
  border: none;
  border-radius: 6px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: #505050;
  color: #fff;
}

.settings-container {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.settings-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #2a2a2a;
  border: 1px solid #404040;
  border-radius: 8px;
}

.settings-section h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
  color: #fff;
  border-bottom: 2px solid #5a5aff;
  padding-bottom: 0.75rem;
}

.setting-item {
  margin-bottom: 1.5rem;
}

.setting-item label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #e0e0e0;
}

.setting-item input[type="text"],
.setting-item select {
  width: 100%;
  padding: 0.75rem;
  background: #1a1a1a;
  border: 1px solid #404040;
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 0.95rem;
  cursor: pointer;
}

.setting-item input[type="text"]:focus,
.setting-item select:focus {
  outline: none;
  border-color: #5a5aff;
  box-shadow: 0 0 0 3px rgba(90, 90, 255, 0.1);
}

.setting-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #5a5aff;
  margin-right: 0.75rem;
  vertical-align: middle;
}

.setting-item > label:has(input[type="checkbox"]) {
  display: flex;
  align-items: center;
  margin-bottom: 0;
}

.setting-help {
  margin: 0.5rem 0 0 0;
  font-size: 0.85rem;
  color: #888;
  font-style: italic;
}

.categories-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #1a1a1a;
  border: 1px solid #404040;
  border-radius: 6px;
  transition: all 0.2s;
}

.category-item:hover {
  border-color: #5a5aff;
  background: #252525;
}

.category-color-picker {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-color-picker input[type="color"] {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.category-name {
  font-weight: 500;
  color: #e0e0e0;
}

.category-list-count {
  font-size: 0.85rem;
  color: #888;
  margin-left: auto;
  padding-left: 1rem;
}

.danger-zone {
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid rgba(255, 68, 68, 0.3);
}

.danger-zone h2 {
  color: #ff6b6b;
  border-bottom-color: #ff6b6b;
}

.btn-danger {
  width: 100%;
  padding: 1rem;
  background: rgba(255, 68, 68, 0.2);
  color: #ff6b6b;
  border: 2px solid #ff6b6b;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover {
  background: rgba(255, 68, 68, 0.3);
  color: #ff5252;
}

.settings-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #404040;
  background: #252525;
}

.btn-save,
.btn-cancel {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save {
  background: #5a5aff;
  color: white;
}

.btn-save:hover {
  background: #7575ff;
}

.btn-cancel {
  background: #404040;
  color: #e0e0e0;
}

.btn-cancel:hover {
  background: #505050;
}

/* Scrollbar styling */
.settings-container::-webkit-scrollbar {
  width: 6px;
}

.settings-container::-webkit-scrollbar-track {
  background: #2a2a2a;
}

.settings-container::-webkit-scrollbar-thumb {
  background: #404040;
  border-radius: 3px;
}

.settings-container::-webkit-scrollbar-thumb:hover {
  background: #505050;
}
</style>
