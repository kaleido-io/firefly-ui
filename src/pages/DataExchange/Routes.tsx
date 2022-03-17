import { RouteObject } from 'react-router-dom';
import { NAMESPACES_PATH } from '../../interfaces';
import { DataExchangeDashboard } from './Views/Dashboard';
import { DataExchangeBrowser } from './Views/Browser';

export const DataExchangeRoutes: RouteObject = {
  path: `${NAMESPACES_PATH}/:namespace/dx`,
  children: [
    {
      path: '',
      index: true,
      element: <DataExchangeDashboard />,
    },
    {
      path: 'messages',
      element: <DataExchangeBrowser prefix="msg" />,
    },
    {
      path: 'blobtransfers',
      element: <DataExchangeBrowser prefix="blb" />,
    },
    {
      path: 'deadletterqueue',
      element: <DataExchangeBrowser prefix="dlq" />,
    },
  ],
};
