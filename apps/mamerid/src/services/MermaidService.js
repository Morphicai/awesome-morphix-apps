import { reportError } from '@morphixai/lib';

/**
 * Mermaid 服务
 * 负责加载、缓存和管理不同版本的 Mermaid 实例
 */
class MermaidService {
    constructor() {
        // 版本缓存：key 是版本号，value 是 mermaid 实例
        this.cache = new Map();
        // 正在加载的版本，避免重复请求
        this.loading = new Map();
    }

    /**
     * 加载指定版本的 Mermaid
     * @param {string} version - 版本号，如 '11.4.1'
     * @returns {Promise<Object>} Mermaid 实例
     */
    async loadMermaid(version) {
        try {
            // 1. 检查缓存
            if (this.cache.has(version)) {
                console.log(`从缓存加载 Mermaid v${version}`);
                return this.cache.get(version);
            }

            // 2. 检查是否正在加载
            if (this.loading.has(version)) {
                console.log(`等待 Mermaid v${version} 加载完成`);
                return await this.loading.get(version);
            }

            // 3. 开始加载
            console.log(`开始加载 Mermaid v${version}`);
            const loadingPromise = this._loadAndInitialize(version);
            this.loading.set(version, loadingPromise);

            const mermaid = await loadingPromise;
            
            // 4. 保存到缓存
            this.cache.set(version, mermaid);
            this.loading.delete(version);

            console.log(`Mermaid v${version} 加载成功`);
            return mermaid;

        } catch (error) {
            this.loading.delete(version);
            await reportError(error, 'JavaScriptError', {
                component: 'MermaidService',
                action: 'loadMermaid',
                version
            });
            throw new Error(`加载 Mermaid v${version} 失败: ${error.message}`);
        }
    }

    /**
     * 实际加载和初始化 Mermaid
     * @private
     */
    async _loadAndInitialize(version) {
        // 使用 remoteImport 加载指定版本
        const mermaidModule = await remoteImport(`mermaid@${version}`);
        const mermaid = mermaidModule.default || mermaidModule;

        // 初始化配置
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'Arial, sans-serif',
            logLevel: 'error' // 减少控制台输出
        });

        return mermaid;
    }

    /**
     * 获取已缓存的版本列表
     * @returns {Array<string>} 已缓存的版本号数组
     */
    getCachedVersions() {
        return Array.from(this.cache.keys());
    }

    /**
     * 检查指定版本是否已缓存
     * @param {string} version - 版本号
     * @returns {boolean}
     */
    isCached(version) {
        return this.cache.has(version);
    }

    /**
     * 清除指定版本的缓存
     * @param {string} version - 版本号
     */
    clearCache(version) {
        if (version) {
            this.cache.delete(version);
            console.log(`清除 Mermaid v${version} 缓存`);
        } else {
            this.cache.clear();
            console.log('清除所有 Mermaid 缓存');
        }
    }

    /**
     * 预加载多个版本
     * @param {Array<string>} versions - 版本号数组
     * @returns {Promise<void>}
     */
    async preloadVersions(versions) {
        console.log(`预加载 Mermaid 版本:`, versions);
        const promises = versions.map(version => 
            this.loadMermaid(version).catch(error => {
                console.warn(`预加载 v${version} 失败:`, error.message);
            })
        );
        await Promise.all(promises);
        console.log('预加载完成');
    }

    /**
     * 获取缓存统计信息
     * @returns {Object} 缓存统计
     */
    getCacheStats() {
        return {
            cachedCount: this.cache.size,
            loadingCount: this.loading.size,
            cachedVersions: this.getCachedVersions()
        };
    }
}

// 导出单例实例
export default new MermaidService();

