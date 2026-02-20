<template>
  <div class="list-manager">
    <Navbar />
    <main class="main-content">
      <div v-if="currentList" class="list-detail">
        <div class="list-header">
          <h1>{{ currentList.name }}</h1>
          <div class="list-actions">
            <button class="btn-edit" @click="startEditName">Edit</button>
            <button class="btn-delete" @click="deleteCurrentList">Delete</button>
          </div>
        </div>

        <div v-if="showEditName" class="edit-name">
          <input v-model="editedName" placeholder="List name" />
          <button @click="saveName">Save</button>
          <button @click="cancelEdit">Cancel</button>
        </div>

        <div class="add-item">
          <input 
            v-model="newItem" 
            placeholder="Add a new item..."
            @keyup.enter="addItem"
          />
          <button @click="addItem">Add</button>
        </div>

        <ul class="items-list">
          <li v-for="(item, index) in currentList.items" :key="index" class="item">
            <div v-if="editingIndex === index" class="edit-item">
              <input v-model="editedItem" placeholder="Edit item" />
              <button class="btn-save" @click="saveItem(index)">Save</button>
              <button class="btn-cancel" @click="cancelEditItem">Cancel</button>
            </div>
            <div v-else class="item-display">
              <span @click="startEditItem(index)" class="item-text">{{ item }}</span>
              <button class="btn-remove" @click="removeItem(index)">✕</button>
            </div>
          </li>
        </ul>

        <p v-if="currentList.items.length === 0" class="empty-state">
          No items yet. Add one to get started!
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { listStore } from '../stores/listStore';
import Navbar from './Navbar.vue';

const newItem = ref('');
const showEditName = ref(false);
const editedName = ref('');
const editingIndex = ref(null);
const editedItem = ref('');

const currentList = computed(() => listStore.getCurrentList());

const addItem = () => {
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
  editedItem.value = currentList.value.items[index];
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
</script>

<style scoped>
.list-manager {
  display: flex;
  height: 100vh;
  background: #1a1a1a;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  color: #e0e0e0;
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
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.add-item input {
  flex: 1;
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

.items-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #2a2a2a;
  border: 1px solid #404040;
  border-radius: 4px;
  margin-bottom: 0.75rem;
  transition: all 0.3s;
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

.item-text {
  flex: 1;
  color: #e0e0e0;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 2px;
  transition: all 0.3s;
}

.item-text:hover {
  background: #3a3a3a;
  color: #fff;
}

.edit-item {
  display: flex;
  width: 100%;
  gap: 0.5rem;
}

.edit-item input {
  flex: 1;
  padding: 0.5rem;
  background: #1a1a1a;
  border: 1px solid #5a5aff;
  border-radius: 3px;
  color: #e0e0e0;
  font-size: 0.95rem;
}

.edit-item input:focus {
  outline: none;
  border-color: #7575ff;
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

@media (max-width: 768px) {
  .list-manager {
    flex-direction: column;
  }
}
</style>

<style scoped>
.list-manager {
  display: flex;
  height: 100vh;
  background: #1a1a1a;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  color: #e0e0e0;
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
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.add-item input {
  flex: 1;
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

.items-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #2a2a2a;
  border: 1px solid #404040;
  border-radius: 4px;
  margin-bottom: 0.75rem;
  transition: all 0.3s;
}

.item:hover {
  background: #333333;
  border-color: #505050;
}

.item span {
  color: #e0e0e0;
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

@media (max-width: 768px) {
  .list-manager {
    flex-direction: column;
  }
}
</style>
