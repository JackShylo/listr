<template>
  <nav class="navbar sidebar" :class="{ collapsed: !navbarOpen }">
    <div class="sidebar-header">
      <h1>🫨 Listr 🫨</h1>
    </div>

    <ul class="lists-menu">
      <li 
        v-for="category in categories" 
        :key="category.id"
        class="category-group"
      >
        <div class="category-header" @click="toggleCategory(category.id)">
          <span 
            class="category-name"
            :style="{ borderLeftColor: category.color }"
          >
            {{ category.name }}
          </span>
          <span class="category-count">({{ getListsByCategory(category.id).length }})</span>
          <span class="category-add">
            <button class="btn-create" @click="showCreateModal = true" title="Create new list" :disabled="lists.length >= 8">
              +
            </button>
          </span>
        </div>

        <ul v-if="expandedCategories.includes(category.id)" class="category-lists">
          <li 
            v-for="list in getListsByCategory(category.id)" 
            :key="list.id"
            :class="['list-item', { active: isActive(list.id), dragging: draggedListId === list.id, dragover: dragoverListId === list.id }]"
            draggable="true"
            @dragstart="startDrag(list, category.id)"
            @dragend="endDrag"
            @dragover="handleDragOver($event, list.id)"
            @dragleave="dragoverListId = null"
            @drop="handleDrop(list, category.id)"
          >
            <div class="list-item-wrapper">
              <button class="list-link" @click="selectList(list.id)">
                <span 
                  class="category-name"
                  :style="{ borderLeftColor: category.color }"
                >
                  {{ list.name }}
                </span>
                <span class="item-count">({{ list.items.length }})</span>
              </button>
              
              <div class="kebab-menu-container">
                <button 
                  class="kebab-button" 
                  @click.stop="toggleMenu(list.id)"
                  title="List options"
                >
                ⋮
                </button>
                
                <div v-if="openMenuId === list.id" class="kebab-dropdown" @click.stop>
                  <button 
                    class="menu-option rename-option"
                    @click="startEdit(list)"
                  >
                    ✎ Edit
                  </button>
                  <button 
                    class="menu-option delete-option"
                    @click="startDelete(list)"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>


          </li>
        </ul>
      </li>
    </ul>

    <div class="sidebar-footer">
      <div class="footer-info">
        <p v-if="lists.length >= 8" class="limit-warning">✓ Max lists reached</p>
        <p class="list-count">{{ lists.length }}/8 lists</p>
      </div>
    </div>
  </nav>

  <transition name="fade">
    <Modal
      v-model="showCreateModal"
      :action="'Create'"
      :title="'Create New List'"
      :selectedCategoryId="selectedCategoryId"
      @confirm="createList"
      @cancel="cancelCreate"
    />
  </transition>

  <transition name="fade">
    <Modal
      v-model="showModal"
      :action="'Edit'"
      :title="'Edit List'"
      @confirm="handleUpdate"
      @cancel="handleCancel"
      />
    </transition>

  <transition name="fade">
    <Modal 
      v-model="showDeleteConfirm" 
      :action="'Delete'"
      :title="'Delete List?'"
      :message="`Are you sure you want to delete ${listToDelete?.name}? This cannot be undone.`"
      @delete="confirmDelete"
      />
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import { listStore } from '../stores/listStore';
import Modal from './Modal.vue';

const showCreateModal= ref(false);
const newListName = ref('');
const errorMessage = ref('');
const openMenuId = ref(null);
const renamingListId = ref(null);
const renamingListName = ref('');
const showDeleteConfirm = ref(false);
const listToDelete = ref(null);
const expandedCategories = ref([1, 2, 3, 4]);
const selectedCategoryId = ref(1);
const changingCategoryListId = ref(null);
const changingCategoryId = ref(null);
const draggedListId = ref(null);
const draggedCategoryId = ref(null);
const dragoverListId = ref(null);
const navbarOpen = ref(window.innerWidth > 768);
const showModal = ref(false)

const handleUpdate = (updatedItem) => {
  const list = lists.value.findIndex(l => l.id === renamingListId.value)
  if (list !== -1) {
    listStore.updateList(renamingListId.value, updatedItem.title, updatedItem.categoryId);
  }
  renamingListId.value = null;
  renamingListName.value = '';
}

const handleCancel = () => {
  showModal.value = false;
  renamingListId.value = null;
  renamingListName.value = '';
  showDeleteConfirm.value = false;
  listToDelete.value = null;
};

const lists = computed(() => listStore.lists);
const categories = computed(() => listStore.categories);

const isActive = (id) => listStore.currentListId === id;

const getListsByCategory = (categoryId) => {
  return listStore.getListsByCategory(categoryId);
};

const toggleCategory = (categoryId) => {
  const index = expandedCategories.value.indexOf(categoryId);
  if (index > -1) {
    expandedCategories.value.splice(index, 1);
  } else {
    expandedCategories.value.push(categoryId);
  }
};

const selectList = (id) => {
  listStore.setCurrentList(id);
  openMenuId.value = null;
  if (window.innerWidth <= 768) {
    navbarOpen.value = false;
  }
};

