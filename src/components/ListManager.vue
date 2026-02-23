<template>
  <div class="list-manager">
    <Navbar />
    <main class="main-content">
      <div class="content-wrapper">
        <div class="list-content">
          <SettingsPage v-if="currentPage === 'settings'" />
          <div v-else-if="currentList" class="list-detail">
            <div class="list-header">
              <h1>{{ currentList.name }}</h1>
            </div>

            <div v-if="showEditName" class="edit-name">
              <input v-model="editedName" placeholder="List name" />
              <button @click="saveName">Save</button>
              <button @click="cancelEdit">Cancel</button>
            </div>

            <ul class="items-list">
              <li v-for="(item, index) in currentList.items" :key="index" class="item">
                <div v-if="editingIndex === index" class="edit-item">
                  <input v-model="editedItem" placeholder="Edit item" maxlength="32" />
                  <span class="char-count">{{ editedItem.length }}/32</span>
                  <button class="btn-save" @click="saveItem(index)">Save</button>
                  <button class="btn-cancel" @click="cancelEditItem">Cancel</button>
                </div>
                <div v-else class="item-display">
                  <div class="item-content">
                    <span @click="startEditItem(index)" class="item-text">{{ item.text }}</span>
                    <button 
                      class="btn-toggle-notes" 
                      @click="toggleNotes(index)"
                      :class="{ active: expandedNotes === index }"
                      title="Toggle notes"
                    >
                      ›
                    </button>
                  </div>
                  <div class="item-actions">
                    <button 
                      class="btn-pin"
                      :class="{ pinned: isItemPinned(index) }"
                      @click="togglePin(index)"
                      :title="isItemPinned(index) ? 'Unpin item' : 'Pin item'"
                    >
                      📌
                    </button>
                    <button class="btn-remove" @click="removeItem(index)" title="Delete item">🗑️</button>
                  </div>
                </div>
                <div v-if="expandedNotes === index" class="item-notes">
                  <div v-if="editingNotesIndex === index" class="edit-notes">
                    <textarea 
                      v-model="editedNotes" 
                      placeholder="Add notes..."
                      rows="3"
                    />
                    <div class="notes-actions">
                      <button class="btn-save" @click="saveNotes(index)">Save Notes</button>
                      <button class="btn-cancel" @click="cancelEditNotes">Cancel</button>
                    </div>
                  </div>
                  <div v-else class="view-notes">
                    <p v-if="item.notes" class="notes-text">{{ item.notes }}</p>
                    <p v-else class="no-notes">No notes yet</p>
                    <button class="btn-edit-notes" @click="startEditNotes(index)">{{ item.notes ? 'Edit' : 'Add' }} Notes</button>
                  </div>
                </div>
              </li>
            </ul>

            <p v-if="currentList.items.length === 12" class="item-count-display">
              Maximum items (12) reached for this list
            </p>
            <p v-if="currentList.items.length === 0" class="empty-state">
              No items yet. Add one to get started!
            </p>

            <div v-if="itemLimitMessage" class="item-limit-message">{{ itemLimitMessage }}</div>
          </div>
        </div>
     </div>
          <div v-if="currentList" class="add-item">
            <div class="input-group">
              <input 
                v-model="newItem" 
                placeholder="Add a new item (max 32 characters)..."
                @keyup.enter="addItem"
                :disabled="currentList.items.length >= 12"
                maxlength="32"
              />
              <span class="char-count">{{ newItem.length }}/32</span>
            </div>
            <button @click="addItem" :disabled="currentList.items.length >= 12">Add</button>
          </div>
    </main>
    <div class="pinboard-wrapper">
      <div v-show="pinboardOpen" class="pinboard-container">
        <Pinboard />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { listStore } from '../stores/listStore';
import Navbar from './Navbar.vue';
import SettingsPage from './SettingsPage.vue';
import Pinboard from './Pinboard.vue';

const newItem = ref('');
const showEditName = ref(false);
const editedName = ref('');
const editingIndex = ref(null);
const editedItem = ref('');
const itemLimitMessage = ref('');
const expandedNotes = ref(null);
const editingNotesIndex = ref(null);
const editedNotes = ref('');
const pinboardOpen = ref(window.innerWidth > 1024);

const currentList = computed(() => listStore.getCurrentList());
const currentPage = computed(() => listStore.currentPage);

const addItem = () => {
  itemLimitMessage.value = '';
  
  if (currentList.value.items.length >= 12) {
    itemLimitMessage.value = 'Maximum 12 items allowed per list';
    return;
  }
  
  if (newItem.value.trim()) {
    listStore.addItem(listStore.currentListId, newItem.value);
    newItem.value = '';
  }
};

const removeItem = (index) => {
  listStore.removeItem(listStore.currentListId, index);
};

