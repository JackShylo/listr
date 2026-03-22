<template>
  <main class="main-content">
    <div class="content-wrapper">
      <div class="list-content">
        <SettingsPage v-if="currentPage === 'settings'" />
        <div v-else-if="currentList">
          <div class="list-header">
            <h1>{{ currentList.name }}</h1>
          </div>

          <div v-if="showEditName" class="edit-name">
            <input v-model="editedName" placeholder="List name" />
            <button @click="saveName">Save</button>
            <button @click="cancelEdit">Cancel</button>
          </div>

            <ul class="items-list">
              <li v-for="(item, index) in currentList.items" :key="index" 
                class="item"
                @touchstart="onTouchStart(index, $event)"
                @touchmove="onTouchMove(index, $event)"
                @touchend="onTouchEnd(index, $event)"
                :class="{ swiped: itemSwipe[index] !== undefined && itemSwipe[index] < -50 }"
              >
                <div v-if="editingIndex === index" class="edit-item">
                  <input v-model="editedItem" placeholder="Edit item" maxlength="32" />
                  <span class="char-count">{{ editedItem.length }}/32</span>
                  <button class="btn-save" @click="saveItem(index)">Save</button>
                  <button class="btn-cancel" @click="cancelEditItem">Cancel</button>
                </div>
                <div v-else class="item-display">
                  <div class="item-content">
                    <span 
                      class="item-text"
                      :class="{ completed: item.completed }"
                      @contextmenu.prevent="startEditItem(index)"
                    >
                      {{ item.text }}
                    </span>
                  </div>
                  <input 
                    type="checkbox" 
                    :checked="item.completed"
                    @change="toggleCompleted(index)"
                    class="item-checkbox"
                    title="Mark as completed"
                  />
                  <div class="kebab-menu-container">
                    <button 
                      class="btn-kebab"
                      @click="toggleItemMenu(index)"
                      title="More options"
                    >
                      ⋮
                    </button>
                    <div 
                      v-if="activeMenuIndex === index" 
                      class="kebab-menu-dropdown"
                    >
                      <button class="menu-item" @click="openEditModal(index)">✏️ Edit</button>
                      <button class="menu-item" @click="openCloneModal(index)">📋 Clone</button>
                      <button class="menu-item" @click="togglePin(index)">{{ isItemPinned(index) ? '📌 Unpin' : '📌 Pin' }}</button>
                      <button class="menu-item delete" @click="openDeleteModal(index)">🗑️ Delete</button>
                    </div>
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
                placeholder="Add a new item..."
                @keyup.enter="addItem"
                :disabled="currentList.items.length >= 12"
                maxlength="64"
              />
              <span class="char-count">{{ newItem.length }}/64</span>
            </div>
            <button @click="addItem" :disabled="currentList.items.length >= 12">Add</button>
          </div>

      <!-- Edit Modal -->
      <div v-if="editModalOpen" class="modal-overlay" @click="closeEditModal">
        <div class="modal-content" @click.stop>
          <h2>Edit Item</h2>
          <input 
            v-model="editModalText" 
            placeholder="Edit item" 
            maxlength="32"
            @keyup.enter="saveEditModal"
          />
          <span class="char-count">{{ editModalText.length }}/32</span>
          <div class="modal-actions">
            <button class="btn-save" @click="saveEditModal">Save</button>
            <button class="btn-cancel" @click="closeEditModal">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Clone Modal -->
      <div v-if="cloneModalOpen" class="modal-overlay" @click="closeCloneModal">
        <div class="modal-content" @click.stop>
          <h2>Clone Item</h2>
          <p>Create a duplicate of this item?</p>
          <p class="item-preview">{{ cloneItemText }}</p>
          <div class="modal-actions">
            <button class="btn-save" @click="saveCloneModal">Clone</button>
            <button class="btn-cancel" @click="closeCloneModal">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Delete Modal -->
      <div v-if="deleteModalOpen" class="modal-overlay" @click="closeDeleteModal">
        <div class="modal-content" @click.stop>
          <h2>Delete Item</h2>
          <p>Are you sure you want to delete this item?</p>
          <p class="item-preview">{{ deleteItemText }}</p>
          <div class="modal-actions">
            <button class="btn-delete" @click="saveDeleteModal">Delete</button>
            <button class="btn-cancel" @click="closeDeleteModal">Cancel</button>
          </div>
        </div>
      </div>
    </main>
