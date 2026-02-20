<template>
  <nav class="navbar sidebar">
    <div class="sidebar-header">
      <h1>Listr</h1>
      <button class="btn-create" @click="showCreateForm = true" title="Create new list" :disabled="lists.length >= 8">
        +
      </button>
    </div>

    <div v-if="showCreateForm" class="create-form">
      <input 
        v-model="newListName" 
        placeholder="List name..."
        @keyup.enter="createList"
        autofocus
      />
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <button @click="createList">Create</button>
      <button @click="cancelCreate">Cancel</button>
    </div>

    <ul class="lists-menu">
      <li 
        v-for="list in lists" 
        :key="list.id"
        :class="['list-item', { active: isActive(list.id) }]"
      >
        <button class="list-link" @click="selectList(list.id)">
          {{ list.name }}
          <span class="item-count">({{ list.items.length }})</span>
        </button>
      </li>
    </ul>

    <div class="sidebar-footer">
      <p v-if="lists.length >= 8" class="limit-warning">✓ Max lists reached</p>
      <p class="list-count">{{ lists.length }}/8 lists</p>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue';
import { listStore } from '../stores/listStore';

const showCreateForm = ref(false);
const newListName = ref('');
const errorMessage = ref('');

const lists = computed(() => listStore.lists);

const isActive = (id) => listStore.currentListId === id;

const selectList = (id) => {
  listStore.setCurrentList(id);
};

const createList = () => {
  errorMessage.value = '';
  
  if (!newListName.value.trim()) {
    errorMessage.value = 'List name cannot be empty';
    return;
  }
  
  if (listStore.lists.length >= 8) {
    errorMessage.value = 'Maximum 8 lists allowed';
    return;
  }
  
  listStore.createList(newListName.value);
  newListName.value = '';
  showCreateForm.value = false;
};

const cancelCreate = () => {
  newListName.value = '';
  showCreateForm.value = false;
  errorMessage.value = '';
};
</script>

<style scoped>
.navbar.sidebar {
    width: 250px;
    background: #2a2a2a;
    border-right: 1px solid #404040;
    display: flex;
    flex-direction: column;
    height: 100vh;
    color: #e0e0e0;
    padding: 0;
}

.sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    background: #1a1a1a;
    border-bottom: 1px solid #404040;
}

.sidebar-header h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #fff;
    flex: 1;
}

.btn-create {
    width: 36px;
    height: 36px;
    padding: 0;
    background: #5a5aff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-create:hover {
    background: #7575ff;
}

.btn-create:disabled {
    background: #999;
    cursor: not-allowed;
    opacity: 0.6;
}

.btn-create:disabled:hover {
    background: #999;
}

.create-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    background: #1a1a1a;
    border-bottom: 1px solid #404040;
}

.create-form input {
    padding: 0.75rem;
    background: #2a2a2a;
    border: 1px solid #404040;
    border-radius: 4px;
    color: #e0e0e0;
    font-size: 0.9rem;
}

.create-form input:focus {
    outline: none;
    border-color: #5a5aff;
}

.error-message {
    color: #ff4444;
    font-size: 0.85rem;
    padding: 0.5rem;
    background: rgba(255, 68, 68, 0.1);
    border-radius: 3px;
    border-left: 3px solid #ff4444;
}

.create-form button {
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s;
    font-size: 0.9rem;
}

.create-form button:first-of-type {
    background: #5a5aff;
    color: white;
}

.create-form button:first-of-type:hover {
    background: #7575ff;
}

.create-form button:last-of-type {
    background: #404040;
    color: #e0e0e0;
}

.create-form button:last-of-type:hover {
    background: #505050;
}

.lists-menu {
    list-style: none;
    padding: 0;
    margin: 0;
    flex: 1;
    overflow-y: auto;
}

.list-item {
    border-bottom: 1px solid #333;
}

.list-link {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 1rem 1.5rem;
    background: none;
    border: none;
    color: #e0e0e0;
    text-align: left;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 0.95rem;
}

.list-link:hover {
    background: #3a3a3a;
    color: #fff;
}

.list-item.active .list-link {
    background: #5a5aff;
    color: white;
 

.limit-warning {
    margin: 0 0 0.5rem 0;
    font-size: 0.8rem;
    color: #4CAF50;
    text-align: center;
    font-weight: bold;
}   font-weight: bold;
}

.item-count {
    font-size: 0.8rem;
    opacity: 0.8;
}

.sidebar-footer {
    padding: 1rem 1.5rem;
    background: #1a1a1a;
    border-top: 1px solid #404040;
}

.list-count {
    margin: 0;
    font-size: 0.85rem;
    color: #888;
    text-align: center;
}

/* Scrollbar styling */
.lists-menu::-webkit-scrollbar {
    width: 6px;
}

.lists-menu::-webkit-scrollbar-track {
    background: #2a2a2a;
}

.lists-menu::-webkit-scrollbar-thumb {
    background: #404040;
    border-radius: 3px;
}

.lists-menu::-webkit-scrollbar-thumb:hover {
    background: #505050;
}
</style>