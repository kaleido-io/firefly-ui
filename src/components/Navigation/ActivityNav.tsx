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

import React, { useContext, useState } from 'react';
import {
  Collapse,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ExpandLess from 'mdi-react/ChevronUpIcon';
import ExpandMore from 'mdi-react/ChevronDownIcon';
import ChartBoxOutline from 'mdi-react/ChartBoxOutlineIcon';
import { NavItem } from './NavItem';
import { useNavigate } from 'react-router-dom';
import { NAMESPACES_PATH } from '../../interfaces';
import { ApplicationContext } from '../../contexts/ApplicationContext';
import {
  ACTIVITY_PATH,
  EVENTS_PATH,
  OPERATIONS_PATH,
  TRANSACTIONS_PATH,
} from '../../interfaces';

export const ActivityNav = () => {
  const { t } = useTranslation();
  const [activityOpen, setActivityOpen] = useState(false);
  const navigate = useNavigate();
  const { selectedNamespace } = useContext(ApplicationContext);

  return (
    <>
      <ListItemButton onClick={() => setActivityOpen(!activityOpen)}>
        <ListItemIcon>{<ChartBoxOutline />}</ListItemIcon>
        <ListItemText>
          <Typography>{t('activity')}</Typography>
        </ListItemText>
        {activityOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>

      <Collapse in={activityOpen} unmountOnExit>
        <NavItem
          name={t('dashboard')}
          action={() =>
            navigate(`${NAMESPACES_PATH}/${selectedNamespace}/${ACTIVITY_PATH}`)
          }
        />
        <NavItem
          name={t('events')}
          action={() =>
            navigate(
              `${NAMESPACES_PATH}/${selectedNamespace}/${ACTIVITY_PATH}/${EVENTS_PATH}`
            )
          }
        />
        <NavItem
          name={t('transactions')}
          action={() =>
            navigate(
              `${NAMESPACES_PATH}/${selectedNamespace}/${ACTIVITY_PATH}/${TRANSACTIONS_PATH}`
            )
          }
        />
        <NavItem
          name={t('operations')}
          action={() =>
            navigate(
              `${NAMESPACES_PATH}/${selectedNamespace}/${ACTIVITY_PATH}/${OPERATIONS_PATH}`
            )
          }
        />
      </Collapse>
    </>
  );
};