const toggleMenu = (id) => {
  openMenuId.value = openMenuId.value === id ? null : id;
};

const startEdit = (list) => {
  renamingListId.value = list.id;
  renamingListName.value = list.name;
  openMenuId.value = null;
  showModal.value = true;
};

const startDelete = (list) => {
  listToDelete.value = list;
  showDeleteConfirm.value = true;
  openMenuId.value = null;
};

const confirmDelete = () => {
  if (listToDelete.value) {
    listStore.deleteList(listToDelete.value.id);
    showDeleteConfirm.value = false;
    listToDelete.value = null;
  }
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
  
  listStore.createList(newListName.value, selectedCategoryId.value);
  newListName.value = '';
  showCreateModal.value = false;
};

const cancelCreate = () => {
  newListName.value = '';
  showCreateModal.value = false;
  errorMessage.value = '';
  selectedCategoryId.value = 1;
};

const startDrag = (list, categoryId) => {
  draggedListId.value = list.id;
  draggedCategoryId.value = categoryId;
};

const endDrag = () => {
  draggedListId.value = null;
  draggedCategoryId.value = null;
  dragoverListId.value = null;
};

const handleDragOver = (event, targetListId) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  dragoverListId.value = targetListId;
};

const handleDrop = (targetList, targetCategoryId) => {
  if (draggedListId.value === null) return;
  
  const sourceListId = draggedListId.value;
  const sourceCategoryId = draggedCategoryId.value;
  
  // Don't reorder if dropping on itself
  if (sourceListId === targetList.id) {
    endDrag();
    return;
  }
  
  // Reorder lists within the same category or between categories
  listStore.reorderList(sourceListId, targetList.id, sourceCategoryId, targetCategoryId);
  
  endDrag();
};
</script>

<style scoped>
.navbar.sidebar {
    flex: 1;
    background: #2a2a2a;
    border-right: 1px solid #404040;
    display: flex;
    flex-direction: column;
    height: 100vh;
    color: #e0e0e0;
    padding: 0;
    transition: transform 0.3s ease, width 0.3s ease;
}

.navbar.sidebar.collapsed {
    transform: translateX(-100%);
    position: absolute;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 100;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.5);
}

.sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    background: #1a1a1a;
    border-bottom: 1px solid #404040;
    gap: 0.5rem;
}

.sidebar-header h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #fff;
    flex: 1;
    text-align: center;
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

