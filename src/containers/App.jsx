import React from 'react';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import '../scss/App.scss';

import Routes from '../router/routes'

import Spinner from '../components/spinner'
const DefaultLayout = React.lazy(() => import('../containers/DefaultLayout/defaultLayout'));

function App() {
  return (
    <HashRouter>
      <React.Suspense fallback={<Spinner />}>
        <Switch>
          {/*<Route exact path="/login" render={props => <Login id={1} {...props}/>} />
          <Route exact path="/register" render={props => <Register {...props}/>} />
          <Route exact path="/404" render={props => <Page404 {...props}/>} />
          <Route exact path="/500" render={props => <Page500 {...props}/>} />
          <Route path="/" render={props => <DefaultLayout {...props}/>} />*/}
          <Route path="/" render={props => <DefaultLayout {...props}/>} />
          <Redirect to='/' />
        </Switch>
      </React.Suspense>
    </HashRouter>
  );
}

export default App;
