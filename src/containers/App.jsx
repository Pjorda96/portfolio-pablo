import React from 'react';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import '../scss/App.scss';
import '../services/internationalization/i18n';

import Spinner from '../components/spinner'
const DefaultLayout = React.lazy(() => import('../containers/DefaultLayout/defaultLayout'));

function App() {
  return (
    <HashRouter>
      <React.Suspense fallback={<Spinner />}>
        <Switch>
          <Route path="/" render={props => <DefaultLayout {...props}/>} />
          <Redirect to='/' />
        </Switch>
      </React.Suspense>
    </HashRouter>
  );
}

export default App;
