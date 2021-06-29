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

import React, { useState, useContext } from 'react';
import { Grid, Typography, Box, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { IMessage, IHistory } from '../../interfaces';
import { MessageDetails } from './MessageDetails';
import { ApplicationContext } from '../../contexts/ApplicationContext';
import { DataViewSwitch } from '../../components/DataViewSwitch';
import { useHistory } from 'react-router-dom';
import { FilterSelect } from '../../components/FilterSelect';
import { fetchWithCredentials } from '../../utils';
import { MessageTimeline } from './MessageTimeline';
import { MessageList } from './MessageList';

export const Messages = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory<IHistory>();
  const [viewMessage, setViewMessage] = useState<IMessage | undefined>();
  const { dataView } = useContext(ApplicationContext);

  // make sure to view MessageDetails panel if it was open when navigating to a linked page and user goes back
  if (history.location.state && !viewMessage) {
    setViewMessage(history.location.state.viewMessage);
  }

  return (
    <>
      <Grid container justify="center">
        <Grid
          container
          wrap="nowrap"
          direction="column"
          className={classes.root}
        >
          <Grid container spacing={2} item direction="row" alignItems="center">
            <Grid item>
              <Typography className={classes.header} variant="h4">
                {t('messages')}
              </Typography>
            </Grid>
            <Box className={classes.separator} />
            <Grid item>
              <DataViewSwitch />
            </Grid>
          </Grid>
          {dataView === 'timeline' && (
            <Grid className={classes.timelineContainer} xs={12} container item>
              <MessageTimeline messages={[]} {...{ setViewMessage }} />
            </Grid>
          )}
          {dataView === 'list' && (
            <Grid container item>
              <MessageList {...{ setViewMessage }} />
            </Grid>
          )}
        </Grid>
      </Grid>
      {viewMessage && (
        <MessageDetails
          open={!!viewMessage}
          onClose={() => {
            setViewMessage(undefined);
            history.replace('/messages' + history.location.search, undefined);
          }}
          message={viewMessage}
        />
      )}
    </>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: 20,
    paddingLeft: 120,
    paddingRight: 120,
    maxWidth: 1920,
    [theme.breakpoints.down('sm')]: {
      flexWrap: 'wrap',
    },
  },
  header: {
    fontWeight: 'bold',
  },
  centeredContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'calc(100vh - 300px)',
    overflow: 'auto',
  },
  timelineContainer: {
    paddingTop: theme.spacing(4),
  },
  separator: {
    flexGrow: 1,
  },
}));
