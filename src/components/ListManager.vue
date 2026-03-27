<template>
  <main class="main-content">
    <div class="content-wrapper">
      <div class="list-content">
        <div v-if="currentList">
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
                @click="toggleCompleted(index)"
              >
                <div class="item-display">
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
                      <button class="menu-item" @click="startEditItem(index)">✏️ Edit</button>
                      <button class="menu-item" @click="startCloneItem(index)">📋 Clone</button>
                      <button class="menu-item" @click="togglePin(index)">{{ isItemPinned(index) ? '📌 Unpin' : '📌 Pin' }}</button>
                      <button class="menu-item delete" @click="startDeleteItem(index)">🗑️ Delete</button>
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

      <!-- Item Action Modal -->
      <Modal
        v-model="modalOpen"
        :action="modalAction"
        :title="modalTitle"
        :message="modalMessage"
        :item="modalItem"
        @confirm="handleModalConfirm"
        @delete="handleModalDelete"
        @clone="handleModalClone"
        @cancel="closeModal"
      />
    </main>
</template>

<script setup>
import { ref, computed } from 'vue';
import { listStore } from '../stores/firebaseStore';
import Modal from './Modal.vue';

const newItem = ref('');
const showEditName = ref(false);
const editedName = ref('');
const itemLimitMessage = ref('');

// Kebab menu state
const activeMenuIndex = ref(null);

// Unified Modal State
const modalOpen = ref(false);
const modalAction = ref('');
const modalTitle = ref('');
const modalMessage = ref('');
const modalItem = ref(null);
const modalItemIndex = ref(null);

// Swipe and long-press handling
const itemSwipe = ref({});
const touchStartX = ref(0);
const longPressTimer = ref(null);
const longPressDuration = 500; // 500ms for long press

const currentList = computed(() => listStore.getCurrentList());

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

// Unified Modal handlers
const openModal = (action, title, item, index, message = '') => {
  modalAction.value = action;
  modalTitle.value = title;
  modalItem.value = item;
  modalItemIndex.value = index;
  modalMessage.value = message;
  modalOpen.value = true;
  closeMenu();
};

const closeModal = () => {
  modalOpen.value = false;
  modalAction.value = '';
  modalTitle.value = '';
  modalMessage.value = '';
  modalItem.value = null;
  modalItemIndex.value = null;
};

const handleModalConfirm = (formData) => {
  if (modalAction.value === 'EditItem' && modalItemIndex.value !== null && formData.title.trim()) {
    listStore.updateItem(listStore.currentListId, modalItemIndex.value, formData.title);
  }
  closeModal();
};

const handleModalDelete = () => {
  if (modalItemIndex.value !== null) {
    removeItem(modalItemIndex.value);
  }
  closeModal();
};

const handleModalClone = () => {
  if (modalItemIndex.value !== null && currentList.value && currentList.value.items.length < 12) {
    const cloneText = currentList.value.items[modalItemIndex.value].text;
    listStore.addItem(listStore.currentListId, cloneText);
  } else if (currentList.value && currentList.value.items.length >= 12) {
    itemLimitMessage.value = 'Maximum 12 items allowed per list';
  }
  closeModal();
};

// Modal action shortcuts
const startEditItem = (index) => {
  const item = currentList.value.items[index];
  openModal('EditItem', 'Edit Item', item, index);
};

const startDeleteItem = (index) => {
  const item = currentList.value.items[index];
  openModal('DeleteItem', 'Delete Item', item, index, 'Are you sure you want to delete this item?');
};

const startCloneItem = (index) => {
  const item = currentList.value.items[index];
  openModal('CloneItem', 'Clone Item', item, index, 'Create a duplicate of this item?');
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