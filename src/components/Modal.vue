<template>
  <div v-if="modelValue" class="modal-overlay">
    <div class="modal-content">
      <h3>{{ props.title }}</h3> 
      
      <!-- List Name Input (Create List & Edit List) -->
      <input 
        v-model="formData.title"
        v-if="['Create', 'Edit'].includes(props.action)"
        placeholder="List name..."
        autofocus
      />
      
      <!-- Item Text Input (Edit Item) -->
      <input 
        v-model="formData.title"
        v-if="props.action === 'EditItem'"
        placeholder="Edit item..."
        maxlength="32"
        autofocus
      />
      <span v-if="props.action === 'EditItem'" class="char-count">{{ formData.title.length }}/32</span>
      
      <!-- Category Select (Create & Edit List) -->
      <div v-if="['Create', 'Edit'].includes(props.action)" class="category-select">
        <label>Category:</label>
        <select v-model.number="formData.categoryId">
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>
      
      <!-- Confirmation Message (Delete & Clone item, Delete list) -->
      <p v-if="['Delete', 'CloneItem', 'DeleteItem'].includes(props.action)">{{ props.message }}</p>
      
      <!-- Item Preview (Clone & Delete item) -->
      <p v-if="['CloneItem', 'DeleteItem'].includes(props.action)" class="item-preview">
        {{ formData.title }}
      </p>
      
      <div class="modal-actions">
        <!-- List Actions -->
        <button v-if="props.action === 'Create'" @click="onCreate" class="btn-save">Create</button>
        <button v-if="props.action === 'Edit'" @click="onSave" class="btn-save">Save</button>
        <button v-if="props.action === 'Delete'" @click="onDelete" class="btn-delete">Delete</button>
        
        <!-- Item Actions -->
        <button v-if="props.action === 'EditItem'" @click="onSaveItem" class="btn-save">Save</button>
        <button v-if="props.action === 'CloneItem'" @click="onClone" class="btn-save">Clone</button>
        <button v-if="props.action === 'DeleteItem'" @click="onDeleteItem" class="btn-delete">Delete</button>
        
        <button @click="onCancel" class="btn-cancel">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { listStore } from '../stores/listStore';

const props = defineProps({
  modelValue: Boolean,
  action: String,
  title: {
    type: String,
    default: 'Default Title',
  },
  message: {
    type: String,
    default: '',
  },
  item: {
    type: Object,
    default: null,
  },
  selectedCategoryId: {
    type: Number,
    default: 1,
  },
});

const categories = computed(() => listStore.categories);

// Form data that resets for each action
const formData = ref({
  title: '',
  categoryId: 1,
});

// Initialize form data when modal opens or item changes
watch(
  () => [props.modelValue, props.item, props.action],
  ([isOpen, item, action]) => {
    if (isOpen) {
      if (action === 'Create') {
        formData.value = {
          title: '',
          categoryId: props.selectedCategoryId || 1,
        };
      } else if (action === 'Edit' && item) {
        formData.value = {
          title: item.name || '',
          categoryId: item.categoryId || props.selectedCategoryId || 1,
        };
      } else if (['EditItem', 'CloneItem', 'DeleteItem'].includes(action) && item) {
        formData.value = {
          title: item.text || item.name || '',
        };
      }
    }
  },
  { immediate: true }
);

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'delete', 'clone']);

const onCreate = () => {
  if (formData.value.title.trim()) {
    emit('confirm', {
      title: formData.value.title,
      categoryId: formData.value.categoryId,
    });
    emit('update:modelValue', false);
  }
};

const onSave = () => {
  if (formData.value.title.trim()) {
    emit('confirm', {
      title: formData.value.title,
      categoryId: formData.value.categoryId,
    });
    emit('update:modelValue', false);
  }
};

const onSaveItem = () => {
  if (formData.value.title.trim()) {
    emit('confirm', {
      title: formData.value.title,
    });
    emit('update:modelValue', false);
  }
};

const onDelete = () => {
  emit('delete');
  emit('update:modelValue', false);
};

const onDeleteItem = () => {
  emit('delete');
  emit('update:modelValue', false);
};

const onClone = () => {
  emit('clone');
  emit('update:modelValue', false);
};

const onCancel = () => {
  emit('cancel');
  emit('update:modelValue', false);
};
</script>

<style scoped>
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

.modal-content h3 {
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

.category-select {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
}
.category-select label {
  margin-bottom: 0.5rem;
  color: #e0e0e0;
}
.category-select select {
  padding: 0.5rem;
  background: #1a1a1a;
  border: 1px solid #404040;
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 0.95rem;
}

.item-preview {
  background: #1a1a1a;
  padding: 0.75rem;
  border-radius: 4px;
  border-left: 3px solid #5a5aff;
  font-style: italic;
  color: #aaa;
}

.char-count {
  font-size: 0.75rem;
  color: #888;
  margin-top: -0.5rem;
  margin-bottom: 0.5rem;
}

</style>