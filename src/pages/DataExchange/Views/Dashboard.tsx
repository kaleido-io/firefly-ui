// Copyright © 2022 Kaleido, Inc.

import { Grid, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SmallCard } from '../../../components/Cards/SmallCard';
import { Header } from '../../../components/Header';
import { FFTextField } from '../../../components/Inputs/FFTextField';
import { FFCircleLoader } from '../../../components/Loaders/FFCircleLoader';
import { ApplicationContext } from '../../../contexts/ApplicationContext';
import { SnackbarContext } from '../../../contexts/SnackbarContext';
import {
  FF_NAV_PATHS,
  FF_Paths,
  INode,
  IOrganization,
  ISmallCard,
} from '../../../interfaces';
import { DEFAULT_PADDING, DEFAULT_SPACING } from '../../../theme';
import { fetchCatcher } from '../../../utils';
import { invokeAPI } from '../dxComm';

type baseComponentStatus = undefined | 'disconnected' | 'connected';
type extendedComponentStatus = baseComponentStatus | 'connecting' | 'error';

const getStatusIcon = (status: extendedComponentStatus) => {
  switch (status) {
    case 'connected':
      return 'success';
    case 'connecting':
      return 'warning';
    case 'disconnected':
    case 'error':
      return 'error';
  }
};

export const DataExchangeDashboard: () => JSX.Element = () => {
  const { nodeID, selectedNamespace } = useContext(ApplicationContext);
  const { reportFetchError } = useContext(SnackbarContext); // TODO
  const { t } = useTranslation();

  const [ffWsClientStatus, setffWsClientConnected] =
    useState<baseComponentStatus>();
  const [producerStatus, setProducerStatus] =
    useState<extendedComponentStatus>();
  const [messageConsumerStatus, setMessageConsumerStatus] =
    useState<extendedComponentStatus>();
  const [blobConsumerStatus, setBlobConsumerStatus] =
    useState<extendedComponentStatus>();

  useEffect(() => {
    invokeAPI(nodeID, 'clients').then(({ connectedClients }) => {
      setffWsClientConnected(
        connectedClients === 0 ? 'disconnected' : 'connected'
      );
    });
  }, [nodeID]);

  const smallCards: ISmallCard[] = [
    {
      header: t('fireFlyWSClient'),
      // numErrors: blockchainOpErrorCount,
      data: [
        {
          header: t('status'),
          data: ffWsClientStatus && t(ffWsClientStatus).toString(),
          statusIcon: getStatusIcon(ffWsClientStatus),
        },
      ],
    },
    {
      header: t('producer'),
      data: [
        {
          header: t('status'),
          data: producerStatus && t(producerStatus).toString(),
        },
      ],
    },
    {
      header: t('messageConsumer'),
      data: [
        {
          header: t('status'),
          data: messageConsumerStatus && t(messageConsumerStatus).toString(),
        },
      ],
      clickPath: FF_NAV_PATHS.dataExchangeMessagesPath(selectedNamespace),
    },
    {
      header: t('blobConsumer'),
      data: [
        {
          header: t('status'),
          data: blobConsumerStatus && t(blobConsumerStatus).toString(),
        },
        { data: 'aaa' },
        { data: undefined, header: 'pepe' },
      ],
      clickPath: FF_NAV_PATHS.dataExchangeBlobTransfersPath(selectedNamespace),
    },
  ];

  return (
    <>
      <Header title={t('dashboard')} subtitle={t('dataExchange')}></Header>
      <Grid container px={DEFAULT_PADDING}>
        <Grid
          container
          item
          direction="column"
          justifyContent="center"
          alignItems="flex-start"
        >
          {/* Small Cards */}
          <Grid
            spacing={DEFAULT_SPACING}
            container
            item
            direction="row"
            pb={DEFAULT_PADDING}
          >
            {smallCards.map((card) => {
              return (
                <Grid
                  key={card.header}
                  xs={DEFAULT_PADDING}
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                  container
                  item
                >
                  <SmallCard card={card} />
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
