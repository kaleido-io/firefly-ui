import { RouteObject } from 'react-router-dom';
import { NAMESPACES_PATH } from '../../interfaces';
import { DataExchangeDashboard } from './Views/Dashboard';
import { DataExchangeMessageBrowser } from './Views/MessageBrowser';

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
      element: <DataExchangeMessageBrowser prefix="msg" />,
    },
    {
      path: 'blobtransfers',
      element: <DataExchangeMessageBrowser prefix="blb" />,
    },
    {
      path: 'deadletterqueue',
      element: <DataExchangeMessageBrowser prefix="dlq" />,
    },
  ],
};
