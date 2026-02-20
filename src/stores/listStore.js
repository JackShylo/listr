import { reactive } from 'vue';

export const listStore = reactive({
  lists: [
    { id: 1, name: 'Shopping', items: ['Milk', 'Eggs', 'Bread'] },
    { id: 2, name: 'Work', items: ['Email clients', 'Complete report'] },
    { id: 3, name: 'Personal', items: ['Call mom', 'Gym'] },
    { id: 4, name: 'Projects', items: ['Finish Vue app', 'Review code'] },
    { id: 5, name: 'Reading', items: ['JavaScript Book', 'Vue Guide'] },
    { id: 6, name: 'Hobbies', items: ['Play guitar', 'Photography'] },
    { id: 7, name: 'Home', items: ['Clean kitchen', 'Fix door'] },
    { id: 8, name: 'Travel', items: ['Book hotel', 'Plan itinerary'] }
  ],
  currentListId: 1,
  nextId: 9,

  getCurrentList() {
    return this.lists.find(list => list.id === this.currentListId);
  },

  setCurrentList(id) {
    if (this.lists.find(list => list.id === id)) {
      this.currentListId = id;
    }
  },

  createList(name) {
    const newList = {
      id: this.nextId++,
      name,
      items: []
    };
    if (this.lists.length < 8) {
      this.lists.push(newList);
      this.currentListId = newList.id;
      return newList;
    }
    return null;
  },

  updateList(id, name) {
    const list = this.lists.find(list => list.id === id);
    if (list) {
      list.name = name;
    }
  },

  deleteList(id) {
    if (this.lists.length > 1) {
      this.lists = this.lists.filter(list => list.id !== id);
      if (this.currentListId === id) {
        this.currentListId = this.lists[0].id;
      }
    }
  },

  addItem(listId, item) {
    const list = this.lists.find(list => list.id === listId);
    if (list) {
      list.items.push(item);
    }
  },

  removeItem(listId, index) {
    const list = this.lists.find(list => list.id === listId);
    if (list) {
      list.items.splice(index, 1);
    }
  },

  updateItem(listId, index, newText) {
    const list = this.lists.find(list => list.id === listId);
    if (list && index >= 0 && index < list.items.length) {
      list.items[index] = newText;
    }
  }
});
