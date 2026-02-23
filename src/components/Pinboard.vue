<template>
  <div class="pinboard">
    <div class="pinboard-header">
      <h2>📌 Pinned</h2>
      <span v-if="pinnedItems.length > 0" class="pin-count">{{ pinnedItems.length }}</span>
    </div>

    <div class="pinboard-content">
      <div v-if="pinnedItems.length === 0" class="empty-pinboard">
        <p>No pinned items yet</p>
        <p class="hint">Pin items from any list to see them here</p>
      </div>

      <div v-else class="pinned-items">
        <div 
          v-for="(pinnedItem, index) in pinnedItems" 
          :key="`${pinnedItem.listId}-${pinnedItem.itemIndex}`"
          class="pinned-item"
        >
          <div class="pin-item-header">
            <span class="pin-list-name">{{ getListName(pinnedItem.listId) }}</span>
            <button 
              class="btn-unpin" 
              @click="unpinItem(pinnedItem.listId, pinnedItem.itemIndex)"
              title="Unpin item"
            >
              ✕
            </button>
          </div>
          <div class="pin-item-text">{{ pinnedItem.text }}</div>
          <div v-if="pinnedItem.notes" class="pin-item-notes">{{ pinnedItem.notes }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { listStore } from '../stores/listStore';

const pinnedItems = computed(() => listStore.getPinnedItems());

const getListName = (listId) => {
  const list = listStore.lists.find(l => l.id === listId);
  return list ? list.name : 'Unknown';
};

const unpinItem = (listId, itemIndex) => {
  listStore.unpinItem(listId, itemIndex);
};
</script>

<style scoped>
.pinboard {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #222222;
  border-left: 1px solid #404040;
  padding: 1rem;
  color: #e0e0e0;
  overflow: hidden;
}

.pinboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #404040;
  flex-shrink: 0;
}

.pinboard-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #fff;
}

.pin-count {
  background: #5a5aff;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
}

.pinboard-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.empty-pinboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #808080;
}

.empty-pinboard p {
  margin: 0.5rem 0;
}

.hint {
  font-size: 0.85rem;
  color: #606060;
}

.pinned-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pinned-item {
  background: #2a2a2a;
  border-left: 3px solid #5a5aff;
  padding: 1rem;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: background 0.2s, border-color 0.2s;
  word-break: break-word;
}

.pinned-item:hover {
  background: #303030;
}

.pin-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.pin-list-name {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #5a5aff;
  font-weight: 600;
  flex-shrink: 0;
}

.btn-unpin {
  background: transparent;
  border: none;
  color: #808080;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-unpin:hover {
  background: #ff6b9d;
  color: white;
}

.pin-item-text {
  font-size: 0.95rem;
  color: #e0e0e0;
  word-break: break-word;
}

.pin-item-notes {
  font-size: 0.8rem;
  color: #a0a0a0;
  font-style: italic;
  margin-top: 0.25rem;
  padding-top: 0.5rem;
  border-top: 1px solid #404040;
  word-break: break-word;
}

@media (max-width: 1024px) {
  .pinboard {
    border-left: none;
    border-top: 2px solid #404040;
  }
}
</style>