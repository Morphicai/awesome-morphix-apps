import React from 'react';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EmbedView from './components/EmbedView';

export default function App() {
    return (
        <IonApp>
            <IonReactHashRouter>
                <IonRouterOutlet>
                    <Route exact path="/" component={HomePage} />
                    <Route exact path="/embed" component={EmbedView} />
                </IonRouterOutlet>
            </IonReactHashRouter>
        </IonApp>
    );
}
