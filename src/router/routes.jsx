import React from 'react';

// Containers
const Default = React.lazy(() => import('../containers/DefaultLayout/defaultLayout'));

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/', exact: true, name: 'Home', component: Default },
  { path: '*', to: '/' },
];

export default routes;
