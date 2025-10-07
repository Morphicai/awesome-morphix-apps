import { createContext, useContext, useEffect, useState } from 'react';
import AppSdk from '@morphixai/app-sdk';
// 矩阵状态管理
export const STORAGE_KEY = 'act_matrix_current_id';

// 使用 useState 管理状态，移除 reducer

// Context
const MatrixContext = createContext();

// Provider 组件
export function MatrixProvider({ children }) {
  const [currentMatrixId, _setCurrentMatrixId] = useState(() => {
    const id = localStorage.getItem(STORAGE_KEY);
    return id;
  });
  const [matrices, setMatrices] = useState(() => new Map());

  // 生成新的矩阵ID
  const generateNewMatrixId = () => {
    return `matrix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 从本地存储加载当前矩阵ID；若不存在则生成并持久化

  // Actions
  const setCurrentMatrix = (matrixId) => {
    _setCurrentMatrixId(matrixId);

  };

  // 初始化：如果没有当前矩阵ID，则尝试从存储中选择最新的一个
  useEffect(() => {
    if (!currentMatrixId) {
      initFirstMatrix();
    }
  }, [currentMatrixId]);
  useEffect(() => {
    try {
      if (currentMatrixId) {
        localStorage.setItem(STORAGE_KEY, currentMatrixId);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.warn('Failed to persist current matrix ID:', error);
    }
    console.log('[MatrixProvider] currentMatrixId:', currentMatrixId);
  }, [currentMatrixId]);


  async function initFirstMatrix() {
    try {
      const allMatrices = await AppSdk.appData.queryData({
        collection: 'act_matrix_quadrants',
        query: [],
      });
      if (Array.isArray(allMatrices) && allMatrices.length > 0) {
        const lastMatrix = allMatrices[allMatrices.length - 1];
        if (lastMatrix && lastMatrix.matrixId) {
          setCurrentMatrix(lastMatrix.matrixId);
          return;
        }
      }
      // 未查询到数据或没有有效的 matrixId，则生成默认矩阵ID
      const newId = generateNewMatrixId();
      setCurrentMatrix(newId);
    } catch (_) {
      // 查询失败时也生成一个默认矩阵ID，确保可用
      const fallbackId = generateNewMatrixId();
      setCurrentMatrix(fallbackId);
    }
  }

  const setMatrixData = (matrixId, data) => {
    setMatrices((prev) => {
      const newMatrices = new Map(prev);
      newMatrices.set(matrixId, data);
      return newMatrices;
    });
  };

  const clearMatrixData = (matrixId) => {
    setMatrices((prev) => {
      const newMatrices = new Map(prev);
      newMatrices.delete(matrixId);
      return newMatrices;
    });
  };

  const getCurrentMatrixData = () => {
    if (!currentMatrixId) return null;
    return matrices.get(currentMatrixId) || null;
  };

  // 创建新矩阵
  const createNewMatrix = () => {
    const newMatrixId = generateNewMatrixId();
    setCurrentMatrix(newMatrixId);
    return newMatrixId;
  };

  const value = {
    // 状态
    currentMatrixId,
    matrices,

    // Actions
    setCurrentMatrix,
    setMatrixData,
    clearMatrixData,
    getCurrentMatrixData,
    createNewMatrix,
  };

  return (
    <MatrixContext.Provider value={value}>
      {children}
    </MatrixContext.Provider>
  );
}

// Hook
export function useMatrix() {
  const context = useContext(MatrixContext);
  if (!context) {
    throw new Error('useMatrix must be used within a MatrixProvider');
  }
  return context;
}

//
