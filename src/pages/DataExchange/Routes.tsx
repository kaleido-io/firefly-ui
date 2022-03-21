import { RouteObject } from 'react-router-dom';
import { NAMESPACES_PATH } from '../../interfaces';
import { DataExchangeDashboard } from './Views/Dashboard';
import { DataExchangeMessageBrowser } from './Views/MessageBrowser';
import { DataExchangeTopics } from './Views/Topics';

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
      element: <DataExchangeTopics prefix="msg" />,
    },
    {
      path: 'messages/:topic/:partition',
      element: <DataExchangeMessageBrowser prefix="msg" />,
    },
    {
      path: 'blobtransfers',
      element: <DataExchangeTopics prefix="blb" />,
    },
    {
      path: 'deadletterqueue',
      element: <DataExchangeTopics prefix="dlq" />,
    },
  ],
};
