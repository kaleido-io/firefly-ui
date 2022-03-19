// Copyright © 2022 Kaleido, Inc.

import { Chip, Grid, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SmallCard } from '../../../components/Cards/SmallCard';
import { Header } from '../../../components/Header';
import { ChartTableHeader } from '../../../components/Headers/ChartTableHeader';
import { HashPopover } from '../../../components/Popovers/HashPopover';
import { DataTable } from '../../../components/Tables/Table';
import { ApplicationContext } from '../../../contexts/ApplicationContext';
import { SnackbarContext } from '../../../contexts/SnackbarContext';
import BadgeIcon from '@mui/icons-material/Badge';
import {
  FF_NAV_PATHS,
  IDataTableRecord,
  ISmallCard,
} from '../../../interfaces';
import { DEFAULT_PADDING } from '../../../theme';
import { invokeAPI } from '../dxComm';

type baseComponentStatus = undefined | 'disconnected' | 'ready';
type extendedComponentStatus = baseComponentStatus | 'connecting' | 'error';
type peerEntry = { id: string; cert: string; self?: boolean };

const getStatusIcon = (status: extendedComponentStatus) => {
  switch (status) {
    case 'ready':
      return 'success';
    case 'connecting':
      return 'warning';
    case 'disconnected':
    case 'error':
      return 'error';
  }
};

export const DataExchangeDashboard: React.FC = () => {
  const { nodeID, selectedNamespace } = useContext(ApplicationContext);
  const { reportFetchError } = useContext(SnackbarContext);
  const { t } = useTranslation();

  const [ffWsClientStatus, setffWsClientConnected] =
    useState<baseComponentStatus>();
  const [producerStatus, setProducerStatus] =
    useState<extendedComponentStatus>();
  const [messageConsumerStatus, setMessageConsumerStatus] =
    useState<extendedComponentStatus>();
  const [blobConsumerStatus, setBlobConsumerStatus] =
    useState<extendedComponentStatus>();
  const [storageProvider, setStorageProvider] = useState<string | undefined>();
  const [storageRegion, setStorageRegion] = useState<string | undefined>();
  const [storageBucketOrContainer, setStorageBucketOrContainer] = useState<
    string | undefined
  >();
  const [peers, setPeers] = useState<peerEntry[] | undefined>();

  useEffect(() => {
    invokeAPI(nodeID, 'clients')
      .then(({ connectedClients }) => {
        setffWsClientConnected(
          connectedClients === 0 ? 'disconnected' : 'ready'
        );
      })
      .catch((err) => reportFetchError(err));

    invokeAPI(nodeID, 'status')
      .then(({ producer, consumers }) => {
        setProducerStatus(producer.status);
        setMessageConsumerStatus(consumers.messages.status);
        setBlobConsumerStatus(consumers.blobs.status);
      })
      .catch((err) => reportFetchError(err));

    invokeAPI(nodeID, 'storage')
      .then(({ provider, region, bucketOrContainer }) => {
        setStorageProvider(provider);
        setStorageRegion(region);
        setStorageBucketOrContainer(bucketOrContainer);
      })
      .catch((err) => reportFetchError(err));

    invokeAPI(nodeID, 'peers?include_self')
      .then((peers) => {
        setPeers(peers);
      })
      .catch((err) => reportFetchError(err));
  }, [nodeID]);

  const getStatusLabel = (status: extendedComponentStatus) => {
    if (status) {
      return t(status === 'ready' ? 'connected' : status);
    }
  };

  const smallCards: ISmallCard[] = [
    {
      header: t('fireFlyWSClient'),
      data: [
        {
          header: t('status'),
          data: getStatusLabel(ffWsClientStatus),
          statusIcon: getStatusIcon(ffWsClientStatus),
        },
      ],
    },
    {
      header: t('producer'),
      data: [
        {
          header: t('status'),
          data: getStatusLabel(producerStatus),
          statusIcon: getStatusIcon(producerStatus),
        },
      ],
    },
    {
      header: t('messageConsumer'),
      data: [
        {
          header: t('status'),
          data: getStatusLabel(messageConsumerStatus),
          statusIcon: getStatusIcon(messageConsumerStatus),
        },
      ],
      clickPath: FF_NAV_PATHS.dataExchangeMessagesPath(selectedNamespace),
    },
    {
      header: t('blobConsumer'),
      data: [
        {
          header: t('status'),
          data: getStatusLabel(blobConsumerStatus),
          statusIcon: getStatusIcon(blobConsumerStatus),
        },
      ],
      clickPath: FF_NAV_PATHS.dataExchangeBlobTransfersPath(selectedNamespace),
    },
  ];

  const storageCard: ISmallCard = {
    header: t('storage'),
    data: [
      {
        header: t('provider'),
        data: storageProvider,
      },
      {
        header: t('region'),
        data: storageRegion,
      },
      {
        header: t('bucketOrContainer'),
        data: storageBucketOrContainer,
      },
    ],
  };

  const peerRecords: IDataTableRecord[] | undefined = peers?.map(
    ({ id, cert, self }) => ({
      key: id,
      columns: [
        {
          value: (
            <>
              <Grid container justifyContent="flex-start" alignItems="center">
                <BadgeIcon sx={{ color: '#FFFFFF' }} />
                <Typography pl={DEFAULT_PADDING} variant="body1">
                  {id}
                </Typography>
              </Grid>
            </>
          ),
        },
        {
          value: <HashPopover address={cert} />,
        },
        {
          value: self ? <Chip color="success" label={t('yourPeerID')} /> : '',
        },
      ],
    })
  );

  return (
    <>
      <Header title={t('dashboard')} subtitle={t('dataExchange')}></Header>
      <Grid container px={DEFAULT_PADDING} spacing={3}>
        {/* Small Cards */}
        {smallCards.map((card) => (
          <Grid
            key={card.header}
            xs={3}
            alignItems="center"
            justifyContent="center"
            item
          >
            <SmallCard card={card} />
          </Grid>
        ))}
        {/* Storage Card */}
        <Grid
          key={storageCard.header}
          xs={12}
          alignItems="center"
          justifyContent="center"
          pb={DEFAULT_PADDING}
          item
        >
          <SmallCard card={storageCard} />
        </Grid>
        {/* Peer table */}
        <Grid item xs={12}>
          <ChartTableHeader title={t('peers')} />
          <DataTable
            stickyHeader={true}
            columnHeaders={[t('id'), t('certificate'), '']}
            records={peerRecords}
            emptyStateText={t('noPeersToDisplay')}
          />
        </Grid>
      </Grid>
    </>
  );
};
