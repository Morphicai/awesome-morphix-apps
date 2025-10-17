import React from 'react';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';
import { Route, Switch, Redirect } from 'react-router-dom';

import HomePage from './pages/HomePage';
import AddPage from './pages/AddPage';

import './styles/global.css';

const App = () => {
  return (
    <IonApp>
      <IonReactHashRouter>
        <IonRouterOutlet>
          <Switch>
            <Route path="/home" component={HomePage} exact={true} />
            <Route path="/add" component={AddPage} exact={true} />
            <Route path="/edit/:id" component={AddPage} exact={true} />
            <Redirect from="/" to="/home" exact={true} />
          </Switch>
        </IonRouterOutlet>
      </IonReactHashRouter>
    </IonApp>
  );
};

export default App;