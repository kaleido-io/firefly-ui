import { RouteObject } from 'react-router-dom';
import { NAMESPACES_PATH } from '../../interfaces';
import { DataExchangeDashboard } from './Views/Dashboard';
// import { TokensAccounts } from './views/Accounts';
// import { TokensDashboard } from './views/Dashboard';
// import { TokensPools } from './views/Pools';
// import { TokensTransfers } from './views/Transfers';

export const DataExchangeRoutes: RouteObject = {
  path: `${NAMESPACES_PATH}/:namespace/dx`,
  children: [
    {
      path: '',
      index: true,
      element: <DataExchangeDashboard />,
    },
    // {
    //   path: 'transfers',
    //   element: <TokensTransfers />,
    // },
    // {
    //   path: 'pools',
    //   element: <TokensPools />,
    // },
    // {
    //   path: 'accounts',
    //   element: <TokensAccounts />,
    // },
  ],
};
