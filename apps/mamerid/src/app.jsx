import React, { useState, useEffect, useRef } from 'react';
import { IonPage, IonContent, IonButton, IonSelect, IonSelectOption, IonTextarea, IonIcon, IonToast } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { refreshOutline, downloadOutline, copyOutline, bookmarkOutline, timeOutline, expandOutline, contractOutline } from 'ionicons/icons';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
import MermaidService from './services/MermaidService';
import HistoryService from './services/HistoryService';
import HistoryPanel from './components/HistoryPanel';
import ErrorBoundary from './components/ErrorBoundary';
import styles from './styles/App.module.css';

// 默认代码（当代码为空时使用）
const DEFAULT_CODE = `graph TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作 A]
    B -->|否| D[执行操作 B]
    C --> E[结束]
    D --> E`;

// Mermaid 版本列表
const MERMAID_VERSIONS = [
    { version: '11.4.1', label: 'v11.4.1 (Latest)' },
    { version: '11.0.0', label: 'v11.0.0' },
    { version: '10.9.0', label: 'v10.9.0' },
    { version: '10.0.0', label: 'v10.0.0' }
];

/**
 * Mermaid 图表预览器应用
 */
export default function App() {
    const [code, setCode] = useState('');
    const [currentVersion, setCurrentVersion] = useState('11.4.1');
    const [renderError, setRenderError] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [mermaidInstance, setMermaidInstance] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const previewRef = useRef(null);
    const renderIdRef = useRef(0);

    // 加载 Mermaid 实例（使用 MermaidService）
    const loadMermaid = async (version) => {
        try {
            setIsLoading(true);
            setRenderError(null);
            
            // 使用服务加载（会自动缓存）
            const mermaid = await MermaidService.loadMermaid(version);
            
            setMermaidInstance(mermaid);
            setIsLoading(false);
            
            // 显示缓存状态
            const stats = MermaidService.getCacheStats();
            console.log('Mermaid 缓存状态:', stats);
            
            return mermaid;
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'App',
                action: 'loadMermaid',
                version
            });
            setIsLoading(false);
            setRenderError(error.message);
            return null;
        }
    };

    // 初始化
    useEffect(() => {
        const init = async () => {
            // 先加载保存的数据（包括版本）
            const savedData = await loadSavedData();
            
            // 使用保存的版本或默认版本
            const versionToLoad = savedData.version || currentVersion;
            await loadMermaid(versionToLoad);
            
            // 可选：预加载其他常用版本（后台加载，不阻塞）
            const otherVersions = MERMAID_VERSIONS
                .filter(v => v.version !== versionToLoad)
                .slice(0, 2) // 只预加载前两个其他版本
                .map(v => v.version);
            
            if (otherVersions.length > 0) {
                // 延迟预加载，不影响当前版本的使用
                setTimeout(() => {
                    MermaidService.preloadVersions(otherVersions);
                }, 2000);
            }
        };
        init();
    }, []);

    // 加载保存的数据
    const loadSavedData = async () => {
        try {
            const savedCode = localStorage.getItem('mermaid_code');
            const savedVersion = localStorage.getItem('mermaid_version');
            
            // 如果没有保存的代码，使用默认代码
            const codeToUse = savedCode || DEFAULT_CODE;
            setCode(codeToUse);
            if (savedVersion) setCurrentVersion(savedVersion);
            
            // 返回保存的数据
            return {
                code: savedCode,
                version: savedVersion
            };
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'App',
                action: 'loadSavedData'
            });
            return {};
        }
    };

    // 保存数据（并保存到历史记录）
    const saveData = async () => {
        try {
            const codeToSave = code.trim() || DEFAULT_CODE;
            localStorage.setItem('mermaid_code', codeToSave);
            localStorage.setItem('mermaid_version', currentVersion);
            
            // 保存到历史记录
            HistoryService.saveToHistory(codeToSave, currentVersion);
            
            showToastMessage('已保存');
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'App',
                action: 'saveData'
            });
        }
    };

    // 渲染 Mermaid 图表
    const renderDiagram = async () => {
        const codeToRender = code.trim() || DEFAULT_CODE;
        
        if (!previewRef.current || !mermaidInstance) {
            return;
        }

        try {
            setRenderError(null);
            const renderId = `mermaid-${renderIdRef.current++}`;
            
            // 清空预览区域
            previewRef.current.innerHTML = '';
            
            // 创建临时容器
            const container = document.createElement('div');
            container.id = renderId;
            container.innerHTML = codeToRender;
            previewRef.current.appendChild(container);

            // 渲染图表
            await mermaidInstance.run({
                nodes: [container]
            });

        } catch (error) {
            setRenderError(error.message || '渲染失败');
            await reportError(error, 'JavaScriptError', {
                component: 'App',
                action: 'renderDiagram'
            });
        }
    };

    // 当代码或 mermaid 实例变化时自动渲染
    useEffect(() => {
        if (mermaidInstance) {
            const timer = setTimeout(() => {
                renderDiagram();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [code, mermaidInstance]);

    // 当版本变化时重新加载 Mermaid
    const handleVersionChange = async (version) => {
        setCurrentVersion(version);
        await loadMermaid(version);
        // 自动保存版本选择
        try {
            localStorage.setItem('mermaid_version', version);
        } catch (error) {
            console.warn('保存版本失败:', error);
        }
    };

    // 选择历史记录
    const handleSelectHistory = (historyItem) => {
        setCode(historyItem.code);
        setCurrentVersion(historyItem.version);
        // 切换版本
        if (historyItem.version !== currentVersion) {
            handleVersionChange(historyItem.version);
        }
    };

    // 复制代码
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            showToastMessage('代码已复制');
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'App',
                action: 'handleCopy'
            });
            showToastMessage('复制失败');
        }
    };

    // 下载为 SVG
    const handleDownload = async () => {
        try {
            const svgElement = previewRef.current?.querySelector('svg');
            if (!svgElement) {
                showToastMessage('没有可下载的图表');
                return;
            }

            const svgData = new XMLSerializer().serializeToString(svgElement);
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `mermaid-diagram-${Date.now()}.svg`;
            link.click();
            URL.revokeObjectURL(url);
            showToastMessage('图表已下载');
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'App',
                action: 'handleDownload'
            });
            showToastMessage('下载失败');
        }
    };

    // 切换全屏
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
    };

    return (
        <IonPage>
            <PageHeader title="Mermaid 预览器" />
            <IonContent className={styles.content}>
                <div className={`${styles.container} ${isFullscreen ? styles.fullscreen : ''}`}>
                    {/* 工具栏 */}
                    <div className={styles.toolbar}>
                        <div className={styles.toolbarLeft}>
                            <IonButton fill="clear" size="small" onClick={() => setShowHistory(true)}>
                                <IonIcon slot="icon-only" icon={timeOutline} />
                            </IonButton>
                            <IonButton fill="clear" size="small" onClick={() => renderDiagram()} disabled={isLoading || !mermaidInstance}>
                                <IonIcon slot="icon-only" icon={refreshOutline} />
                            </IonButton>
                        </div>

                        <div className={styles.toolbarRight}>
                            <IonButton 
                                fill="clear" 
                                size="small" 
                                onClick={toggleFullscreen}
                                className={styles.mobileOnly}
                            >
                                <IonIcon slot="icon-only" icon={isFullscreen ? contractOutline : expandOutline} />
                            </IonButton>
                        </div>
                    </div>

                    {/* 主要内容区域 */}
                    <div className={styles.mainContent}>
                        {/* 编辑器区域 */}
                        {!isFullscreen && (
                            <div className={styles.editorPanel}>
                                <IonTextarea
                                    value={code}
                                    onIonInput={(e) => setCode(e.detail.value)}
                                    className={styles.codeEditor}
                                    placeholder="输入 Mermaid 代码..."
                                    rows={20}
                                    spellcheck={false}
                                    autoGrow={true}
                                />
                            </div>
                        )}

                        {/* 预览区域 */}
                        <ErrorBoundary 
                            name="PreviewPanel"
                            title="预览渲染失败"
                            onReset={() => {
                                // 重置时清空预览区域
                                if (previewRef.current) {
                                    previewRef.current.innerHTML = '';
                                }
                                setRenderError(null);
                                // 重新渲染
                                setTimeout(() => renderDiagram(), 100);
                            }}
                        >
                            <div className={styles.previewPanel}>
                                {/* 版本选择器 - 右上角 */}
                                <div className={styles.previewHeader}>
                                    <IonSelect
                                        value={currentVersion}
                                        onIonChange={(e) => handleVersionChange(e.detail.value)}
                                        className={styles.versionSelect}
                                        interface="popover"
                                        disabled={isLoading}
                                    >
                                        {MERMAID_VERSIONS.map(({ version, label }) => (
                                            <IonSelectOption key={version} value={version}>
                                                {label}
                                            </IonSelectOption>
                                        ))}
                                    </IonSelect>
                                </div>

                                {/* 预览内容 */}
                                <div className={styles.previewContent}>
                                    {isLoading ? (
                                        <div className={styles.loadingMessage}>
                                            加载 Mermaid v{currentVersion}...
                                        </div>
                                    ) : renderError ? (
                                        <div className={styles.errorMessage}>
                                            <p>渲染错误：</p>
                                            <pre>{renderError}</pre>
                                        </div>
                                    ) : (
                                        <div ref={previewRef} className={styles.mermaidContainer} />
                                    )}
                                </div>

                                {/* 操作按钮 - 底部 */}
                                <div className={styles.previewActions}>
                                    <IonButton fill="clear" size="small" onClick={handleCopy} disabled={isLoading}>
                                        <IonIcon slot="start" icon={copyOutline} />
                                        复制
                                    </IonButton>
                                    <IonButton fill="clear" size="small" onClick={saveData} disabled={isLoading}>
                                        <IonIcon slot="start" icon={bookmarkOutline} />
                                        保存
                                    </IonButton>
                                    <IonButton fill="clear" size="small" onClick={handleDownload} disabled={isLoading || !mermaidInstance}>
                                        <IonIcon slot="start" icon={downloadOutline} />
                                        下载
                                    </IonButton>
                                </div>
                            </div>
                        </ErrorBoundary>
                    </div>
                </div>

                {/* 历史记录面板 */}
                <ErrorBoundary 
                    name="HistoryPanel"
                    title="历史记录加载失败"
                    onReset={() => setShowHistory(false)}
                >
                    <HistoryPanel
                        isOpen={showHistory}
                        onClose={() => setShowHistory(false)}
                        onSelectHistory={handleSelectHistory}
                    />
                </ErrorBoundary>

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={2000}
                    position="bottom"
                />
            </IonContent>
        </IonPage>
    );
}
