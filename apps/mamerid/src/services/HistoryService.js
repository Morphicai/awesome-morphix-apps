import { reportError } from '@morphixai/lib';

/**
 * 历史记录服务
 * 负责管理用户的 Mermaid 代码历史记录
 */
class HistoryService {
    constructor() {
        this.storageKey = 'mermaid_history';
        this.maxHistoryItems = 50; // 最多保存50条历史记录
    }

    /**
     * 保存代码到历史记录
     * @param {string} code - Mermaid 代码
     * @param {string} version - 使用的版本
     * @returns {Object} 保存的历史记录项
     */
    saveToHistory(code, version = '11.4.1') {
        try {
            if (!code || !code.trim()) {
                return null;
            }

            const history = this.getHistory();
            
            // 检查是否已存在相同代码（避免重复）
            const existingIndex = history.findIndex(item => item.code === code);
            if (existingIndex !== -1) {
                // 如果存在，更新时间戳并移到最前面
                const existing = history.splice(existingIndex, 1)[0];
                existing.timestamp = Date.now();
                existing.version = version;
                history.unshift(existing);
            } else {
                // 创建新的历史记录项
                const historyItem = {
                    id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    code: code.trim(),
                    version: version,
                    timestamp: Date.now(),
                    preview: this._generatePreview(code)
                };
                history.unshift(historyItem);
            }

            // 限制历史记录数量
            if (history.length > this.maxHistoryItems) {
                history.splice(this.maxHistoryItems);
            }

            localStorage.setItem(this.storageKey, JSON.stringify(history));
            return history[0];
        } catch (error) {
            reportError(error, 'JavaScriptError', {
                component: 'HistoryService',
                action: 'saveToHistory'
            });
            return null;
        }
    }

    /**
     * 获取所有历史记录
     * @returns {Array} 历史记录数组
     */
    getHistory() {
        try {
            const historyStr = localStorage.getItem(this.storageKey);
            if (!historyStr) {
                return [];
            }
            return JSON.parse(historyStr);
        } catch (error) {
            reportError(error, 'JavaScriptError', {
                component: 'HistoryService',
                action: 'getHistory'
            });
            return [];
        }
    }

    /**
     * 根据ID获取历史记录项
     * @param {string} id - 历史记录ID
     * @returns {Object|null} 历史记录项
     */
    getHistoryItem(id) {
        const history = this.getHistory();
        return history.find(item => item.id === id) || null;
    }

    /**
     * 删除指定的历史记录
     * @param {string} id - 历史记录ID
     * @returns {boolean} 是否删除成功
     */
    deleteHistoryItem(id) {
        try {
            const history = this.getHistory();
            const filteredHistory = history.filter(item => item.id !== id);
            localStorage.setItem(this.storageKey, JSON.stringify(filteredHistory));
            return true;
        } catch (error) {
            reportError(error, 'JavaScriptError', {
                component: 'HistoryService',
                action: 'deleteHistoryItem',
                id
            });
            return false;
        }
    }

    /**
     * 清空所有历史记录
     * @returns {boolean} 是否清空成功
     */
    clearHistory() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            reportError(error, 'JavaScriptError', {
                component: 'HistoryService',
                action: 'clearHistory'
            });
            return false;
        }
    }

    /**
     * 搜索历史记录
     * @param {string} keyword - 搜索关键词
     * @returns {Array} 匹配的历史记录
     */
    searchHistory(keyword) {
        if (!keyword || !keyword.trim()) {
            return this.getHistory();
        }

        const history = this.getHistory();
        const lowerKeyword = keyword.toLowerCase();
        return history.filter(item => 
            item.code.toLowerCase().includes(lowerKeyword) ||
            item.preview.toLowerCase().includes(lowerKeyword)
        );
    }

    /**
     * 生成代码预览（前50个字符）
     * @private
     */
    _generatePreview(code) {
        const preview = code.trim().split('\n')[0];
        return preview.length > 50 ? preview.substring(0, 50) + '...' : preview;
    }

    /**
     * 获取统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        const history = this.getHistory();
        return {
            total: history.length,
            oldest: history.length > 0 ? history[history.length - 1].timestamp : null,
            newest: history.length > 0 ? history[0].timestamp : null
        };
    }
}

// 导出单例实例
export default new HistoryService();