const startEditItem = (index) => {
  editingIndex.value = index;
  editedItem.value = currentList.value.items[index].text;
};

const saveItem = (index) => {
  if (editedItem.value.trim()) {
    listStore.updateItem(listStore.currentListId, index, editedItem.value);
    editingIndex.value = null;
    editedItem.value = '';
  }
};

const cancelEditItem = () => {
  editingIndex.value = null;
  editedItem.value = '';
};

const toggleNotes = (index) => {
  if (expandedNotes.value === index) {
    expandedNotes.value = null;
  } else {
    expandedNotes.value = index;
    editingNotesIndex.value = null;
    editedNotes.value = '';
  }
};

const startEditNotes = (index) => {
  editingNotesIndex.value = index;
  editedNotes.value = currentList.value.items[index].notes;
};

const saveNotes = (index) => {
  listStore.updateItemNotes(listStore.currentListId, index, editedNotes.value);
  editingNotesIndex.value = null;
  editedNotes.value = '';
};

const cancelEditNotes = () => {
  editingNotesIndex.value = null;
  editedNotes.value = '';
};

const deleteCurrentList = () => {
  if (confirm(`Delete "${currentList.value.name}"? This cannot be undone.`)) {
    listStore.deleteList(listStore.currentListId);
  }
};

const startEditName = () => {
  editedName.value = currentList.value.name;
  showEditName.value = true;
};

const saveName = () => {
  if (editedName.value.trim()) {
    listStore.updateList(listStore.currentListId, editedName.value);
    showEditName.value = false;
  }
};

const cancelEdit = () => {
  showEditName.value = false;
  editedName.value = '';
};

const togglePin = (index) => {
  if (listStore.isItemPinned(listStore.currentListId, index)) {
    listStore.unpinItem(listStore.currentListId, index);
  } else {
    listStore.pinItem(listStore.currentListId, index);
  }
};

const isItemPinned = (index) => {
  return listStore.isItemPinned(listStore.currentListId, index);
};

const togglePinboard = () => {
  pinboardOpen.value = !pinboardOpen.value;
};

const goToSettings = () => {
  listStore.goToSettings();
};
</script>

<style scoped>
.list-manager {
  display: flex;
  height: 100vh;
  background: #1a1a1a;
}

.main-content {
  flex-grow: 3;
  padding: 2rem;
  overflow-y: auto;
  color: #e0e0e0;
  display: flex;
  min-width: 0;
  position: relative;
}

.content-wrapper {
  display: flex;
  width: 100%;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.list-content {
  flex: 1;
  min-width: 0;
}

.pinboard-wrapper {
  padding: 2rem;
  flex-grow: 1;
  display: flex;
  gap: 0.5rem;
  height: fit-content;
}

.pinboard-container {
  width: 100%;
  background: #222222;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #404040;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.list-detail {
  max-width: 800px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid #404040;
  padding-bottom: 1rem;
}

.list-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #fff;
}

