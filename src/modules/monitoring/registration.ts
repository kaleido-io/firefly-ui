// Copyright © 2021 Kaleido, Inc.
//
// SPDX-License-Identifier: Apache-2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import i18n from 'i18next';
import CalendarIcon from 'mdi-react/CalendarIcon';
import CubeOutlineIcon from 'mdi-react/CubeOutlineIcon';
import FanIcon from 'mdi-react/FanIcon';
import TextBoxCheckOutlineIcon from 'mdi-react/TextBoxCheckOutlineIcon';
import ViewDashboardOutlineIcon from 'mdi-react/ViewDashboardOutlineIcon';
import useModuleTranslation from '../../core/hooks/useModuleTranslation';
import { IRoute, ModuleNav, NavItem } from '../../core/interfaces';
import enData from './translations/en.json';
import { Events as BlockchainEvents } from './views/Blockchain/Events';
import { Dashboard } from './views/Dashboard';
import { Events } from './views/Events/Events';
import { Operations } from './views/Operations/Operations';
import { TransactionDetails } from './views/Transactions/TransactionDetails';
import { Transactions } from './views/Transactions/Transactions';
// Translations

export const MONITORING_TRANSLATIONS_NS = 'monitoring';
export const registerMonitoringTranslations = (): void => {
  i18n.addResourceBundle('en', MONITORING_TRANSLATIONS_NS, enData);
};
export const useMonitoringTranslation = (): { t: (key: string) => string } => {
  return useModuleTranslation(MONITORING_TRANSLATIONS_NS);
};

// Navigation

const makeMonitoringPathname = (ns?: string, pathSuffix?: string): string =>
  `/namespace/${ns}/monitoring${pathSuffix || ''}`;

export const MonitoringAppNavItem: NavItem = {
  translationNs: MONITORING_TRANSLATIONS_NS,
  translationKey: 'monitoring',
  icon: FanIcon,
  description: 'monitoringDescription',
  routesRequireNamespace: true,
  makePathname: makeMonitoringPathname,
  isActiveCheck: (ns?: string, pathname?: string) =>
    pathname?.startsWith(makeMonitoringPathname(ns)) || false,
};

export const MonitoringModuleNav: ModuleNav = {
  makeModulePathnamePrefix: makeMonitoringPathname,
  includeNamespacePicker: true,
  routesRequireNamespace: MonitoringAppNavItem.routesRequireNamespace,
  translationNs: MONITORING_TRANSLATIONS_NS,
  translationKey: 'monitoring',
  navItems: [
    {
      translationNs: MONITORING_TRANSLATIONS_NS,
      translationKey: 'dashboard',
      icon: ViewDashboardOutlineIcon,
      routesRequireNamespace: MonitoringAppNavItem.routesRequireNamespace,
      makePathname: (ns?: string) => makeMonitoringPathname(ns, ''),
      isActiveCheck: (ns?: string, pathname?: string) =>
        pathname === makeMonitoringPathname(ns),
    },
    {
      translationNs: MONITORING_TRANSLATIONS_NS,
      translationKey: 'transactions',
      icon: TextBoxCheckOutlineIcon,
      routesRequireNamespace: MonitoringAppNavItem.routesRequireNamespace,
      makePathname: (ns?: string) =>
        makeMonitoringPathname(ns, '/transactions'),
      isActiveCheck: (ns?: string, pathname?: string) =>
        pathname?.startsWith(makeMonitoringPathname(ns, '/transactions')) ||
        false,
    },
    {
      translationNs: MONITORING_TRANSLATIONS_NS,
      translationKey: 'operations',
      icon: FanIcon,
      routesRequireNamespace: MonitoringAppNavItem.routesRequireNamespace,
      makePathname: (ns?: string) => makeMonitoringPathname(ns, '/operations'),
      isActiveCheck: (ns?: string, pathname?: string) =>
        pathname?.startsWith(makeMonitoringPathname(ns, '/operations')) ||
        false,
    },
    {
      translationNs: MONITORING_TRANSLATIONS_NS,
      translationKey: 'blockchain',
      icon: CubeOutlineIcon,
      routesRequireNamespace: MonitoringAppNavItem.routesRequireNamespace,
      makePathname: (ns?: string) => makeMonitoringPathname(ns, '/blockchain'),
      isActiveCheck: (ns?: string, pathname?: string) =>
        pathname?.startsWith(makeMonitoringPathname(ns, '/blockchain')) ||
        false,
    },
    {
      translationNs: MONITORING_TRANSLATIONS_NS,
      translationKey: 'events',
      icon: CalendarIcon,
      routesRequireNamespace: MonitoringAppNavItem.routesRequireNamespace,
      makePathname: (ns?: string) => makeMonitoringPathname(ns, '/events'),
      isActiveCheck: (ns?: string, pathname?: string) =>
        pathname?.startsWith(makeMonitoringPathname(ns, '/events')) || false,
    },
  ],
};

// Routes
const MONITORING_ROUTE_PREFIX = '/namespace/:namespace/monitoring';
export const MonitoringRoutes: IRoute[] = [
  {
    exact: true,
    route: `${MONITORING_ROUTE_PREFIX}`,
    component: Dashboard,
  },
  {
    exact: true,
    route: `${MONITORING_ROUTE_PREFIX}/operations`,
    component: Operations,
  },
  {
    exact: true,
    route: `${MONITORING_ROUTE_PREFIX}/transactions`,
    component: Transactions,
  },
  {
    exact: true,
    route: `${MONITORING_ROUTE_PREFIX}/transactions/:id`,
    component: TransactionDetails,
  },
  {
    exact: true,
    route: `${MONITORING_ROUTE_PREFIX}/blockchain`,
    component: BlockchainEvents,
  },
  {
    exact: true,
    route: `${MONITORING_ROUTE_PREFIX}/events`,
    component: Events,
  },
];
