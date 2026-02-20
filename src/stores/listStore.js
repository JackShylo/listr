import { reactive } from 'vue';

export const listStore = reactive({
  lists: [
    { id: 1, name: 'Shopping', items: [{ text: 'Milk', notes: '' }, { text: 'Eggs', notes: '' }, { text: 'Bread', notes: '' }] },
    { id: 2, name: 'Work', items: [{ text: 'Email clients', notes: '' }, { text: 'Complete report', notes: '' }] },
    { id: 3, name: 'Personal', items: [{ text: 'Call mom', notes: '' }, { text: 'Gym', notes: '' }] },
    { id: 4, name: 'Projects', items: [{ text: 'Finish Vue app', notes: '' }, { text: 'Review code', notes: '' }] },
    { id: 5, name: 'Reading', items: [{ text: 'JavaScript Book', notes: '' }, { text: 'Vue Guide', notes: '' }] },
    { id: 6, name: 'Hobbies', items: [{ text: 'Play guitar', notes: '' }, { text: 'Photography', notes: '' }] },
    { id: 7, name: 'Home', items: [{ text: 'Clean kitchen', notes: '' }, { text: 'Fix door', notes: '' }] },
    { id: 8, name: 'Travel', items: [{ text: 'Book hotel', notes: '' }, { text: 'Plan itinerary', notes: '' }] }
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
      list.items.push({ text: item, notes: '' });
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
      list.items[index].text = newText;
    }
  },

  updateItemNotes(listId, index, notes) {
    const list = this.lists.find(list => list.id === listId);
    if (list && index >= 0 && index < list.items.length) {
      list.items[index].notes = notes;
    }
  }
});
