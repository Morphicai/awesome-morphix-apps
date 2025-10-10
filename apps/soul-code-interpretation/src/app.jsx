import React from 'react';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';
import { Route, Redirect, Switch } from 'react-router-dom';

// 导入页面组件
import ExplorePage from './components/ExplorePage';
import TestPage from './components/TestPage';
import ResultPage from './components/ResultPage';
import VaultPage from './components/VaultPage';

// 导入样式
import styles from './styles/App.module.css';
import './styles/GlobalOverrides.css'; // 强制覆盖样式

/**
 * 心灵密码解读 - 主应用组件
 * 
 * 这是一个九型人格测试应用，帮助用户探索内在特质
 * 集成了 MorphixAI 的 AI 能力，提供深度个性化分析
 */
export default function App() {
    return (
        <IonApp className={styles.app}>
            <IonReactHashRouter>
                <IonRouterOutlet>
                    <Switch>
                        {/* 探索页（首页） */}
                        <Route exact path="/explore">
                            <ExplorePage />
                        </Route>

                        {/* 测试页 */}
                        <Route exact path="/test">
                            <TestPage />
                        </Route>

                        {/* 结果页 */}
                        <Route exact path="/result">
                            <ResultPage />
                        </Route>

                        {/* 密码库（历史记录） */}
                        <Route exact path="/vault">
                            <VaultPage />
                        </Route>

                        {/* 默认重定向到探索页 */}
                        <Route exact path="/">
                            <Redirect to="/explore" />
                        </Route>

                        {/* 404 重定向 */}
                        <Route>
                            <Redirect to="/explore" />
                        </Route>
                    </Switch>
                </IonRouterOutlet>
            </IonReactHashRouter>
        </IonApp>
    );
}
