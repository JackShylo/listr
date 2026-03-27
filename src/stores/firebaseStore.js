import { reactive } from 'vue';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

export const listStore = reactive({
  currentPage: 'lists',
  lists: [],
  categories: [
    { id: 1, name: 'Work', color: '#5a5aff' },
    { id: 2, name: 'Personal', color: '#ff6b9d' },
    { id: 3, name: 'Home', color: '#4ecdc4' },
    { id: 4, name: 'Other', color: '#95e1d3' }
  ],
  settings: {
    defaultCategory: 1,
    showCompletedItems: true,
    theme: 'dark'
  },
  currentListId: null,
  pinnedItems: [],
  loading: true,

  // Initialize Firebase listener
  async init() {
    try {
      console.log('🔄 Initializing Firebase store...');
      const q = query(collection(db, 'lists'), orderBy('createdAt', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('📡 Firestore listener triggered, docs:', snapshot.docs.length);
        this.lists = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('✅ Lists loaded:', this.lists);
        if (this.lists.length > 0 && !this.currentListId) {
          this.currentListId = this.lists[0].id;
          console.log('📌 Set current list ID:', this.currentListId);
        }
        this.loading = false;
      }, (error) => {
        console.error('❌ Firestore listener error:', error);
        console.error('Error code:', error.code);
        console.error('Full error:', error);
        this.loading = false;
      });
    } catch (error) {
      console.error('❌ Error initializing Firebase:', error);
      this.loading = false;
    }
  },

  getCurrentList() {
    return this.lists.find(list => list.id === this.currentListId);
  },

  getListsByCategory(categoryId) {
    return this.lists.filter(list => list.categoryId === categoryId);
  },

  getPinnedItems() {
    return this.pinnedItems;
  },

  goToLists() {
    this.currentPage = 'lists';
  },

  goToSettings() {
    this.currentPage = 'settings';
  },

  updateSettings(newSettings) {
    this.settings = { ...newSettings };
  },

  resetSettings() {
    this.settings = {
      defaultCategory: 1,
      showCompletedItems: true,
      theme: 'dark'
    };
  },

  updateCategory(categoryId, name, color) {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      category.name = name;
      category.color = color;
    }
  },

  setCurrentList(id) {
    if (this.lists.find(list => list.id === id)) {
      this.currentListId = id;
    }
  },

  async createList(name, categoryId = 4) {
    try {
      if (this.lists.length >= 8) {
        console.warn('Maximum lists reached');
        return null;
      }
      const newList = {
        name,
        categoryId,
        createdAt: Date.now(),
        items: []
      };
      const docRef = await addDoc(collection(db, 'lists'), newList);
      this.currentListId = docRef.id;
      return { id: docRef.id, ...newList };
    } catch (error) {
      console.error('Error creating list:', error);
      return null;
    }
  },

  async updateList(id, name, categoryId = null) {
    try {
      const list = this.lists.find(list => list.id === id);
      if (!list) return;

      const updates = { name };
      if (categoryId !== null) {
        updates.categoryId = categoryId;
      }
      await updateDoc(doc(db, 'lists', id), updates);
    } catch (error) {
      console.error('Error updating list:', error);
    }
  },

  async deleteList(id) {
    try {
      if (this.lists.length > 1) {
        await deleteDoc(doc(db, 'lists', id));
        if (this.currentListId === id) {
          this.currentListId = this.lists.find(l => l.id !== id)?.id || null;
        }
      }
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  },

  async addItem(listId, item) {
    try {
      const list = this.lists.find(list => list.id === listId);
      if (!list) return;

      const newItem = {
        text: item,
        notes: '',
        completed: false,
        createdAt: Date.now()
      };

      const items = list.items || [];
      items.push(newItem);
      await updateDoc(doc(db, 'lists', listId), { items });
    } catch (error) {
      console.error('Error adding item:', error);
    }
  },

  async removeItem(listId, index) {
    try {
      const list = this.lists.find(list => list.id === listId);
      if (!list) return;

      const items = [...(list.items || [])];
      items.splice(index, 1);
      await updateDoc(doc(db, 'lists', listId), { items });
    } catch (error) {
      console.error('Error removing item:', error);
    }
  },

  async updateItem(listId, index, newText) {
    try {
      const list = this.lists.find(list => list.id === listId);
      if (!list || index < 0 || index >= (list.items?.length || 0)) return;

      const items = [...(list.items || [])];
      items[index].text = newText;
      await updateDoc(doc(db, 'lists', listId), { items });
    } catch (error) {
      console.error('Error updating item:', error);
    }
  },

  async updateItemNotes(listId, index, notes) {
    try {
      const list = this.lists.find(list => list.id === listId);
      if (!list || index < 0 || index >= (list.items?.length || 0)) return;

      const items = [...(list.items || [])];
      items[index].notes = notes;
      await updateDoc(doc(db, 'lists', listId), { items });
    } catch (error) {
      console.error('Error updating item notes:', error);
    }
  },

  async toggleItem(listId, index) {
    try {
      const list = this.lists.find(list => list.id === listId);
      if (!list || index < 0 || index >= (list.items?.length || 0)) return;

      const items = [...(list.items || [])];
      items[index].completed = !items[index].completed;
      await updateDoc(doc(db, 'lists', listId), { items });
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  },

  async pinItem(item) {
    try {
      if (!this.pinnedItems.find(p => p.id === item.id)) {
        this.pinnedItems.push(item);
      }
    } catch (error) {
      console.error('Error pinning item:', error);
    }
  },

  async unpinItem(itemId) {
    try {
      this.pinnedItems = this.pinnedItems.filter(item => item.id !== itemId);
    } catch (error) {
      console.error('Error unpinning item:', error);
    }
  }
});
