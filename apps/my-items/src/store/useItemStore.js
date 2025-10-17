import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';

import {create} from 'zustand'

const COLLECTION_NAME = 'items';

const sanitizeQuery = (query) => {
  if (!Array.isArray(query)) return [];
  return query
    .filter(item => item && item.key && item.operator && item.value !== undefined)
    .map(item => ({
      ...item,
      value: item.value === null ? null : item.value
    }));
};

const getErrorContext = (operation) => ({
  operation,
  online: navigator.onLine,
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent
});

const useItemStore = create((set, get) => ({
  items: [],
  initialLoading: true,
  loadItems: async () => {
    try {
      const storedItems = await AppSdk.appData.queryData({
        collection: COLLECTION_NAME,
        query: sanitizeQuery([])
      });
      set({ items: storedItems || [], initialLoading: false });
    } catch (error) {
      console.error("Failed to load items:", error);
      await reportError(error, 'JavaScriptError', getErrorContext('loadItems'));
      set({ initialLoading: false });
      throw error;
    }
  },
  addItem: async (item) => {
    const tempId = `temp-${Date.now()}`;
    const newItem = { ...item, createdAt: Date.now() };
    
    set((state) => ({ 
      items: [...state.items, { id: tempId, ...newItem, _optimistic: true }] 
    }));
    
    try {
      const result = await AppSdk.appData.createData({
        collection: COLLECTION_NAME,
        data: newItem
      });
      set((state) => ({
        items: state.items.map(i => 
          i.id === tempId ? result : i
        )
      }));
      return { success: true, id: result.id };
    } catch (error) {
      console.error("Failed to add item:", error);
      await reportError(error, 'JavaScriptError', getErrorContext('addItem'));
      set((state) => ({
        items: state.items.filter(i => i.id !== tempId)
      }));
      return { success: false, error };
    }
  },
  updateItem: async (id, itemToUpdate) => {
    const state = get();
    const originalItem = state.items.find(item => item.id === id);
    
    if (!originalItem) {
      return { success: false, error: 'Item not found' };
    }
    
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...itemToUpdate, _optimistic: true } : item
      ),
    }));
    
    try {
      await AppSdk.appData.updateData({
        collection: COLLECTION_NAME,
        id,
        data: itemToUpdate
      });
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, _optimistic: undefined } : item
        ),
      }));
      return { success: true };
    } catch (error) {
      console.error("Failed to update item:", error);
      await reportError(error, 'JavaScriptError', getErrorContext('updateItem'));
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? originalItem : item
        ),
      }));
      return { success: false, error };
    }
  },
  deleteItem: async (id) => {
    const state = get();
    const itemToDelete = state.items.find(item => item.id === id);
    
    if (!itemToDelete) {
      return { success: false, error: 'Item not found' };
    }
    
    set((state) => ({ 
      items: state.items.filter((item) => item.id !== id) 
    }));
    
    try {
      await AppSdk.appData.deleteData({
        collection: COLLECTION_NAME,
        id
      });
      return { success: true };
    } catch (error) {
      console.error("Failed to delete item:", error);
      await reportError(error, 'JavaScriptError', getErrorContext('deleteItem'));
      set((state) => ({ 
        items: [...state.items, itemToDelete].sort((a, b) => b.createdAt - a.createdAt)
      }));
      return { success: false, error };
    }
  },
  getItem: (id) => {
    return get().items.find(item => item.id === id);
  },
}));

export default useItemStore;