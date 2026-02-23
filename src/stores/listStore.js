import { reactive } from 'vue';

export const listStore = reactive({
  currentPage: 'lists', // 'lists' or 'settings'
  categories: [
    { id: 1, name: 'Work', color: '#5a5aff' },
    { id: 2, name: 'Personal', color: '#ff6b9d' },
    { id: 3, name: 'Home', color: '#4ecdc4' },
    { id: 4, name: 'Other', color: '#95e1d3' }
  ],
  lists: [
    { id: 1, name: 'Shopping', categoryId: 3, createdAt: new Date('2024-01-15T10:30:00').getTime(), items: [{ text: 'Milk', notes: '', createdAt: new Date('2024-01-15T10:30:00').getTime() }, { text: 'Eggs', notes: '', createdAt: new Date('2024-01-15T10:31:00').getTime() }, { text: 'Bread', notes: '', createdAt: new Date('2024-01-15T10:32:00').getTime() }] },
    { id: 2, name: 'Work', categoryId: 1, createdAt: new Date('2024-01-10T09:00:00').getTime(), items: [{ text: 'Email clients', notes: '', createdAt: new Date('2024-01-10T09:00:00').getTime() }, { text: 'Complete report', notes: '', createdAt: new Date('2024-01-10T09:15:00').getTime() }] },
    { id: 3, name: 'Personal', categoryId: 2, createdAt: new Date('2024-01-08T14:20:00').getTime(), items: [{ text: 'Call mom', notes: '', createdAt: new Date('2024-01-08T14:20:00').getTime() }, { text: 'Gym', notes: '', createdAt: new Date('2024-01-08T14:25:00').getTime() }] },
    { id: 4, name: 'Projects', categoryId: 1, createdAt: new Date('2024-01-12T11:45:00').getTime(), items: [{ text: 'Finish Vue app', notes: '', createdAt: new Date('2024-01-12T11:45:00').getTime() }, { text: 'Review code', notes: '', createdAt: new Date('2024-01-12T12:00:00').getTime() }] },
    { id: 5, name: 'Reading', categoryId: 2, createdAt: new Date('2024-01-09T16:10:00').getTime(), items: [{ text: 'JavaScript Book', notes: '', createdAt: new Date('2024-01-09T16:10:00').getTime() }, { text: 'Vue Guide', notes: '', createdAt: new Date('2024-01-09T16:30:00').getTime() }] },
    { id: 6, name: 'Hobbies', categoryId: 2, createdAt: new Date('2024-01-11T17:00:00').getTime(), items: [{ text: 'Play guitar', notes: '', createdAt: new Date('2024-01-11T17:00:00').getTime() }, { text: 'Photography', notes: '', createdAt: new Date('2024-01-11T17:20:00').getTime() }] },
    { id: 7, name: 'Home', categoryId: 3, createdAt: new Date('2024-01-14T08:30:00').getTime(), items: [{ text: 'Clean kitchen', notes: '', createdAt: new Date('2024-01-14T08:30:00').getTime() }, { text: 'Fix door', notes: '', createdAt: new Date('2024-01-14T09:00:00').getTime() }] },
  ],
  settings: {
    defaultCategory: 1,
    showCompletedItems: true,
    theme: 'dark'
  },
  currentListId: 1,
  nextId: 9,
  nextCategoryId: 5,
  pinnedItems: [],

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
      createdAt: Date.now(),
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
      list.items.push({ text: item, notes: '', createdAt: Date.now() });
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
  },

  goToSettings() {
    this.currentPage = 'settings';
  },

  goToLists() {
    this.currentPage = 'lists';
  },

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  },

  resetSettings() {
    this.settings = {
      defaultCategory: 1,
      showCompletedItems: true,
      theme: 'dark'
    };
  },

  reorderList(sourceListId, targetListId, sourceCategoryId, targetCategoryId) {
    // Find the source list
    const sourceList = this.lists.find(l => l.id === sourceListId);
    if (!sourceList) return;

    // If moving between categories, update the category
    if (sourceCategoryId !== targetCategoryId) {
      sourceList.categoryId = targetCategoryId;
    }

    // Get lists in the target category
    const targetCategoryLists = this.lists.filter(l => l.categoryId === targetCategoryId);
    const targetIndex = targetCategoryLists.findIndex(l => l.id === targetListId);

    if (targetIndex === -1) return;

    // Remove source list from its current position
    const allLists = this.lists;
    const sourceIndex = allLists.findIndex(l => l.id === sourceListId);
    if (sourceIndex > -1) {
      allLists.splice(sourceIndex, 1);
    }

    // Find where to insert in the target category
    let insertIndex = 0;
    let foundTarget = false;
    for (let i = 0; i < allLists.length; i++) {
      if (allLists[i].categoryId === targetCategoryId) {
        if (allLists[i].id === targetListId) {
          insertIndex = i;
          foundTarget = true;
          break;
        }
        insertIndex = i + 1;
      }
    }

    // Insert the source list at the target position
    allLists.splice(insertIndex, 0, sourceList);
  },

  pinItem(listId, itemIndex) {
    const list = this.lists.find(l => l.id === listId);
    if (list && itemIndex >= 0 && itemIndex < list.items.length) {
      const item = list.items[itemIndex];
      const isPinned = this.pinnedItems.some(p => p.listId === listId && p.itemIndex === itemIndex);
      if (!isPinned) {
        this.pinnedItems.push({
          listId,
          itemIndex,
          text: item.text,
          notes: item.notes,
          pinnedAt: Date.now()
        });
      }
    }
  },

  unpinItem(listId, itemIndex) {
    this.pinnedItems = this.pinnedItems.filter(p => !(p.listId === listId && p.itemIndex === itemIndex));
  },

  isItemPinned(listId, itemIndex) {
    return this.pinnedItems.some(p => p.listId === listId && p.itemIndex === itemIndex);
  },

  getPinnedItems() {
    return this.pinnedItems.sort((a, b) => b.pinnedAt - a.pinnedAt);
  }
});