.category-select {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.category-select label {
    font-size: 0.85rem;
    color: #999;
    font-weight: 500;
}

.category-select select {
    padding: 0.5rem;
    background: #2a2a2a;
    border: 1px solid #404040;
    border-radius: 4px;
    color: #e0e0e0;
    font-size: 0.9rem;
    cursor: pointer;
}

.category-select select:focus {
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

button {
  padding: 0.5rem 1rem;
  background: #5a5aff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
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

.category-group {
    list-style: none;
    padding: 0;
    margin: 0;
    border-bottom: 1px solid #333;
}

.category-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: #1a1a1a;
    border-bottom: 1px solid #333;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
}

.category-header:hover {
    background: #252525;
}

.category-toggle {
    display: inline-block;
    width: 16px;
    text-align: center;
    color: #888;
    transition: transform 0.2s;
    font-size: 0.8rem;
}

.category-toggle.expanded {
    transform: rotate(90deg);
}

.category-name {
    flex: 1;
    font-weight: 600;
    font-size: 0.9rem;
    color: #fff;
    border-left: 3px solid #5a5aff;
    padding-left: 0.5rem;
}

.category-count {
    font-size: 0.75rem;
    color: #888;
}

.category-lists {
    list-style: none;
    padding: 0;
    margin: 0;
    background: #1a1a1a;
}

.list-item {
    border-bottom: 1px solid #333;
    transition: all 0.2s ease;
}

.list-item.dragging {
    opacity: 0.5;
    background: rgba(90, 90, 255, 0.1);
}

.list-item.dragover {
    background: rgba(90, 90, 255, 0.2);
    border-top: 2px solid #5a5aff;
    padding-top: 0.25rem;
}

.list-item-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
}

.list-link {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;
    padding: 0.5rem;
    background: none;
    border: none;
    color: #e0e0e0;
    text-align: left;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 0.95rem;
    min-width: 0;
}

.list-item:not(.active) .list-link:hover {
    background: #3a3a3a;
    color: #fff;
    border-radius: 4px;
}

.list-item.active .list-link {
    background: #5a5aff;
    color: white;
    border-radius: 4px;
    font-weight: bold;
}

.kebab-menu-container {
    position: relative;
    flex-shrink: 0;
}

.kebab-button {
    width: 28px;
    height: 28px;
    padding: 0;
    background: none;
    border: none;
    color: #999;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
    opacity: 0;
}

.list-item:hover .kebab-button {
    opacity: 1;
    color: #e0e0e0;
}

.kebab-button:hover {
    background: #404040;
    color: #fff;
}

.kebab-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: #333;
    border: 1px solid #404040;
    border-radius: 4px;
    min-width: 150px;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.menu-option {
    display: block;
    width: 100%;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    color: #e0e0e0;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
    border-bottom: 1px solid #404040;
}

.menu-option:last-child {
    border-bottom: none;
}

.menu-option:hover {
    background: #404040;
    color: #fff;
}

.menu-option.delete-option:hover {
    background: rgba(255, 68, 68, 0.2);
    color: #ff6b6b;
}

.rename-form {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #1a1a1a;
    border-top: 1px solid #404040;
    align-items: center;
}

.rename-form input {
    flex: 1;
    padding: 0.5rem;
    background: #2a2a2a;
    border: 1px solid #404040;
    border-radius: 3px;
    color: #e0e0e0;
    font-size: 0.9rem;
}

.rename-form input:focus {
    outline: none;
    border-color: #5a5aff;
}

.rename-form .btn-save {
    padding: 0.5rem 0.75rem;
    background: #5a5aff;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
}

.rename-form .btn-save:hover {
    background: #7575ff;
}

.rename-form .btn-cancel {
    padding: 0.5rem 0.75rem;
    background: #404040;
    color: #e0e0e0;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
}

.rename-form .btn-cancel:hover {
    background: #505050;
}

.change-category-form {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #1a1a1a;
    border-top: 1px solid #404040;
    align-items: center;
}

.change-category-form select {
    flex: 1;
    padding: 0.5rem;
    background: #2a2a2a;
    border: 1px solid #404040;
    border-radius: 3px;
    color: #e0e0e0;
    font-size: 0.9rem;
    cursor: pointer;
}

.change-category-form select:focus {
    outline: none;
    border-color: #5a5aff;
}

.change-category-form .btn-save {
    padding: 0.5rem 0.75rem;
    background: #5a5aff;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
}

.change-category-form .btn-save:hover {
    background: #7575ff;
}

.change-category-form .btn-cancel {
    padding: 0.5rem 0.75rem;
    background: #404040;
    color: #e0e0e0;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
}

.rename-form .btn-cancel:hover {
    background: #505050;
}

.delete-confirmation-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.delete-confirmation {
    background: #2a2a2a;
    border: 1px solid #404040;
    border-radius: 8px;
    padding: 2rem;
    max-width: 400px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
    animation: popIn 0.3s ease-out;
}

@keyframes popIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.delete-confirmation h3 {
    margin: 0 0 1rem 0;
    color: #ff6b6b;
    font-size: 1.2rem;
}

.delete-confirmation p {
    margin: 0 0 1.5rem 0;
    color: #e0e0e0;
    font-size: 0.95rem;
}

.confirmation-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.confirmation-actions .btn-cancel {
    padding: 0.75rem 1.5rem;
    background: #404040;
    color: #e0e0e0;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s;
}

.confirmation-actions .btn-cancel:hover {
    background: #505050;
}

.confirmation-actions .btn-delete {
    padding: 0.75rem 1.5rem;
    background: #ff6b6b;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s;
}

.confirmation-actions .btn-delete:hover {
    background: #ff5252;
}

.fade-enter-active, .fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from, .fade-leave-to {
    opacity: 0;
}

.item-count {
    font-size: 0.8rem;
    opacity: 0.8;
}

.sidebar-footer {
    padding: 1rem;
    background: #1a1a1a;
    border-top: 1px solid #404040;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
}

.footer-info {
    width: 100%;
}

.list-count {
    margin: 0;
    font-size: 0.85rem;
    color: #888;
    text-align: center;
}

.limit-warning {
    margin: 0 0 0.5rem 0;
    font-size: 0.8rem;
    color: #4CAF50;
    text-align: center;
    font-weight: bold;
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

.navbar-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 98;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    display: none;
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

.modal-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
}

.modal-actions .btn-save,
.modal-actions .btn-cancel,
.modal-actions .btn-delete {
    margin: 0.5rem;
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
    margin: 0.5rem;
  background: #666;
  color: white;
}

.modal-actions .btn-cancel:hover {
  background: #777;
}


@media (max-width: 768px) {
    .navbar-backdrop {
        display: block;
    }

    .navbar.sidebar:not(.collapsed) .navbar-backdrop {
        opacity: 0;
        pointer-events: none;
    }

    .navbar.sidebar.collapsed .navbar-backdrop {
        opacity: 1;
        pointer-events: auto;
    }

    .navbar.sidebar {
        position: fixed;
        left: 0;
        top: 0;
        width: 250px;
        height: 100vh;
        z-index: 99;
        transform: translateX(0);
    }

    .navbar.sidebar.collapsed {
        transform: translateX(-100%);
    }

    .sidebar-header h1 {
        font-size: 1.25rem;
    }
}

@media (max-width: 480px) {
    .navbar.sidebar {
        width: 100%;
    }

    .sidebar-header {
        padding: 1rem;
    }

    .sidebar-header h1 {
        font-size: 1.1rem;
    }

    .btn-create {
        width: 32px;
        height: 32px;
        font-size: 1rem;
    }
}
</style>
