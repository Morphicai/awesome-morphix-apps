/**
 * 错误边界组件
 * 
 * 捕获 React 组件树中的 JavaScript 错误，记录错误并显示备用 UI
 */

import React from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon } from '@ionic/react';
import { refreshOutline, bugOutline } from 'ionicons/icons';
import styles from '../styles/ErrorBoundary.module.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary 捕获到错误:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // 可以将错误日志上报给错误监控服务
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReload() {
    // 重新加载页面
    window.location.reload();
  }

  handleReset() {
    // 重置错误状态
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  }

  render() {
    if (this.state.hasError) {
      // 自定义的错误 UI
      return (
        <div className={styles.errorContainer}>
          <IonCard className={styles.errorCard}>
            <IonCardHeader>
              <IonCardTitle className={styles.errorTitle}>
                <IonIcon icon={bugOutline} className={styles.errorIcon} />
                应用出现错误
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className={styles.errorContent}>
                <p className={styles.errorMessage}>
                  抱歉，应用遇到了一个意外错误。请尝试刷新页面或联系技术支持。
                </p>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className={styles.errorDetails}>
                    <summary>错误详情（开发模式）</summary>
                    <pre className={styles.errorStack}>
                      {this.state.error.toString()}
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
                
                <div className={styles.errorActions}>
                  <IonButton 
                    fill="solid" 
                    color="primary"
                    onClick={() => this.handleReload()}
                    className={styles.reloadButton}
                  >
                    <IonIcon icon={refreshOutline} slot="start" />
                    刷新页面
                  </IonButton>
                  
                  <IonButton 
                    fill="outline" 
                    color="medium"
                    onClick={() => this.handleReset()}
                    className={styles.resetButton}
                  >
                    重试
                  </IonButton>
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;