</template>

<script setup>
import { ref, computed } from 'vue';
import { listStore } from '../stores/listStore';
import SettingsPage from './SettingsPage.vue';

const newItem = ref('');
const showEditName = ref(false);
const editedName = ref('');
const editingIndex = ref(null);
const editedItem = ref('');
const itemLimitMessage = ref('');

// Kebab menu and modal states
const activeMenuIndex = ref(null);
const editModalOpen = ref(false);
const editModalIndex = ref(null);
const editModalText = ref('');
const cloneModalOpen = ref(false);
const cloneItemIndex = ref(null);
const cloneItemText = ref('');
const deleteModalOpen = ref(false);
const deleteItemIndex = ref(null);
const deleteItemText = ref('');

// Swipe and long-press handling
const itemSwipe = ref({});
const touchStartX = ref(0);
const longPressTimer = ref(null);
const longPressDuration = 500; // 500ms for long press

const currentList = computed(() => listStore.getCurrentList());
const currentPage = computed(() => listStore.currentPage);

// Long-press handlers
const startLongPress = (index) => {
  longPressTimer.value = setTimeout(() => {
  }, longPressDuration);
};

const cancelLongPress = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value);
    longPressTimer.value = null;
  }
};

// Touch handlers for swipe
const onTouchStart = (index, event) => {
  touchStartX.value = event.touches[0].clientX;
  cancelLongPress();
  longPressTimer.value = setTimeout(() => {
  }, longPressDuration);
};

const onTouchMove = (index, event) => {
  const currentX = event.touches[0].clientX;
  const diff = currentX - touchStartX.value;
  
  // Only allow swipe left (negative diff)
  if (diff < 0) {
    itemSwipe.value[index] = Math.max(diff, -120); // Max swipe of 120px
    // Cancel long press if user is swiping
    cancelLongPress();
  }
};

const onTouchEnd = (index, event) => {
  cancelLongPress();
  const swipeDistance = itemSwipe.value[index] || 0;
  
  // If swiped more than 50px left, delete the item
  if (swipeDistance < -50) {
    removeItem(index);
    itemSwipe.value[index] = 0;
  } else {
    // Reset swipe position
    itemSwipe.value[index] = 0;
  }
};

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

