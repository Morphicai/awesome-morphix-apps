import React from 'react';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';
import { Switch, Route } from 'react-router-dom';
import ActMatrixForm from './components/ActMatrixForm';
import AwayMovesDetail from './components/AwayMovesDetail.jsx';
import { MatrixProvider } from './store/matrixStore';
import styles from './styles/App.module.css';
import './styles/PaperTheme.css';

/**
 * 主应用组件
 * 
 * 当前使用 Welcome 组件作为演示页面
 * 在实际开发中，请替换 Welcome 组件为您的应用内容
 */
export default function App() {
    return (
        <MatrixProvider>
            <IonApp>
                <IonReactHashRouter>
                    <IonRouterOutlet>
                        <Switch>
                            <Route exact path="/">
                                <ActMatrixForm />
                            </Route>
                            <Route path="/away/:matrixId?">
                                <AwayMovesDetail />
                            </Route>
                        </Switch>
                    </IonRouterOutlet>
                </IonReactHashRouter>
            </IonApp>
        </MatrixProvider>
    );
}