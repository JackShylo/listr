import { collection, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const sampleLists = [
  { 
    name: 'Shopping', 
    categoryId: 3, 
    createdAt: new Date('2024-01-15T10:30:00').getTime(), 
    items: [
      { text: 'Milk', notes: '', completed: false, createdAt: new Date('2024-01-15T10:30:00').getTime() }, 
      { text: 'Eggs', notes: '', completed: false, createdAt: new Date('2024-01-15T10:31:00').getTime() }, 
      { text: 'Bread', notes: '', completed: false, createdAt: new Date('2024-01-15T10:32:00').getTime() }
    ] 
  },
  { 
    name: 'Work', 
    categoryId: 1, 
    createdAt: new Date('2024-01-10T09:00:00').getTime(), 
    items: [
      { text: 'Email clients', notes: '', completed: false, createdAt: new Date('2024-01-10T09:00:00').getTime() }, 
      { text: 'Complete report', notes: '', completed: false, createdAt: new Date('2024-01-10T09:15:00').getTime() }
    ] 
  },
  { 
    name: 'Personal', 
    categoryId: 2, 
    createdAt: new Date('2024-01-08T14:20:00').getTime(), 
    items: [
      { text: 'Call mom', notes: '', completed: false, createdAt: new Date('2024-01-08T14:20:00').getTime() }, 
      { text: 'Gym', notes: '', completed: false, createdAt: new Date('2024-01-08T14:25:00').getTime() }
    ] 
  },
  { 
    name: 'Projects', 
    categoryId: 1, 
    createdAt: new Date('2024-01-12T11:45:00').getTime(), 
    items: [
      { text: 'Finish Vue app', notes: '', completed: false, createdAt: new Date('2024-01-12T11:45:00').getTime() }, 
      { text: 'Review code', notes: '', completed: false, createdAt: new Date('2024-01-12T12:00:00').getTime() }
    ] 
  },
  { 
    name: 'Reading', 
    categoryId: 2, 
    createdAt: new Date('2024-01-09T16:10:00').getTime(), 
    items: [
      { text: 'JavaScript Book', notes: '', completed: false, createdAt: new Date('2024-01-09T16:10:00').getTime() }, 
      { text: 'Vue Guide', notes: '', completed: false, createdAt: new Date('2024-01-09T16:30:00').getTime() }
    ] 
  },
  { 
    name: 'Hobbies', 
    categoryId: 2, 
    createdAt: new Date('2024-01-11T17:00:00').getTime(), 
    items: [
      { text: 'Play guitar', notes: '', completed: false, createdAt: new Date('2024-01-11T17:00:00').getTime() }, 
      { text: 'Photography', notes: '', completed: false, createdAt: new Date('2024-01-11T17:20:00').getTime() }
    ] 
  },
  { 
    name: 'Home', 
    categoryId: 3, 
    createdAt: new Date('2024-01-14T08:30:00').getTime(), 
    items: [
      { text: 'Clean kitchen', notes: '', completed: false, createdAt: new Date('2024-01-14T08:30:00').getTime() }, 
      { text: 'Fix door', notes: '', completed: false, createdAt: new Date('2024-01-14T09:00:00').getTime() }
    ] 
  },
];

export async function seedDatabase() {
  try {
    console.log('Starting to seed database...');
    
    // Add all sample lists
    for (const list of sampleLists) {
      const docRef = await addDoc(collection(db, 'lists'), list);
      console.log('Added list:', list.name, 'with ID:', docRef.id);
    }
    
    console.log('✅ Database seeded successfully with', sampleLists.length, 'lists');
    return true;
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return false;
  }
}

export async function clearDatabase() {
  try {
    console.log('Clearing database...');
    const querySnapshot = await getDocs(collection(db, 'lists'));
    
    for (const doc of querySnapshot.docs) {
      await deleteDoc(doc.ref);
      console.log('Deleted list:', doc.id);
    }
    
    console.log('✅ Database cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    return false;
  }
}