const toggleCompleted = (index) => {
  listStore.toggleItemCompleted(listStore.currentListId, index);
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

// Kebab menu handlers
const toggleItemMenu = (index) => {
  activeMenuIndex.value = activeMenuIndex.value === index ? null : index;
};

const closeMenu = () => {
  activeMenuIndex.value = null;
};

// Edit modal handlers
const openEditModal = (index) => {
  editModalIndex.value = index;
  editModalText.value = currentList.value.items[index].text;
  editModalOpen.value = true;
  closeMenu();
};

const closeEditModal = () => {
  editModalOpen.value = false;
  editModalIndex.value = null;
  editModalText.value = '';
};

const saveEditModal = () => {
  if (editModalText.value.trim() && editModalIndex.value !== null) {
    listStore.updateItem(listStore.currentListId, editModalIndex.value, editModalText.value);
    closeEditModal();
  }
};

// Clone modal handlers
const openCloneModal = (index) => {
  cloneItemIndex.value = index;
  cloneItemText.value = currentList.value.items[index].text;
  cloneModalOpen.value = true;
  closeMenu();
};

const closeCloneModal = () => {
  cloneModalOpen.value = false;
  cloneItemIndex.value = null;
  cloneItemText.value = '';
};

const saveCloneModal = () => {
  if (cloneItemIndex.value !== null) {
    const list = currentList.value;
    if (list.items.length < 12) {
      listStore.addItem(listStore.currentListId, cloneItemText.value);
      closeCloneModal();
    } else {
      itemLimitMessage.value = 'Maximum 12 items allowed per list';
    }
  }
};

// Delete modal handlers
const openDeleteModal = (index) => {
  deleteItemIndex.value = index;
  deleteItemText.value = currentList.value.items[index].text;
  deleteModalOpen.value = true;
  closeMenu();
};

const closeDeleteModal = () => {
  deleteModalOpen.value = false;
  deleteItemIndex.value = null;
  deleteItemText.value = '';
};

const saveDeleteModal = () => {
  if (deleteItemIndex.value !== null) {
    removeItem(deleteItemIndex.value);
    closeDeleteModal();
  }
};
</script>

<style scoped>
.main-content {
  flex: 3;
  padding: 2rem;
  overflow-y: auto;
  color: #e0e0e0;
  display: flex;
  min-width: 0;
  position: relative;
}

.content-wrapper {
  width: 100%;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.list-content {
  min-width: 0;
}

.pinboard-wrapper {
  padding: 2rem;
  flex: 1;
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
  position: relative;
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
  position: relative;
  overflow: visible;
  transition: transform 0.2s ease-out;
  touch-action: pan-y;
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
  width: 100%;
}

.item-checkbox {
  width: 24px;
  height: 24px;
  cursor: pointer;
  flex-shrink: 0;
  appearance: none;
  -webkit-appearance: none;
  border: 2px solid #5a5aff;
  background-color: transparent;
  border-radius: 50%;
  transition: all 0.3s;
}

.item-checkbox:checked {
  background-color: #5a5aff;
  box-shadow: inset 0 0 0 2px #5a5aff;
}

.item-checkbox:hover {
  border-color: #7575ff;
}

.item-checkbox:checked:hover {
  background-color: #7575ff;
  border-color: #7575ff;
}

.item-text {
  flex: 1;
  color: #e0e0e0;
  padding: 0.25rem;
  border-radius: 2px;
  transition: all 0.3s;
  word-break: break-word;
  user-select: none;
}

.item-text.completed {
  text-decoration: line-through;
  color: #888;
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

.btn-remove {
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.btn-remove:hover {
  background: #ff6666;
}

.kebab-menu-container {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  margin-left: auto;
}

.btn-kebab {
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0.25rem 0.5rem;
  transition: all 0.3s;
  border-radius: 4px;
}

.btn-kebab:hover {
  background: rgba(90, 90, 255, 0.1);
  color: #5a5aff;
}

.kebab-menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: #2a2a2a;
  border: 1px solid #404040;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 50;
  min-width: 150px;
  margin-top: 0.25rem;
  overflow: hidden;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  text-align: left;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.menu-item:hover {
  background: #333333;
  color: #fff;
}

.menu-item.delete:hover {
  background: rgba(255, 68, 68, 0.2);
  color: #ff4444;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal-content {
  background: #2a2a2a;
  border: 1px solid #404040;
  border-radius: 8px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.modal-content h2 {
  margin: 0 0 1rem 0;
  color: #fff;
  font-size: 1.5rem;
}

.modal-content p {
  margin: 0.75rem 0;
  color: #e0e0e0;
}

.modal-content input {
  width: 100%;
  padding: 0.75rem;
  background: #1a1a1a;
  border: 1px solid #404040;
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 0.95rem;
  box-sizing: border-box;
  margin: 0.75rem 0;
}

.modal-content input:focus {
  outline: none;
  border-color: #5a5aff;
}

.item-preview {
  background: #1a1a1a;
  padding: 0.75rem;
  border-radius: 4px;
  border-left: 3px solid #5a5aff;
  font-style: italic;
  color: #aaa;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
}

.modal-actions .btn-save,
.modal-actions .btn-cancel,
.modal-actions .btn-delete {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.modal-actions .btn-save {
  background: #4CAF50;
  color: white;
}

.modal-actions .btn-save:hover {
  background: #66BB6A;
}

.modal-actions .btn-delete {
  background: #ff4444;
  color: white;
}

.modal-actions .btn-delete:hover {
  background: #ff6666;
}

.modal-actions .btn-cancel {
  background: #666;
  color: white;
}

.modal-actions .btn-cancel:hover {
  background: #777;
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