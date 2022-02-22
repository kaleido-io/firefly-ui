import {
  Collapse,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { default as React, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MenuLogo } from '../MenuLogo';
import { ApplicationContext } from '../../contexts/ApplicationContext';
import { useTranslation } from 'react-i18next';
import { NAMESPACES_PATH } from '../../interfaces';
import { NavItem } from './NavItem';
import ViewDashboardOutlineIcon from 'mdi-react/ViewDashboardOutlineIcon';
import { ActivityNav } from './ActivityNav';

export const NAV_WIDTH = 225;

export const Navigation: React.FC = () => {
  const { orgName, selectedNamespace } = useContext(ApplicationContext);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const makeDrawerContents = (
    <>
      <NavItem
        name={t('dashboard')}
        icon={<ViewDashboardOutlineIcon />}
        action={() => navigate(`${NAMESPACES_PATH}/${selectedNamespace}/home`)}
      />
      <ActivityNav />
    </>
  );

  return (
    <>
      <Drawer
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: NAV_WIDTH,
            backgroundColor: 'background.default',
          },
        }}
        color="primary"
        variant="permanent"
        anchor="left"
      >
        <MenuLogo />
        <List
          sx={{
            pl: 2,
          }}
        >
          <ListItem>
            <ListItemText>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {orgName}
              </Typography>
            </ListItemText>
          </ListItem>
          {makeDrawerContents}
        </List>
      </Drawer>
    </>
  );
};
