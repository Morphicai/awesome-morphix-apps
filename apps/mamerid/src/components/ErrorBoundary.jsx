import React from 'react';
import { IonButton, IonIcon, IonSpinner } from '@ionic/react';
import { refreshOutline, alertCircleOutline, sparklesOutline } from 'ionicons/icons';
import { reportError } from '@morphixai/lib';
import styles from '../styles/ErrorBoundary.module.css';

/**
 * 错误边界组件
 * 捕获子组件中的 JavaScript 错误，防止整个应用崩溃
 */
export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0,
            isFixing: false,
            fixResult: null
        };
    }

    static getDerivedStateFromError(error) {
        // 更新 state 使下一次渲染能够显示降级后的 UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // 记录错误到错误报告服务
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        this.setState(prevState => ({
            error: error,
            errorInfo: errorInfo,
            errorCount: prevState.errorCount + 1
        }));

        // 上报错误
        reportError(error, 'JavaScriptError', {
            component: 'ErrorBoundary',
            errorInfo: errorInfo.componentStack,
            errorCount: this.state.errorCount + 1,
            boundary: this.props.name || 'Unknown'
        });
    }

    handleReset = () => {
        // 重置错误状态
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            fixResult: null
        });

        // 如果提供了重置回调，执行它
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    handleAIFix = async () => {
        this.setState({ isFixing: true, fixResult: null });

        try {
            // 获取当前代码和错误信息
            const errorMessage = this.state.error?.message || '未知错误';
            
            // 调用 onAIFix 回调获取当前代码
            if (this.props.onAIFix) {
                const result = await this.props.onAIFix(errorMessage);
                this.setState({ 
                    fixResult: result,
                    isFixing: false
                });

                // 如果修复成功，自动重置错误状态
                if (result.success) {
                    setTimeout(() => {
                        this.handleReset();
                    }, 1500);
                }
            } else {
                this.setState({
                    fixResult: { success: false, explanation: '未提供AI修复功能' },
                    isFixing: false
                });
            }
        } catch (error) {
            console.error('AI修复失败:', error);
            await reportError(error, 'JavaScriptError', {
                component: 'ErrorBoundary',
                action: 'handleAIFix'
            });
            this.setState({
                fixResult: { success: false, explanation: '修复失败：' + error.message },
                isFixing: false
            });
        }
    };

    render() {
        if (this.state.hasError) {
            // 渲染备用 UI
            return (
                <div className={styles.errorContainer}>
                    <div className={styles.errorContent}>
                        <IonIcon 
                            icon={alertCircleOutline} 
                            className={styles.errorIcon}
                        />
                        <h3 className={styles.errorTitle}>
                            {this.props.title || '渲染出错'}
                        </h3>
                        <p className={styles.errorMessage}>
                            {this.state.error?.message || '组件渲染时发生了错误'}
                        </p>
                        
                        {this.state.errorCount > 3 && (
                            <div className={styles.errorWarning}>
                                <p>检测到多次错误（{this.state.errorCount} 次）</p>
                                <p>建议检查代码语法或刷新页面</p>
                            </div>
                        )}

                        {/* AI修复结果 */}
                        {this.props.isAIAvailable && this.state.fixResult && (
                            <div className={this.state.fixResult.success ? styles.fixSuccess : styles.fixError}>
                                <p>{this.state.fixResult.explanation}</p>
                            </div>
                        )}

                        <div className={styles.errorActions}>
                            {this.props.isAIAvailable && this.props.onAIFix && (
                                <IonButton 
                                    onClick={this.handleAIFix}
                                    fill="solid"
                                    color="secondary"
                                    disabled={this.state.isFixing}
                                >
                                    {this.state.isFixing ? (
                                        <>
                                            <IonSpinner name="crescent" />
                                            <span style={{ marginLeft: '8px' }}>修复中...</span>
                                        </>
                                    ) : (
                                        <>
                                            <IonIcon slot="start" icon={sparklesOutline} />
                                            AI修复
                                        </>
                                    )}
                                </IonButton>
                            )}
                            <IonButton 
                                onClick={this.handleReset}
                                fill="solid"
                                color="primary"
                                disabled={this.state.isFixing}
                            >
                                <IonIcon slot="start" icon={refreshOutline} />
                                重新加载
                            </IonButton>
                        </div>

                        {/* 开发环境显示详细错误信息 */}
                        {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                            <details className={styles.errorDetails}>
                                <summary>错误详情（开发模式）</summary>
                                <pre className={styles.errorStack}>
                                    {this.state.error?.stack}
                                </pre>
                                <pre className={styles.errorComponentStack}>
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
