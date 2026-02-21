import { reactive } from 'vue';

export const listStore = reactive({
  categories: [
    { id: 1, name: 'Work', color: '#5a5aff' },
    { id: 2, name: 'Personal', color: '#ff6b9d' },
    { id: 3, name: 'Home', color: '#4ecdc4' },
    { id: 4, name: 'Other', color: '#95e1d3' }
  ],
  lists: [
    { id: 1, name: 'Shopping', categoryId: 3, items: [{ text: 'Milk', notes: '' }, { text: 'Eggs', notes: '' }, { text: 'Bread', notes: '' }] },
    { id: 2, name: 'Work', categoryId: 1, items: [{ text: 'Email clients', notes: '' }, { text: 'Complete report', notes: '' }] },
    { id: 3, name: 'Personal', categoryId: 2, items: [{ text: 'Call mom', notes: '' }, { text: 'Gym', notes: '' }] },
    { id: 4, name: 'Projects', categoryId: 1, items: [{ text: 'Finish Vue app', notes: '' }, { text: 'Review code', notes: '' }] },
    { id: 5, name: 'Reading', categoryId: 2, items: [{ text: 'JavaScript Book', notes: '' }, { text: 'Vue Guide', notes: '' }] },
    { id: 6, name: 'Hobbies', categoryId: 2, items: [{ text: 'Play guitar', notes: '' }, { text: 'Photography', notes: '' }] },
    { id: 7, name: 'Home', categoryId: 3, items: [{ text: 'Clean kitchen', notes: '' }, { text: 'Fix door', notes: '' }] },
    { id: 8, name: 'Travel', categoryId: 4, items: [{ text: 'Book hotel', notes: '' }, { text: 'Plan itinerary', notes: '' }] }
  ],
  currentListId: 1,
  nextId: 9,
  nextCategoryId: 5,

  getCurrentList() {
    return this.lists.find(list => list.id === this.currentListId);
  },

  setCurrentList(id) {
    if (this.lists.find(list => list.id === id)) {
      this.currentListId = id;
    }
  },

  createList(name, categoryId = 4) {
    const newList = {
      id: this.nextId++,
      name,
      categoryId,
      items: []
    };
    if (this.lists.length < 8) {
      this.lists.push(newList);
      this.currentListId = newList.id;
      return newList;
    }
    return null;
  },

  updateList(id, name, categoryId = null) {
    const list = this.lists.find(list => list.id === id);
    if (list) {
      list.name = name;
      if (categoryId !== null) {
        list.categoryId = categoryId;
      }
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
  },

  getCategory(categoryId) {
    return this.categories.find(cat => cat.id === categoryId);
  },

  getListsByCategory(categoryId) {
    return this.lists.filter(list => list.categoryId === categoryId);
  },

  createCategory(name, color = '#95e1d3') {
    const newCategory = {
      id: this.nextCategoryId++,
      name,
      color
    };
    this.categories.push(newCategory);
    return newCategory;
  },

  updateCategory(id, name, color) {
    const category = this.categories.find(cat => cat.id === id);
    if (category) {
      category.name = name;
      category.color = color;
    }
  },

  deleteCategory(id) {
    // Don't delete if it's the last category
    if (this.categories.length <= 1) return false;
    
    // Move all lists in this category to "Other" (usually the last category)
    const otherCategory = this.categories[this.categories.length - 1];
    this.lists.forEach(list => {
      if (list.categoryId === id) {
        list.categoryId = otherCategory.id;
      }
    });
    
    this.categories = this.categories.filter(cat => cat.id !== id);
    return true;
  }
});
