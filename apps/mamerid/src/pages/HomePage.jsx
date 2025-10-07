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

// Default code (used when code is empty)
const DEFAULT_CODE = `graph TD
    A[Start] --> B{Condition}
    B -->|Yes| C[Execute Operation A]
    B -->|No| D[Execute Operation B]
    C --> E[End]
    D --> E`;

// Mermaid version list
const MERMAID_VERSIONS = [
    { version: '11.4.1', label: 'v11.4.1 (Latest)' },
    { version: '11.0.0', label: 'v11.0.0' },
    { version: '10.9.0', label: 'v10.9.0' },
    { version: '10.0.0', label: 'v10.0.0' }
];

/**
 * Mermaid Diagram Previewer Home Page
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

    // Load Mermaid instance (using MermaidService)
    const loadMermaid = async (version) => {
        try {
            setIsLoading(true);
            setRenderError(null);
            
            // Load using service (automatically cached)
            const mermaid = await MermaidService.loadMermaid(version);
            
            setMermaidInstance(mermaid);
            setIsLoading(false);
            
            // Display cache status
            const stats = MermaidService.getCacheStats();
            console.log('Mermaid cache status:', stats);
            
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

    // Get encoded code from URL
    const getCodeFromURL = () => {
        try {
            // Get parameters after hash
            const hash = window.location.hash;
            // Match #/?code=xxx or #/code=xxx or #?code=xxx
            const match = hash.match(/[?&]code=([^&]*)/);
            
            if (match && match[1]) {
                // Direct decode (native support for Chinese and all Unicode characters)
                const decodedCode = decodeURIComponent(match[1]);
                return decodedCode;
            }
        } catch (error) {
            console.error('Failed to parse URL parameters:', error);
            reportError(error, 'JavaScriptError', {
                component: 'HomePage',
                action: 'getCodeFromURL'
            });
        }
        return null;
    };

    // Initialize
    useEffect(() => {
        const init = async () => {
            // Try to get code from URL first
            const urlCode = getCodeFromURL();
            
            if (urlCode) {
                // If URL has code, use URL code
                setCode(urlCode);
            } else {
                // Otherwise load saved data (including version)
                await loadSavedData();
            }
            
            // Use saved version or default version
            const savedVersion = localStorage.getItem('mermaid_version');
            const versionToLoad = savedVersion || currentVersion;
            await loadMermaid(versionToLoad);
            
            // Optional: Preload other common versions (background loading, non-blocking)
            const otherVersions = MERMAID_VERSIONS
                .filter(v => v.version !== versionToLoad)
                .slice(0, 2) // Only preload first two other versions
                .map(v => v.version);
            
            if (otherVersions.length > 0) {
                // Delayed preload, doesn't affect current version usage
                setTimeout(() => {
                    MermaidService.preloadVersions(otherVersions);
                }, 2000);
            }
        };
        init();
    }, []);

    // Load saved data
    const loadSavedData = async () => {
        try {
            const savedCode = localStorage.getItem('mermaid_code');
            const savedVersion = localStorage.getItem('mermaid_version');
            
            // If no saved code, use default code
            const codeToUse = savedCode || DEFAULT_CODE;
            setCode(codeToUse);
            if (savedVersion) setCurrentVersion(savedVersion);
            
            // Return saved data
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

    // Save data (and save to history)
    const saveData = async () => {
        try {
            const codeToSave = code.trim() || DEFAULT_CODE;
            localStorage.setItem('mermaid_code', codeToSave);
            localStorage.setItem('mermaid_version', currentVersion);
            
            // Save to history
            HistoryService.saveToHistory(codeToSave, currentVersion);
            
            showToastMessage('Saved');
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'HomePage',
                action: 'saveData'
            });
        }
    };

    // Render Mermaid diagram
    const renderDiagram = async () => {
        const codeToRender = code.trim() || DEFAULT_CODE;
        
        if (!previewRef.current || !mermaidInstance) {
            return;
        }

        try {
            setRenderError(null);
            setShowAIFix(false);
            const renderId = `mermaid-${renderIdRef.current++}`;
            
            // Clear preview area
            previewRef.current.innerHTML = '';
            
            // Create temporary container
            const container = document.createElement('div');
            container.id = renderId;
            container.innerHTML = codeToRender;
            previewRef.current.appendChild(container);

            // Render diagram
            await mermaidInstance.run({
                nodes: [container]
            });

        } catch (error) {
            setRenderError(error.message || 'Render failed');
            setShowAIFix(true); // Show AI fix button
            await reportError(error, 'JavaScriptError', {
                component: 'HomePage',
                action: 'renderDiagram'
            });
        }
    };

    // Auto render when code or mermaid instance changes
    useEffect(() => {
        if (mermaidInstance) {
            const timer = setTimeout(() => {
                renderDiagram();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [code, mermaidInstance]);

    // Reload Mermaid when version changes
    const handleVersionChange = async (version) => {
        setCurrentVersion(version);
        await loadMermaid(version);
        // Auto save version selection
        try {
            localStorage.setItem('mermaid_version', version);
        } catch (error) {
            console.warn('Failed to save version:', error);
        }
    };

    // Select history record
    const handleSelectHistory = (historyItem) => {
        setCode(historyItem.code);
        setCurrentVersion(historyItem.version);
        // Switch version
        if (historyItem.version !== currentVersion) {
            handleVersionChange(historyItem.version);
        }
    };

    // Copy code
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            showToastMessage('Code copied');
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'HomePage',
                action: 'handleCopy'
            });
            showToastMessage('Copy failed');
        }
    };

    // Show download options
    const handleDownload = () => {
        setShowDownloadOptions(true);
    };

    // Download as SVG
    const downloadAsSVG = async () => {
        try {
            const svgElement = previewRef.current?.querySelector('svg');
            if (!svgElement) {
                showToastMessage('No diagram to download');
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
            showToastMessage('✅ SVG downloaded');
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'HomePage',
                action: 'downloadAsSVG'
            });
            showToastMessage('Download failed');
        }
    };

    // Download as PNG
    const downloadAsPNG = async () => {
        try {
            const svgElement = previewRef.current?.querySelector('svg');
            if (!svgElement) {
                showToastMessage('No diagram to download');
                return;
            }

            showToastMessage('Generating PNG...');

            // Clone SVG
            const clonedSvg = svgElement.cloneNode(true);
            
            // Get SVG dimensions
            const bbox = svgElement.getBBox();
            const width = Math.ceil(bbox.width) || 800;
            const height = Math.ceil(bbox.height) || 600;
            
            // Set SVG attributes
            clonedSvg.setAttribute('width', width);
            clonedSvg.setAttribute('height', height);
            clonedSvg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${width} ${height}`);

            // Serialize SVG
            const svgData = new XMLSerializer().serializeToString(clonedSvg);
            const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);

            // Create canvas
            const canvas = document.createElement('canvas');
            const scale = 2; // 2x resolution
            canvas.width = width * scale;
            canvas.height = height * scale;
            const ctx = canvas.getContext('2d');

            // Set white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.scale(scale, scale);

            // Load and draw image
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                try {
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to PNG and download
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
                            showToastMessage('✅ PNG downloaded');
                        } else {
                            showToastMessage('PNG generation failed');
                        }
                    }, 'image/png');
                } catch (err) {
                    console.error('Canvas drawing failed:', err);
                    showToastMessage('PNG conversion failed');
                }
            };
            
            img.onerror = (err) => {
                console.error('Image loading failed:', err);
                showToastMessage('PNG conversion failed, please retry');
            };
            
            img.src = svgDataUrl;
        } catch (error) {
            console.error('PNG download error:', error);
            await reportError(error, 'JavaScriptError', {
                component: 'HomePage',
                action: 'downloadAsPNG'
            });
            showToastMessage('Download failed');
        }
    };

    // Download as JPG
    const downloadAsJPG = async () => {
        try {
            const svgElement = previewRef.current?.querySelector('svg');
            if (!svgElement) {
                showToastMessage('No diagram to download');
                return;
            }

            showToastMessage('Generating JPG...');

            // Clone SVG
            const clonedSvg = svgElement.cloneNode(true);
            
            // Get SVG dimensions
            const bbox = svgElement.getBBox();
            const width = Math.ceil(bbox.width) || 800;
            const height = Math.ceil(bbox.height) || 600;
            
            // Set SVG attributes
            clonedSvg.setAttribute('width', width);
            clonedSvg.setAttribute('height', height);
            clonedSvg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${width} ${height}`);

            // Serialize SVG
            const svgData = new XMLSerializer().serializeToString(clonedSvg);
            const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);

            // Create canvas
            const canvas = document.createElement('canvas');
            const scale = 2; // 2x resolution
            canvas.width = width * scale;
            canvas.height = height * scale;
            const ctx = canvas.getContext('2d');

            // Set white background (JPG doesn't support transparency)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.scale(scale, scale);

            // Load and draw image
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                try {
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to JPG and download
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
                            showToastMessage('✅ JPG downloaded');
                        } else {
                            showToastMessage('JPG generation failed');
                        }
                    }, 'image/jpeg', 0.95);
                } catch (err) {
                    console.error('Canvas drawing failed:', err);
                    showToastMessage('JPG conversion failed');
                }
            };
            
            img.onerror = (err) => {
                console.error('Image loading failed:', err);
                showToastMessage('JPG conversion failed, please retry');
            };
            
            img.src = svgDataUrl;
        } catch (error) {
            console.error('JPG download error:', error);
            await reportError(error, 'JavaScriptError', {
                component: 'HomePage',
                action: 'downloadAsJPG'
            });
            showToastMessage('Download failed');
        }
    };

    // Generate share link (pointing to embed page)
    const generateShareLink = () => {
        try {
            const codeToShare = code.trim() || DEFAULT_CODE;
            // Direct use of encodeURIComponent (simple and reliable, native support for Chinese)
            const baseUrl = window.location.origin + window.location.pathname;
            const shareUrl = `${baseUrl}#/embed?code=${encodeURIComponent(codeToShare)}`;
            return shareUrl;
        } catch (error) {
            console.error('Failed to generate share link:', error);
            reportError(error, 'JavaScriptError', {
                component: 'HomePage',
                action: 'generateShareLink'
            });
            return null;
        }
    };

    // Copy share link
    const handleCopyShareLink = async () => {
        try {
            const shareUrl = generateShareLink();
            if (!shareUrl) {
                showToastMessage('Failed to generate share link');
                return;
            }
            
            await navigator.clipboard.writeText(shareUrl);
            showToastMessage('✨ Share link copied to clipboard');
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'HomePage',
                action: 'handleCopyShareLink'
            });
            showToastMessage('Copy failed');
        }
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Zoom functionality
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

    // Mouse wheel zoom
    const handleWheel = (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setScale(prev => Math.max(0.25, Math.min(3, prev + delta)));
        }
    };

    // Drag pan
    const handleMouseDown = (e) => {
        if (e.button === 0) { // Left button
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

    // Touch event handling (mobile pinch zoom)
    const touchStartDistance = useRef(0);
    const touchStartScale = useRef(1);

    const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
            // Pinch zoom
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

    // AI fix functionality
    const handleAIFixClick = async () => {
        try {
            setShowAIFix(false);
            showToastMessage('AI fixing...');
            
            const result = await AIService.fixMermaidCode(code, renderError || 'Unknown error');
            
            if (result.success && result.fixedCode) {
                // Update code
                setCode(result.fixedCode);
                // Save to history
                await HistoryService.saveToHistory(result.fixedCode, currentVersion);
                // Show success message
                showToastMessage('✨ AI fix successful!');
            } else {
                showToastMessage(result.explanation || 'AI fix failed');
                setShowAIFix(true); // Continue showing fix button after failure
            }
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'HomePage',
                action: 'handleAIFixClick'
            });
            showToastMessage('Fix failed: ' + error.message);
            setShowAIFix(true);
        }
    };

    // AI generate flowchart
    const handleAIGenerate = async (description) => {
        try {
            const result = await AIService.generateMermaidFromDescription(description);
            
            if (result.success && result.code) {
                // Update code
                setCode(result.code);
                // Save to history
                await HistoryService.saveToHistory(result.code, currentVersion);
                // Show success message
                showToastMessage('✨ AI generation successful!');
            } else {
                showToastMessage(result.explanation || 'AI generation failed');
            }
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'HomePage',
                action: 'handleAIGenerate'
            });
            showToastMessage('Generation failed: ' + error.message);
        }
    };

    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
    };

    return (
        <IonPage>
            <PageHeader title="Mermaid Previewer" />
            <IonContent className={styles.content}>
                <div className={`${styles.container} ${isFullscreen ? styles.fullscreen : ''}`}>
                    {/* Toolbar */}
                    <div className={styles.toolbar}>
                        <div className={styles.toolbarLeft}>
                            {/* Empty placeholder */}
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

                    {/* Main content area */}
                    <div className={styles.mainContent}>
                        {/* Editor area */}
                        {!isFullscreen && (
                            <div className={styles.editorPanel}>
                                {/* AI fix button - top right */}
                                {showAIFix && (
                                    <IonButton
                                        className={styles.editorAIFixButton}
                                        onClick={handleAIFixClick}
                                        color="secondary"
                                        size="small"
                                    >
                                        <IonIcon slot="start" icon={sparklesOutline} />
                                        AI Fix
                                    </IonButton>
                                )}
                                
                                <IonTextarea
                                    value={code}
                                    onIonInput={(e) => setCode(e.detail.value)}
                                    className={styles.codeEditor}
                                    placeholder="Enter Mermaid code..."
                                    rows={20}
                                    spellcheck={false}
                                    autoGrow={true}
                                />
                            </div>
                        )}

                        {/* Preview area */}
                        <ErrorBoundary 
                            name="PreviewPanel"
                            title="Preview render failed"
                            onReset={() => {
                                // Clear preview area on reset
                                if (previewRef.current) {
                                    previewRef.current.innerHTML = '';
                                }
                                setRenderError(null);
                                // Re-render
                                setTimeout(() => renderDiagram(), 100);
                            }}
                        >
                            <div className={styles.previewPanel}>
                                {/* Version selector - top left */}
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

                                {/* Fullscreen button - top right */}
                                <IonButton
                                    className={styles.fullscreenButton}
                                    fill="clear"
                                    onClick={toggleFullscreen}
                                >
                                    <IonIcon icon={isFullscreen ? contractOutline : expandOutline} />
                                </IonButton>

                                {/* Preview content */}
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
                                            Loading Mermaid v{currentVersion}...
                                        </div>
                                    ) : renderError ? (
                                        <div className={styles.errorMessage}>
                                            <p>Render Error:</p>
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

                                {/* Zoom controls */}
                                <div className={styles.zoomControls}>
                                    <IonButton fill="clear" size="small" onClick={handleZoomOut} disabled={isLoading || scale <= 0.25}>
                                        <IonIcon icon={removeOutline} />
                                    </IonButton>
                                    <span className={styles.zoomLevel}>{Math.round(scale * 100)}%</span>
                                    <IonButton fill="clear" size="small" onClick={handleZoomIn} disabled={isLoading || scale >= 3}>
                                        <IonIcon icon={addOutline} />
                                    </IonButton>
                                    <IonButton fill="clear" size="small" onClick={handleZoomReset} disabled={isLoading || (scale === 1 && position.x === 0 && position.y === 0)} title="Reset Zoom">
                                        <IonIcon icon={locateOutline} />
                                    </IonButton>
                                </div>

                                {/* Action buttons - bottom */}
                                <div className={styles.previewActions}>
                                    <IonButton fill="clear" size="small" onClick={handleCopy} disabled={isLoading}>
                                        <IonIcon slot="start" icon={copyOutline} />
                                        Copy
                                    </IonButton>
                                    <IonButton fill="clear" size="small" onClick={handleCopyShareLink} disabled={isLoading}>
                                        <IonIcon slot="start" icon={shareOutline} />
                                        Share
                                    </IonButton>
                                    <IonButton fill="clear" size="small" onClick={saveData} disabled={isLoading}>
                                        <IonIcon slot="start" icon={bookmarkOutline} />
                                        Save
                                    </IonButton>
                                    <IonButton fill="clear" size="small" onClick={handleDownload} disabled={isLoading || !mermaidInstance}>
                                        <IonIcon slot="start" icon={downloadOutline} />
                                        Download
                                    </IonButton>
                                </div>
                            </div>
                        </ErrorBoundary>
                    </div>
                </div>

                {/* History panel */}
                <ErrorBoundary 
                    name="HistoryPanel"
                    title="History loading failed"
                    onReset={() => setShowHistory(false)}
                >
                    <HistoryPanel
                        isOpen={showHistory}
                        onClose={() => setShowHistory(false)}
                        onSelectHistory={handleSelectHistory}
                    />
                </ErrorBoundary>

                {/* AI generate flowchart modal */}
                <AIGenerateModal
                    isOpen={showAIGenerate}
                    onClose={() => setShowAIGenerate(false)}
                    onGenerate={handleAIGenerate}
                />

                {/* AI floating button */}
                <IonButton
                    className={styles.aiFab}
                    onClick={() => setShowAIGenerate(true)}
                    title="AI Generate Flowchart"
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

                {/* Download format selection */}
                <IonActionSheet
                    isOpen={showDownloadOptions}
                    onDidDismiss={() => setShowDownloadOptions(false)}
                    header="Select Download Format"
                    buttons={[
                        {
                            text: 'SVG Vector',
                            icon: documentOutline,
                            handler: downloadAsSVG
                        },
                        {
                            text: 'PNG Image',
                            icon: imageOutline,
                            handler: downloadAsPNG
                        },
                        {
                            text: 'JPG Image',
                            icon: imageOutline,
                            handler: downloadAsJPG
                        },
                        {
                            text: 'Cancel',
                            role: 'cancel'
                        }
                    ]}
                />
            </IonContent>
        </IonPage>
    );
}

