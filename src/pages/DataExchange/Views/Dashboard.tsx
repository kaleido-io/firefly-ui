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
import { DEFAULT_PADDING, DEFAULT_SPACING } from '../../../theme';
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
  const [peers, setPeers] = useState<IDataTableRecord[]>([]);

  useEffect(() => {
    invokeAPI(nodeID, 'clients')
      .then(({ connectedClients }) => {
        setffWsClientConnected(
          connectedClients === 0 ? 'disconnected' : 'connected'
        );
      })
      .catch((err) => reportFetchError(err));
    invokeAPI(nodeID, 'status')
      .then(({ producer, consumers }) => {
        setProducerStatus(
          producer.status === 'ready' ? 'connected' : producer.status
        );
        setMessageConsumerStatus(
          consumers.messages.status === 'ready'
            ? 'connected'
            : consumers.messages.status
        );
        setBlobConsumerStatus(
          consumers.blobs.status === 'ready'
            ? 'connected'
            : consumers.blobs.status
        );
      })
      .catch((err) => reportFetchError(err));

    invokeAPI(nodeID, 'storage')
      .then(({ provider, region, bucketOrContainer }) => {
        setStorageProvider(provider);
        setStorageRegion(region);
        setStorageBucketOrContainer(bucketOrContainer);
      })
      .catch((err) => reportFetchError(err));

    Promise.all([invokeAPI(nodeID, 'peers'), invokeAPI(nodeID, 'id')])
      .then(([peers, { id, cert }]) => {
        const records: IDataTableRecord[] = [
          {
            key: id,
            columns: [
              {
                value: (
                  <>
                    <Grid
                      container
                      justifyContent="flex-start"
                      alignItems="center"
                    >
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
                value: <Chip color="success" label={t('yourPeerID')} />,
              },
            ],
          },
        ];
        for (const peer of peers) {
          records.push({
            key: peer.id,
            columns: [
              {
                value: (
                  <>
                    <Grid
                      container
                      justifyContent="flex-start"
                      alignItems="center"
                    >
                      <BadgeIcon sx={{ color: '#FFFFFF' }} />
                      <Typography pl={DEFAULT_PADDING} variant="body1">
                        {peer.id}
                      </Typography>
                    </Grid>
                  </>
                ),
              },
              {
                value: <HashPopover address={peer.cert} />,
              },
              {
                value: '',
              },
            ],
          });
        }
        setPeers(records);
      })
      .catch((err) => reportFetchError(err));
  }, [nodeID]);

  const smallCards: ISmallCard[] = [
    {
      header: t('fireFlyWSClient'),
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
          statusIcon: getStatusIcon(producerStatus),
        },
      ],
    },
    {
      header: t('messageConsumer'),
      data: [
        {
          header: t('status'),
          data: messageConsumerStatus && t(messageConsumerStatus).toString(),
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
          data: blobConsumerStatus && t(blobConsumerStatus).toString(),
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

  return (
    <>
      <Header title={t('dashboard')} subtitle={t('dataExchange')}></Header>
      <Grid container px={DEFAULT_PADDING}>
        {/* Small Cards */}
        <Grid
          spacing={DEFAULT_SPACING}
          container
          item
          direction="row"
          pb={DEFAULT_PADDING}
        >
          {smallCards.map((card) => (
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
          ))}
        </Grid>
        {/* Storage Card */}
        <Grid
          spacing={DEFAULT_SPACING}
          container
          item
          direction="row"
          pb={DEFAULT_PADDING}
        >
          <Grid
            key={storageCard.header}
            xs={12}
            direction="column"
            alignItems="center"
            justifyContent="center"
            container
            item
          >
            <SmallCard card={storageCard} />
          </Grid>
        </Grid>
        {/* Peer table */}
        <Grid container item wrap="nowrap" direction="column">
          <ChartTableHeader title={t('peers')} />
          <DataTable
            stickyHeader={true}
            columnHeaders={[t('id'), t('certificate'), '']}
            records={peers}
            emptyStateText={t('noPeersToDisplay')}
          />
        </Grid>
      </Grid>
    </>
  );
};