.list-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-name {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.edit-name input {
  flex: 1;
  padding: 0.75rem;
  background: #2a2a2a;
  border: 1px solid #404040;
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 1rem;
}

.edit-name input:focus {
  outline: none;
  border-color: #5a5aff;
}

.btn-edit,
.btn-delete {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-edit {
  background: #5a5aff;
  color: white;
}

.btn-edit:hover {
  background: #7575ff;
}

.btn-delete {
  background: #ff4444;
  color: white;
}

.btn-delete:hover {
  background: #ff6666;
}

.add-item {
  position: absolute;
  width: 100%;
  bottom: 0;
  left: 0;
  display: flex;
  flex: 1;
  gap: 0.5rem;
  margin-bottom: 0;
  background: linear-gradient(to bottom, rgba(20, 20, 20, 0), rgba(20, 20, 20, 1));
  padding: 2rem;
  z-index: 10;
}

.add-item input {
  flex: 1;
  width: 100%;
  padding: 0.75rem;
  background: #2a2a2a;
  border: 1px solid #404040;
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 1rem;
}

.add-item input:focus {
  outline: none;
  border-color: #5a5aff;
}

.input-group {
  position: relative;
  flex: 1;
}

.char-count {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
  color: #888;
  pointer-events: none;
}

.add-item button {
  padding: 0.75rem 1.5rem;
  background: #5a5aff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.add-item button:hover {
  background: #7575ff;
}

.add-item input:disabled,
.add-item button:disabled {
  background: #555;
  cursor: not-allowed;
  opacity: 0.6;
}

.add-item button:disabled:hover {
  background: #555;
}

.item-limit-message {
  color: #ff4444;
  font-size: 0.9rem;
  padding: 0.75rem;
  background: rgba(255, 68, 68, 0.1);
  border-radius: 4px;
  border-left: 3px solid #ff4444;
  margin-bottom: 1.5rem;
}

.item-count-display {
  text-align: center;
  color: #4CAF50;
  font-size: 0.9rem;
  margin-top: 1.5rem;
  font-weight: bold;
}

.items-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background: #2a2a2a;
  border: 1px solid #404040;
  border-radius: 4px;
  margin-bottom: 0.75rem;
  transition: all 0.3s;
  flex-direction: column;
  gap: 0.5rem;
}

.item:hover {
  background: #333333;
  border-color: #505050;
}

.item-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 1rem;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-text {
  flex: 1;
  color: #e0e0e0;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 2px;
  transition: all 0.3s;
  word-break: break-word;
}

.item-text:hover {
  background: #3a3a3a;
  color: #fff;
}

.btn-toggle-notes {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0 0.25rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-toggle-notes:hover {
  color: #5a5aff;
}

.btn-toggle-notes.active {
  color: #5a5aff;
  transform: rotate(90deg);
}

.edit-item {
  display: flex;
  width: 100%;
  gap: 0.5rem;
  align-items: flex-start;
  flex-wrap: wrap;
}

.edit-item input {
  flex: 1;
  min-width: 200px;
  padding: 0.5rem;
  background: #1a1a1a;
  border: 1px solid #5a5aff;
  border-radius: 3px;
  color: #e0e0e0;
  font-size: 0.95rem;
  position: relative;
}

.edit-item input:focus {
  outline: none;
  border-color: #7575ff;
}

.edit-item .char-count {
  position: static;
  transform: none;
  font-size: 0.75rem;
  color: #888;
  white-space: nowrap;
}

.item-notes {
  width: 100%;
  background: #1a1a1a;
  border: 1px solid #404040;
  border-radius: 3px;
  padding: 1rem;
  margin-top: 0.5rem;
}

.edit-notes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edit-notes textarea {
  padding: 0.75rem;
  background: #2a2a2a;
  border: 1px solid #5a5aff;
  border-radius: 3px;
  color: #e0e0e0;
  font-size: 0.9rem;
  resize: vertical;
  font-family: inherit;
}

.edit-notes textarea:focus {
  outline: none;
  border-color: #7575ff;
}

.notes-actions {
  display: flex;
  gap: 0.5rem;
}

.view-notes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notes-text {
  margin: 0;
  color: #e0e0e0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.no-notes {
  margin: 0;
  color: #888;
  font-style: italic;
}

.btn-edit-notes {
  padding: 0.5rem 1rem;
  background: #5a5aff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-edit-notes:hover {
  background: #7575ff;
}

.btn-save,
.btn-cancel {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.btn-save {
  background: #4CAF50;
  color: white;
}

.btn-save:hover {
  background: #66BB6A;
}

.btn-cancel {
  background: #666;
  color: white;
}

.btn-cancel:hover {
  background: #777;
}

.btn-pin {
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem 0.5rem;
  transition: all 0.3s;
  border-radius: 4px;
}

.btn-pin:hover {
  background: rgba(90, 90, 255, 0.1);
  color: #5a5aff;
}

.btn-pin.pinned {
  color: #ffc107;
  background: rgba(255, 193, 7, 0.1);
}

.btn-remove {
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-remove:hover {
  background: #ff6666;
}

.empty-state {
  text-align: center;
  color: #888;
  font-style: italic;
  margin-top: 2rem;
}

button {
  padding: 0.5rem 1rem;
  background: #5a5aff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

button:hover {
  background: #7575ff;
}

@media (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
    gap: 1rem;
  }

  .pinboard-wrapper {
    width: 100%;
    flex-direction: row;
  }

  .pinboard-toggle {
    position: static;
    width: auto;
    padding: 0.5rem 1rem;
  }

  .pinboard-container {
    width: 100%;
    height: auto;
    position: static;
    max-height: 500px;
  }
}

@media (max-width: 768px) {
  .list-manager {
    flex-direction: column;
  }

  .main-content {
    padding: 1rem;
    min-width: 0;
  }

  .content-wrapper {
    gap: 0.75rem;
  }

  .pinboard-wrapper {
    flex-direction: column;
  }

  .pinboard-toggle {
    width: 100%;
    position: static;
  }

  .list-detail {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
  }

  .list-header h1 {
    font-size: 1.5rem;
  }

  .add-item {
    flex-direction: column;
  }

.main-content .btn-settings {
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: #222222;
  border: 1px solid #404040;
  border-radius: 8px;
  color: #e0e0e0;
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1.5rem;
  transition: all 0.3s;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.main-content .btn-settings:hover {
  background: #333333;
  border-color: #505050;
}
}

</style>