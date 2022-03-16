import HexagonIcon from '@mui/icons-material/Hexagon';
import LaunchIcon from '@mui/icons-material/Launch';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import ViewDashboardOutlineIcon from 'mdi-react/ViewDashboardOutlineIcon';
import { default as React, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApplicationContext } from '../../contexts/ApplicationContext';
import { FF_NAV_PATHS } from '../../interfaces';
import { MenuLogo } from '../MenuLogo';
import { ActivityNav } from './ActivityNav';
import { BlockchainNav } from './BlockchainNav';
import { DXENav } from './DXNav';
import { NavItem } from './NavItem';
import { NetworkNav } from './NetworkNav';
import { OffChainNav } from './OffChainNav';
import { TokensNav } from './TokensNav';

export const NAV_WIDTH = 240;

export const Navigation: React.FC = () => {
  const { orgName, selectedNamespace } = useContext(ApplicationContext);
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const makeDrawerContents = (
    <>
      <NavItem
        name={t('dashboard')}
        icon={<ViewDashboardOutlineIcon />}
        action={() => navigate(FF_NAV_PATHS.homePath(selectedNamespace))}
        itemIsActive={pathname === FF_NAV_PATHS.homePath(selectedNamespace)}
      />
      <ActivityNav />
      <BlockchainNav />
      <OffChainNav />
      <TokensNav />
      <NetworkNav />
      <DXENav />
      <NavItem
        name={t('myNode')}
        icon={<HexagonIcon />}
        action={() => navigate(FF_NAV_PATHS.myNodePath(selectedNamespace))}
        itemIsActive={pathname === FF_NAV_PATHS.myNodePath(selectedNamespace)}
      />
      <NavItem
        name={t('docs')}
        icon={<MenuBookIcon />}
        action={() => window.open(FF_NAV_PATHS.docsPath, '_blank')}
        itemIsActive={false}
        rightIcon={<LaunchIcon />}
      />
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
        <List>
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
