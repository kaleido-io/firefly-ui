// Copyright © 2022 Kaleido, Inc.
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

import InboxIcon from '@mui/icons-material/Inbox';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApplicationContext } from '../../contexts/ApplicationContext';
import { FF_NAV_PATHS, INavItem } from '../../interfaces';
import { NavSection } from './NavSection';

export const DXENav = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { selectedNamespace } = useContext(ApplicationContext);

  const dataExchangePath = FF_NAV_PATHS.dataExchangePath(selectedNamespace);
  const transfersPath = FF_NAV_PATHS.tokensTransfersPath(selectedNamespace);
  const poolsPath = FF_NAV_PATHS.tokensPoolsPath(selectedNamespace);

  const navItems: INavItem[] = [
    {
      name: t('dashboard'),
      action: () => navigate(dataExchangePath),
      itemIsActive: pathname === dataExchangePath,
    },
    {
      name: t('messages'),
      action: () => navigate(transfersPath),
      itemIsActive: pathname === transfersPath,
    },
    {
      name: t('blobTransfers'),
      action: () => navigate(poolsPath),
      itemIsActive: pathname === poolsPath,
    },
  ];

  return (
    <NavSection
      icon={<InboxIcon />}
      navItems={navItems}
      title={t('dataExchange')}
    />
  );
};
