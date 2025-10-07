import React, { useState, useEffect, useRef } from 'react';
import { IonPage, IonContent, IonButton, IonSelect, IonSelectOption, IonIcon, IonActionSheet } from '@ionic/react';
import { downloadOutline, expandOutline, contractOutline, addOutline, removeOutline, locateOutline, documentOutline, imageOutline } from 'ionicons/icons';
import { reportError } from '@morphixai/lib';
import MermaidService from '../services/MermaidService';
import styles from '../styles/EmbedView.module.css';

// Mermaid version configuration
const MERMAID_VERSIONS = [
    { version: '11.4.1', label: 'v11.4.1 (Latest)' },
    { version: '11.3.0', label: 'v11.3.0' },
    { version: '11.2.0', label: 'v11.2.0' },
    { version: '11.0.0', label: 'v11.0.0' },
    { version: '10.9.0', label: 'v10.9.0' },
];

// Default code
const DEFAULT_CODE = `graph TD
    A[Start] --> B{Continue?}
    B -->|Yes| C[Execute Operation]
    B -->|No| D[End]
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

    // Get encoded code from URL
    const getCodeFromURL = () => {
        try {
            const hash = window.location.hash;
            const match = hash.match(/[?&]code=([^&]*)/);
            
            if (match && match[1]) {
                // Direct decode (native support for Chinese and all Unicode characters)
                const decodedCode = decodeURIComponent(match[1]);
                return decodedCode;
            }
        } catch (error) {
            console.error('Failed to parse URL parameters:', error);
            reportError(error, 'JavaScriptError', {
                component: 'EmbedView',
                action: 'getCodeFromURL'
            });
        }
        return null;
    };

    // Load Mermaid
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

    // Render diagram
    const renderDiagram = async () => {
        if (!mermaidInstance || !previewRef.current) return;

        try {
            setRenderError(null);
            const codeToRender = code.trim() || DEFAULT_CODE;
            
            // Clear preview area
            previewRef.current.innerHTML = '';
            
            // Generate unique ID
            const id = `mermaid-${Date.now()}`;
            
            // Render
            const { svg } = await mermaidInstance.render(id, codeToRender);
            previewRef.current.innerHTML = svg;
            
        } catch (error) {
            console.error('Render failed:', error);
            setRenderError(error.message);
            await reportError(error, 'JavaScriptError', {
                component: 'EmbedView',
                action: 'renderDiagram'
            });
        }
    };

    // Initialize
    useEffect(() => {
        const init = async () => {
            // Get code from URL
            const urlCode = getCodeFromURL();
            const codeToUse = urlCode || DEFAULT_CODE;
            setCode(codeToUse);
            
            // Load Mermaid
            await loadMermaid(currentVersion);
        };
        init();
    }, []);

    // Auto render when code or Mermaid instance changes
    useEffect(() => {
        if (mermaidInstance && code) {
            renderDiagram();
        }
    }, [code, mermaidInstance]);

    // Version change
    const handleVersionChange = async (newVersion) => {
        setCurrentVersion(newVersion);
        await loadMermaid(newVersion);
    };

    // Show download options
    const handleDownload = () => {
        setShowDownloadOptions(true);
    };

    // Download as SVG
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

    // Download as PNG
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
            console.error('PNG download error:', error);
            await reportError(error, 'JavaScriptError', {
                component: 'EmbedView',
                action: 'downloadAsPNG'
            });
        }
    };

    // Download as JPG
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
            console.error('JPG download error:', error);
            await reportError(error, 'JavaScriptError', {
                component: 'EmbedView',
                action: 'downloadAsJPG'
            });
        }
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
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScale(prev => Math.max(0.25, Math.min(3, prev + delta)));
    };

    // Mouse drag
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

    // Touch gestures
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

    // Toggle fullscreen
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
                    {/* Preview area */}
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
                            <IonIcon slot="icon-only" icon={isFullscreen ? contractOutline : expandOutline} />
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
                                        transformOrigin: 'center',
                                        transition: isPanning.current ? 'none' : 'transform 0.2s ease-out',
                                        cursor: isPanning.current ? 'grabbing' : 'grab'
                                    }}
                                />
                            )}
                        </div>

                        {/* Zoom controls - bottom left */}
                        <div className={styles.zoomControls}>
                            <IonButton fill="clear" size="small" onClick={handleZoomOut} disabled={isLoading || scale <= 0.25}>
                                <IonIcon icon={removeOutline} />
                            </IonButton>
                            <span className={styles.zoomText}>{Math.round(scale * 100)}%</span>
                            <IonButton fill="clear" size="small" onClick={handleZoomIn} disabled={isLoading || scale >= 3}>
                                <IonIcon icon={addOutline} />
                            </IonButton>
                            <IonButton fill="clear" size="small" onClick={handleZoomReset} disabled={isLoading || (scale === 1 && position.x === 0 && position.y === 0)} title="Reset Zoom">
                                <IonIcon icon={locateOutline} />
                            </IonButton>
                        </div>

                        {/* Download button - bottom */}
                        <div className={styles.previewActions}>
                            <IonButton fill="clear" size="small" onClick={handleDownload} disabled={isLoading || !mermaidInstance}>
                                <IonIcon slot="start" icon={downloadOutline} />
                                Download
                            </IonButton>
                        </div>
                    </div>

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
                </div>
            </IonContent>
        </IonPage>
    );
}

export default EmbedView;

