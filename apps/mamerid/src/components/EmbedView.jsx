import React, { useState, useEffect, useRef } from 'react';
import { IonPage, IonContent, IonButton, IonSelect, IonSelectOption, IonIcon, IonActionSheet } from '@ionic/react';
import { downloadOutline, expandOutline, contractOutline, addOutline, removeOutline, locateOutline, documentOutline, imageOutline } from 'ionicons/icons';
import { reportError } from '@morphixai/lib';
import MermaidService from '../services/MermaidService';
import styles from '../styles/EmbedView.module.css';

// Mermaid 版本配置
const MERMAID_VERSIONS = [
    { version: '11.4.1', label: 'v11.4.1 (最新)' },
    { version: '11.3.0', label: 'v11.3.0' },
    { version: '11.2.0', label: 'v11.2.0' },
    { version: '11.0.0', label: 'v11.0.0' },
    { version: '10.9.0', label: 'v10.9.0' },
];

// 默认代码
const DEFAULT_CODE = `graph TD
    A[开始] --> B{是否继续?}
    B -->|是| C[执行操作]
    B -->|否| D[结束]
    C --> D`;

function EmbedView() {
    const [code, setCode] = useState('');
    const [currentVersion, setCurrentVersion] = useState(MERMAID_VERSIONS[0].version);
    const [mermaidInstance, setMermaidInstance] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [renderError, setRenderError] = useState(null);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);

    const previewRef = useRef(null);
    const isPanning = useRef(false);
    const lastPosition = useRef({ x: 0, y: 0 });
    const touchStartDistance = useRef(0);
    const touchStartScale = useRef(1);

    // 从 URL 获取编码的代码参数
    const getCodeFromURL = () => {
        try {
            const hash = window.location.hash;
            const match = hash.match(/[?&]code=([^&]*)/);
            
            if (match && match[1]) {
                // 直接解码（原生支持中文和所有 Unicode 字符）
                const decodedCode = decodeURIComponent(match[1]);
                return decodedCode;
            }
        } catch (error) {
            console.error('解析 URL 参数失败:', error);
            reportError(error, 'JavaScriptError', {
                component: 'EmbedView',
                action: 'getCodeFromURL'
            });
        }
        return null;
    };

    // 加载 Mermaid
    const loadMermaid = async (version) => {
        try {
            setIsLoading(true);
            const instance = await MermaidService.loadMermaid(version);
            setMermaidInstance(instance);
            setIsLoading(false);
            return instance;
        } catch (error) {
            setIsLoading(false);
            await reportError(error, 'JavaScriptError', {
                component: 'EmbedView',
                action: 'loadMermaid',
                version
            });
            return null;
        }
    };

    // 渲染图表
    const renderDiagram = async () => {
        if (!mermaidInstance || !previewRef.current) return;

        try {
            setRenderError(null);
            const codeToRender = code.trim() || DEFAULT_CODE;
            
            // 清空预览区域
            previewRef.current.innerHTML = '';
            
            // 生成唯一 ID
            const id = `mermaid-${Date.now()}`;
            
            // 渲染
            const { svg } = await mermaidInstance.render(id, codeToRender);
            previewRef.current.innerHTML = svg;
            
        } catch (error) {
            console.error('渲染失败:', error);
            setRenderError(error.message);
            await reportError(error, 'JavaScriptError', {
                component: 'EmbedView',
                action: 'renderDiagram'
            });
        }
    };

    // 初始化
    useEffect(() => {
        const init = async () => {
            // 从 URL 获取代码
            const urlCode = getCodeFromURL();
            const codeToUse = urlCode || DEFAULT_CODE;
            setCode(codeToUse);
            
            // 加载 Mermaid
            await loadMermaid(currentVersion);
        };
        init();
    }, []);

    // 当代码或 Mermaid 实例变化时自动渲染
    useEffect(() => {
        if (mermaidInstance && code) {
            renderDiagram();
        }
    }, [code, mermaidInstance]);

    // 版本切换
    const handleVersionChange = async (newVersion) => {
        setCurrentVersion(newVersion);
        await loadMermaid(newVersion);
    };

    // 显示下载选项
    const handleDownload = () => {
        setShowDownloadOptions(true);
    };

    // 下载为 SVG
    const downloadAsSVG = async () => {
        try {
            const svgElement = previewRef.current?.querySelector('svg');
            if (!svgElement) return;

            const svgData = new XMLSerializer().serializeToString(svgElement);
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `mermaid-diagram-${Date.now()}.svg`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'EmbedView',
                action: 'downloadAsSVG'
            });
        }
    };

    // 下载为 PNG
    const downloadAsPNG = async () => {
        try {
            const svgElement = previewRef.current?.querySelector('svg');
            if (!svgElement) return;

            const clonedSvg = svgElement.cloneNode(true);
            const bbox = svgElement.getBBox();
            const width = Math.ceil(bbox.width) || 800;
            const height = Math.ceil(bbox.height) || 600;
            
            clonedSvg.setAttribute('width', width);
            clonedSvg.setAttribute('height', height);
            clonedSvg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${width} ${height}`);

            const svgData = new XMLSerializer().serializeToString(clonedSvg);
            const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);

            const canvas = document.createElement('canvas');
            const scale = 2;
            canvas.width = width * scale;
            canvas.height = height * scale;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.scale(scale, scale);

            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                ctx.drawImage(img, 0, 0, width, height);
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
                    }
                }, 'image/png');
            };
            
            img.src = svgDataUrl;
        } catch (error) {
            console.error('PNG 下载错误:', error);
            await reportError(error, 'JavaScriptError', {
                component: 'EmbedView',
                action: 'downloadAsPNG'
            });
        }
    };

    // 下载为 JPG
    const downloadAsJPG = async () => {
        try {
            const svgElement = previewRef.current?.querySelector('svg');
            if (!svgElement) return;

            const clonedSvg = svgElement.cloneNode(true);
            const bbox = svgElement.getBBox();
            const width = Math.ceil(bbox.width) || 800;
            const height = Math.ceil(bbox.height) || 600;
            
            clonedSvg.setAttribute('width', width);
            clonedSvg.setAttribute('height', height);
            clonedSvg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${width} ${height}`);

            const svgData = new XMLSerializer().serializeToString(clonedSvg);
            const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);

            const canvas = document.createElement('canvas');
            const scale = 2;
            canvas.width = width * scale;
            canvas.height = height * scale;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.scale(scale, scale);

            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                ctx.drawImage(img, 0, 0, width, height);
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
                    }
                }, 'image/jpeg', 0.95);
            };
            
            img.src = svgDataUrl;
        } catch (error) {
            console.error('JPG 下载错误:', error);
            await reportError(error, 'JavaScriptError', {
                component: 'EmbedView',
                action: 'downloadAsJPG'
            });
        }
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
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScale(prev => Math.max(0.25, Math.min(3, prev + delta)));
    };

    // 鼠标拖拽
    const handleMouseDown = (e) => {
        if (e.button === 0) {
            isPanning.current = true;
            lastPosition.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseMove = (e) => {
        if (!isPanning.current) return;
        
        const deltaX = e.clientX - lastPosition.current.x;
        const deltaY = e.clientY - lastPosition.current.y;
        
        setPosition(prev => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY
        }));
        
        lastPosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        isPanning.current = false;
    };

    // 触摸手势
    const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
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

    // 切换全屏
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
        setIsFullscreen(!isFullscreen);
    };

    return (
        <IonPage>
            <IonContent className={styles.content}>
                <div className={styles.container}>
                    {/* 预览区域 */}
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
                            <IonIcon slot="icon-only" icon={isFullscreen ? contractOutline : expandOutline} />
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
                                        transformOrigin: 'center',
                                        transition: isPanning.current ? 'none' : 'transform 0.2s ease-out',
                                        cursor: isPanning.current ? 'grabbing' : 'grab'
                                    }}
                                />
                            )}
                        </div>

                        {/* 缩放控制 - 左下角 */}
                        <div className={styles.zoomControls}>
                            <IonButton fill="clear" size="small" onClick={handleZoomOut} disabled={isLoading || scale <= 0.25}>
                                <IonIcon icon={removeOutline} />
                            </IonButton>
                            <span className={styles.zoomText}>{Math.round(scale * 100)}%</span>
                            <IonButton fill="clear" size="small" onClick={handleZoomIn} disabled={isLoading || scale >= 3}>
                                <IonIcon icon={addOutline} />
                            </IonButton>
                            <IonButton fill="clear" size="small" onClick={handleZoomReset} disabled={isLoading || (scale === 1 && position.x === 0 && position.y === 0)} title="重置缩放">
                                <IonIcon icon={locateOutline} />
                            </IonButton>
                        </div>

                        {/* 下载按钮 - 底部 */}
                        <div className={styles.previewActions}>
                            <IonButton fill="clear" size="small" onClick={handleDownload} disabled={isLoading || !mermaidInstance}>
                                <IonIcon slot="start" icon={downloadOutline} />
                                下载图表
                            </IonButton>
                        </div>
                    </div>

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
                </div>
            </IonContent>
        </IonPage>
    );
}

export default EmbedView;

