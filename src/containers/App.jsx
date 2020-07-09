import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import '../scss/App.scss';

import Spinner from '../components/spinner'

// Containers
const DefaultLayout = React.lazy(() => import('./DefaultLayout/defaultLayout'));

// Pages
// const Login = React.lazy(() => import('./views/Pages/Login/'));
// const Register = React.lazy(() => import('./views/Pages/Register/'));
// const Page404 = React.lazy(() => import('./views/Pages/Page404/'));
// const Page500 = React.lazy(() => import('./views/Pages/Page500/'));

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
        </Switch>
      </React.Suspense>
    </HashRouter>
  );
}

export default App;
