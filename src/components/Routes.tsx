import React, { useState, useRef } from 'react';
import { createBrowserHistory } from 'history';
import {
  IRoute,
  INamespace,
  CreatedFilterOptions,
  DataView,
} from '../interfaces';
import { Dashboard } from '../views/Dashboard';
import { Data } from '../views/Data/Data';
import { Transactions } from '../views/Transactions/Transactions';
import { TransactionDetails } from '../views/Transactions/TransactionDetails';
import { Messages } from '../views/Messages/Messages';
import { NamespaceContext } from '../contexts/NamespaceContext';
import { ApplicationContext } from '../contexts/ApplicationContext';
import ReconnectingWebSocket from 'reconnecting-websocket';

const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const history = createBrowserHistory({
  basename: process.env.PUBLIC_URL,
});

export const Routes = () => {
  const [initializing, setInitializing] = useState(true);
  const [namespaces, setNamespaces] = useState<INamespace[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState<string>('');
  const [dataView, setDataView] = useState<DataView>('list');
  const [identity, setIdentity] = useState('');
  const [orgName, setOrgName] = useState('');
  const [createdFilter, setCreatedFilter] =
    useState<CreatedFilterOptions>('24hours');
  const ws = useRef<ReconnectingWebSocket | null>(null);
  const [lastEvent, setLastEvent] = useState<any>();

  const routes: IRoute[] = [
    {
      exact: true,
      path: '/:namespace/transactions/:id',
      component: TransactionDetails,
    },
    {
      exact: true,
      path: '/:namespace/transactions',
      component: Transactions,
    },
    {
      exact: true,
      path: '/:namespace/data',
      component: Messages,
    },
    {
      exact: true,
      path: '/:namespace/messages',
      component: Messages,
    },
    {
      exact: true,
      path: '/:namespace',
      component: Dashboard,
    },
    {
      exact: true,
      path: '/',
      component: Dashboard,
    },
  ];

  return (
    <NamespaceContext.Provider
      value={{
        namespaces,
        selectedNamespace,
        setNamespaces,
        setSelectedNamespace,
      }}
    >
      <ApplicationContext.Provider
        value={{
          orgName,
          identity,
          dataView,
          setDataView,
          lastEvent,
          setLastEvent,
          createdFilter,
          setCreatedFilter,
        }}
      >
        <Router history={history}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <AppWrapper>
              <Switch>
                <Route exact path="/" render={() => <Dashboard />} />
                <Route exact path="/messages" render={() => <Messages />} />
                <Route exact path="/data" render={() => <Data />} />
                <Route
                  exact
                  path="/transactions"
                  render={() => <Transactions />}
                />
                <Route
                  exact
                  path="/transactions/:id"
                  render={() => <TransactionDetails />}
                />
              </Switch>
            </AppWrapper>
          </QueryParamProvider>
        </Router>
      </ApplicationContext.Provider>
    </NamespaceContext.Provider>
  );
};
