<template>
  <div class="modal-overlay">
    <div class="modal-content" @click.stop>
      <input 
        placeholder="List name..."
        @keyup.enter=""
        @keyup.escape=""
        autofocus
      />
      <div class="modal-actions">
        <button class="btn-save" @click="">Save</button>
        <button class="btn-cancel" @click="">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
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
</style>