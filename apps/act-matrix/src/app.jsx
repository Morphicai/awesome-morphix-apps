import React from 'react';
import {
    IonApp,
    IonRouterOutlet,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
} from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';
import { Switch, Route, Redirect } from 'react-router-dom';
import ActMatrixForm from './components/ActMatrixForm';
import AwayMovesDetail from './components/AwayMovesDetail.jsx';
import HooksRecordTable from './components/HooksRecordTable.jsx';
import GuidedFormPage from './components/GuidedFormPage.jsx';
import GuidedSummaryPage from './components/GuidedSummaryPage.jsx';
import { MatrixProvider } from './store/matrixStore';
import { grid, compass } from 'ionicons/icons';
import styles from './styles/App.module.css';
import './styles/PaperTheme.css';

/**
 * 主应用组件
 * 
 * 使用 Tab 布局分为两个模块：
 * - 首页：ACT 矩阵主功能
 * - 工具：引导练习表单
 */
export default function App() {
    return (
        <MatrixProvider>
            <IonApp>
                <IonReactHashRouter>
                    <IonTabs>
                        <IonRouterOutlet>
                            <Switch>
                                <Route exact path="/">
                                    <Redirect to="/matrix" />
                                </Route>
                                <Route exact path="/matrix">
                                    <ActMatrixForm />
                                </Route>
                                <Route path="/away/:matrixId?">
                                    <AwayMovesDetail />
                                </Route>
                                <Route path="/hooks/:matrixId">
                                    <HooksRecordTable />
                                </Route>
                                <Route exact path="/guided">
                                    <GuidedFormPage />
                                </Route>
                                <Route exact path="/guided/summary">
                                    <GuidedSummaryPage />
                                </Route>
                            </Switch>
                        </IonRouterOutlet>

                        <IonTabBar slot="bottom" className={styles.tabBar}>
                            <IonTabButton tab="matrix" href="/matrix">
                                <IonIcon icon={grid} />
                                <IonLabel>首页</IonLabel>
                            </IonTabButton>
                            <IonTabButton tab="guided" href="/guided">
                                <IonIcon icon={compass} />
                                <IonLabel>工具</IonLabel>
                            </IonTabButton>
                        </IonTabBar>
                    </IonTabs>
                </IonReactHashRouter>
            </IonApp>
        </MatrixProvider>
    );
}