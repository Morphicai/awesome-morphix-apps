import React, { useState, useEffect, useRef } from 'react';
import { IonPage, IonContent, IonButton, IonSelect, IonSelectOption, IonTextarea, IonIcon, IonToast, IonActionSheet } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { refreshOutline, downloadOutline, copyOutline, bookmarkOutline, timeOutline, expandOutline, contractOutline, addOutline, removeOutline, locateOutline, sparklesOutline, shareOutline, documentOutline, imageOutline } from 'ionicons/icons';
import { reportError } from '@morphixai/lib';
import MermaidService from '../services/MermaidService';
import HistoryService from '../services/HistoryService';
import AIService from '../services/AIService';
import HistoryPanel from '../components/HistoryPanel';
import ErrorBoundary from '../components/ErrorBoundary';
import AIGenerateModal from '../components/AIGenerateModal';
import styles from '../styles/App.module.css';

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
 * Mermaid 图表预览器主页
 */
export default function HomePage() {
    const [code, setCode] = useState('');
    const [currentVersion, setCurrentVersion] = useState('11.4.1');
    const [renderError, setRenderError] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [mermaidInstance, setMermaidInstance] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [showAIGenerate, setShowAIGenerate] = useState(false);
    const [showAIFix, setShowAIFix] = useState(false);
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);
    const previewRef = useRef(null);
    const renderIdRef = useRef(0);
    const isPanning = useRef(false);
    const lastPosition = useRef({ x: 0, y: 0 });

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
                component: 'HomePage',
                action: 'loadMermaid',
                version
            });
            setIsLoading(false);
            setRenderError(error.message);
            return null;
        }
    };

    // 从 URL 获取编码的代码参数
    const getCodeFromURL = () => {
        try {
            // 获取 hash 后的参数
            const hash = window.location.hash;
            // 匹配 #/?code=xxx 或 #/code=xxx 或 #?code=xxx
            const match = hash.match(/[?&]code=([^&]*)/);
            
            if (match && match[1]) {
                // 直接解码（原生支持中文和所有 Unicode 字符）
                const decodedCode = decodeURIComponent(match[1]);
                return decodedCode;
            }
        } catch (error) {
            console.error('解析 URL 参数失败:', error);
            reportError(error, 'JavaScriptError', {
                component: 'HomePage',
                action: 'getCodeFromURL'
            });
        }
        return null;
    };

    // 初始化
    useEffect(() => {
        const init = async () => {
            // 先尝试从 URL 获取代码
            const urlCode = getCodeFromURL();
            
            if (urlCode) {
                // 如果 URL 有代码，使用 URL 的代码
                setCode(urlCode);
            } else {
                // 否则加载保存的数据（包括版本）
                await loadSavedData();
            }
            
            // 使用保存的版本或默认版本
            const savedVersion = localStorage.getItem('mermaid_version');
            const versionToLoad = savedVersion || currentVersion;
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
                component: 'HomePage',
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
                component: 'HomePage',
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
            setShowAIFix(false);
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
            setShowAIFix(true); // 显示AI修复按钮
            await reportError(error, 'JavaScriptError', {
                component: 'HomePage',
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
                component: 'HomePage',
                action: 'handleCopy'
            });
            showToastMessage('复制失败');
        }
    };

    // 显示下载选项
    const handleDownload = () => {
        setShowDownloadOptions(true);
    };

    // 下载为 SVG
    const downloadAsSVG = async () => {
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
            showToastMessage('✅ SVG 已下载');
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'HomePage',
                action: 'downloadAsSVG'
            });
            showToastMessage('下载失败');
        }
    };

    // 下载为 PNG
    const downloadAsPNG = async () => {
        try {
            const svgElement = previewRef.current?.querySelector('svg');
            if (!svgElement) {
                showToastMessage('没有可下载的图表');
                return;
            }

            showToastMessage('正在生成 PNG...');

            // 克隆 SVG
            const clonedSvg = svgElement.cloneNode(true);
            
            // 获取 SVG 尺寸
            const bbox = svgElement.getBBox();
            const width = Math.ceil(bbox.width) || 800;
            const height = Math.ceil(bbox.height) || 600;
            
            // 设置 SVG 属性
            clonedSvg.setAttribute('width', width);
            clonedSvg.setAttribute('height', height);
            clonedSvg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${width} ${height}`);

            // 序列化 SVG
            const svgData = new XMLSerializer().serializeToString(clonedSvg);
            const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);

            // 创建 canvas
            const canvas = document.createElement('canvas');
            const scale = 2; // 2x 分辨率
            canvas.width = width * scale;
            canvas.height = height * scale;
            const ctx = canvas.getContext('2d');

            // 设置白色背景
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.scale(scale, scale);

            // 加载并绘制图片
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                try {
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // 转换为 PNG 并下载
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `mermaid-diagram-${Date.now()}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                            showToastMessage('✅ PNG 已下载');
                        } else {
                            showToastMessage('PNG 生成失败');
                        }
                    }, 'image/png');
                } catch (err) {
                    console.error('Canvas 绘制失败:', err);
                    showToastMessage('PNG 转换失败');
                }
            };
            
            img.onerror = (err) => {
                console.error('图片加载失败:', err);
                showToastMessage('PNG 转换失败，请重试');
            };
            
            img.src = svgDataUrl;
        } catch (error) {
            console.error('PNG 下载错误:', error);
            await reportError(error, 'JavaScriptError', {
                component: 'HomePage',
                action: 'downloadAsPNG'
            });
            showToastMessage('下载失败');
        }
    };

    // 下载为 JPG
    const downloadAsJPG = async () => {
        try {
            const svgElement = previewRef.current?.querySelector('svg');
            if (!svgElement) {
                showToastMessage('没有可下载的图表');
                return;
            }

            showToastMessage('正在生成 JPG...');

            // 克隆 SVG
            const clonedSvg = svgElement.cloneNode(true);
            
            // 获取 SVG 尺寸
            const bbox = svgElement.getBBox();
            const width = Math.ceil(bbox.width) || 800;
            const height = Math.ceil(bbox.height) || 600;
            
            // 设置 SVG 属性
            clonedSvg.setAttribute('width', width);
            clonedSvg.setAttribute('height', height);
            clonedSvg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${width} ${height}`);

            // 序列化 SVG
            const svgData = new XMLSerializer().serializeToString(clonedSvg);
            const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);

            // 创建 canvas
            const canvas = document.createElement('canvas');
            const scale = 2; // 2x 分辨率
            canvas.width = width * scale;
            canvas.height = height * scale;
            const ctx = canvas.getContext('2d');

            // 设置白色背景（JPG 不支持透明）
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.scale(scale, scale);

            // 加载并绘制图片
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                try {
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // 转换为 JPG 并下载
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `mermaid-diagram-${Date.now()}.jpg`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                            showToastMessage('✅ JPG 已下载');
                        } else {
                            showToastMessage('JPG 生成失败');
                        }
                    }, 'image/jpeg', 0.95);
                } catch (err) {
                    console.error('Canvas 绘制失败:', err);
                    showToastMessage('JPG 转换失败');
                }
            };
            
            img.onerror = (err) => {
                console.error('图片加载失败:', err);
                showToastMessage('JPG 转换失败，请重试');
            };
            
            img.src = svgDataUrl;
        } catch (error) {
            console.error('JPG 下载错误:', error);
            await reportError(error, 'JavaScriptError', {
                component: 'HomePage',
                action: 'downloadAsJPG'
            });
            showToastMessage('下载失败');
        }
    };

    // 生成分享链接（指向 embed 页面）
    const generateShareLink = () => {
        try {
            const codeToShare = code.trim() || DEFAULT_CODE;
            // 直接使用 encodeURIComponent（简单可靠，原生支持中文）
            const baseUrl = window.location.origin + window.location.pathname;
            const shareUrl = `${baseUrl}#/embed?code=${encodeURIComponent(codeToShare)}`;
            return shareUrl;
        } catch (error) {
            console.error('生成分享链接失败:', error);
            reportError(error, 'JavaScriptError', {
                component: 'HomePage',
                action: 'generateShareLink'
            });
            return null;
        }
    };

    // 复制分享链接
    const handleCopyShareLink = async () => {
        try {
            const shareUrl = generateShareLink();
            if (!shareUrl) {
                showToastMessage('生成分享链接失败');
                return;
            }
            
            await navigator.clipboard.writeText(shareUrl);
            showToastMessage('✨ 分享链接已复制到剪贴板');
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'HomePage',
                action: 'handleCopyShareLink'
            });
            showToastMessage('复制失败');
        }
    };

    // 切换全屏
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // 缩放功能
    const handleZoomIn = () => {
        setScale(prev => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev - 0.25, 0.25));
    };

    const handleZoomReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    // 鼠标滚轮缩放
    const handleWheel = (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setScale(prev => Math.max(0.25, Math.min(3, prev + delta)));
        }
    };

    // 拖拽平移
    const handleMouseDown = (e) => {
        if (e.button === 0) { // 左键
            isPanning.current = true;
            lastPosition.current = { x: e.clientX - position.x, y: e.clientY - position.y };
            e.currentTarget.style.cursor = 'grabbing';
        }
    };

    const handleMouseMove = (e) => {
        if (isPanning.current) {
            setPosition({
                x: e.clientX - lastPosition.current.x,
                y: e.clientY - lastPosition.current.y
            });
        }
    };

    const handleMouseUp = (e) => {
        isPanning.current = false;
        e.currentTarget.style.cursor = 'grab';
    };

    // 触摸事件处理（移动端双指缩放）
    const touchStartDistance = useRef(0);
    const touchStartScale = useRef(1);

    const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
            // 双指缩放
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            touchStartDistance.current = distance;
            touchStartScale.current = scale;
        }
    };

    const handleTouchMove = (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            const scaleChange = distance / touchStartDistance.current;
            const newScale = touchStartScale.current * scaleChange;
            setScale(Math.max(0.25, Math.min(3, newScale)));
        }
    };

    // AI修复功能
    const handleAIFixClick = async () => {
        try {
            setShowAIFix(false);
            showToastMessage('AI 修复中...');
            
            const result = await AIService.fixMermaidCode(code, renderError || '未知错误');
            
            if (result.success && result.fixedCode) {
                // 更新代码
                setCode(result.fixedCode);
                // 保存到历史
                await HistoryService.saveToHistory(result.fixedCode, currentVersion);
                // 显示成功提示
                showToastMessage('✨ AI修复成功！');
            } else {
                showToastMessage(result.explanation || 'AI修复失败');
                setShowAIFix(true); // 失败后继续显示修复按钮
            }
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'HomePage',
                action: 'handleAIFixClick'
            });
            showToastMessage('修复失败：' + error.message);
            setShowAIFix(true);
        }
    };

    // AI生成流程图
    const handleAIGenerate = async (description) => {
        try {
            const result = await AIService.generateMermaidFromDescription(description);
            
            if (result.success && result.code) {
                // 更新代码
                setCode(result.code);
                // 保存到历史
                await HistoryService.saveToHistory(result.code, currentVersion);
                // 显示成功提示
                showToastMessage('✨ AI 生成成功！');
            } else {
                showToastMessage(result.explanation || 'AI 生成失败');
            }
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'HomePage',
                action: 'handleAIGenerate'
            });
            showToastMessage('生成失败：' + error.message);
        }
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
                            {/* 空白占位 */}
                        </div>

                        <div className={styles.toolbarRight}>
                            <IonButton fill="clear" size="small" onClick={() => setShowHistory(true)} className={styles.toolbarSmallButton}>
                                <IonIcon slot="icon-only" icon={timeOutline} />
                            </IonButton>
                            <IonButton fill="clear" size="small" onClick={() => renderDiagram()} disabled={isLoading || !mermaidInstance} className={styles.toolbarSmallButton}>
                                <IonIcon slot="icon-only" icon={refreshOutline} />
                            </IonButton>
                        </div>
                    </div>

                    {/* 主要内容区域 */}
                    <div className={styles.mainContent}>
                        {/* 编辑器区域 */}
                        {!isFullscreen && (
                            <div className={styles.editorPanel}>
                                {/* AI修复按钮 - 右上角 */}
                                {showAIFix && (
                                    <IonButton
                                        className={styles.editorAIFixButton}
                                        onClick={handleAIFixClick}
                                        color="secondary"
                                        size="small"
                                    >
                                        <IonIcon slot="start" icon={sparklesOutline} />
                                        AI 修复
                                    </IonButton>
                                )}
                                
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
                                {/* 版本选择器 - 左上角 */}
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

                                {/* 全屏按钮 - 右上角 */}
                                <IonButton
                                    className={styles.fullscreenButton}
                                    fill="clear"
                                    onClick={toggleFullscreen}
                                >
                                    <IonIcon icon={isFullscreen ? contractOutline : expandOutline} />
                                </IonButton>

                                {/* 预览内容 */}
                                <div 
                                    className={styles.previewContent}
                                    onWheel={handleWheel}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    style={{ cursor: scale !== 1 ? 'grab' : 'default' }}
                                >
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
                                        <div 
                                            ref={previewRef} 
                                            className={styles.mermaidContainer}
                                            style={{
                                                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                                transformOrigin: 'center center',
                                                transition: isPanning.current ? 'none' : 'transform 0.2s ease-out'
                                            }}
                                        />
                                    )}
                                </div>

                                {/* 缩放控制 */}
                                <div className={styles.zoomControls}>
                                    <IonButton fill="clear" size="small" onClick={handleZoomOut} disabled={isLoading || scale <= 0.25}>
                                        <IonIcon icon={removeOutline} />
                                    </IonButton>
                                    <span className={styles.zoomLevel}>{Math.round(scale * 100)}%</span>
                                    <IonButton fill="clear" size="small" onClick={handleZoomIn} disabled={isLoading || scale >= 3}>
                                        <IonIcon icon={addOutline} />
                                    </IonButton>
                                    <IonButton fill="clear" size="small" onClick={handleZoomReset} disabled={isLoading || (scale === 1 && position.x === 0 && position.y === 0)} title="重置缩放">
                                        <IonIcon icon={locateOutline} />
                                    </IonButton>
                                </div>

                                {/* 操作按钮 - 底部 */}
                                <div className={styles.previewActions}>
                                    <IonButton fill="clear" size="small" onClick={handleCopy} disabled={isLoading}>
                                        <IonIcon slot="start" icon={copyOutline} />
                                        复制
                                    </IonButton>
                                    <IonButton fill="clear" size="small" onClick={handleCopyShareLink} disabled={isLoading}>
                                        <IonIcon slot="start" icon={shareOutline} />
                                        分享
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

                {/* AI生成流程图模态框 */}
                <AIGenerateModal
                    isOpen={showAIGenerate}
                    onClose={() => setShowAIGenerate(false)}
                    onGenerate={handleAIGenerate}
                />

                {/* AI悬浮按钮 */}
                <IonButton
                    className={styles.aiFab}
                    onClick={() => setShowAIGenerate(true)}
                    title="AI 生成流程图"
                >
                    <IonIcon icon={sparklesOutline} />
                </IonButton>

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={2000}
                    position="bottom"
                />

                {/* 下载格式选择 */}
                <IonActionSheet
                    isOpen={showDownloadOptions}
                    onDidDismiss={() => setShowDownloadOptions(false)}
                    header="选择下载格式"
                    buttons={[
                        {
                            text: 'SVG 矢量图',
                            icon: documentOutline,
                            handler: downloadAsSVG
                        },
                        {
                            text: 'PNG 图片',
                            icon: imageOutline,
                            handler: downloadAsPNG
                        },
                        {
                            text: 'JPG 图片',
                            icon: imageOutline,
                            handler: downloadAsJPG
                        },
                        {
                            text: '取消',
                            role: 'cancel'
                        }
                    ]}
                />
            </IonContent>
        </IonPage>
    );
}

