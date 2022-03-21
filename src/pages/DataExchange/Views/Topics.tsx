// Copyright © 2022 Kaleido, Inc.

import { Grid } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../../components/Header';
import { ChartTableHeader } from '../../../components/Headers/ChartTableHeader';
import { DataTable } from '../../../components/Tables/Table';
import { ApplicationContext } from '../../../contexts/ApplicationContext';
import { SnackbarContext } from '../../../contexts/SnackbarContext';
import { FF_NAV_PATHS, IDataTableRecord } from '../../../interfaces';
import { DEFAULT_PADDING } from '../../../theme';
import { invokeAPI } from '../dxComm';

interface Props {
  prefix: 'msg' | 'blb' | 'dlq';
}

type Topic = {
  name: string;
  partition: number;
  highWatermark: number;
  lowWatermark: number;
  offset?: number;
};

export const DataExchangeTopics: React.FC<Props> = ({ prefix }) => {
  const { nodeID, selectedNamespace } = useContext(ApplicationContext);
  const { reportFetchError } = useContext(SnackbarContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [topics, setTopics] = useState<Topic[]>();

  useEffect(() => {
    setTopics(undefined);
    invokeAPI(nodeID, 'browser/topics')
      .then(async (topics: string[]) => {
        const processedTopics: Topic[] = [];
        for (const topic of topics) {
          if (topic.startsWith(`dx.${prefix}.`)) {
            const partitions = await invokeAPI(
              nodeID,
              `browser/topics/${topic}`
            );
            for (const partition of partitions) {
              const offsets = await invokeAPI(
                nodeID,
                `browser/topics/${topic}/${partition}`
              );
              processedTopics.push({
                name: topic,
                partition,
                highWatermark: offsets.watermarks.highOffset,
                lowWatermark: offsets.watermarks.lowOffset,
                offset: offsets.offset,
              });
            }
          }
        }
        setTopics(processedTopics);
      })
      .catch((err) => reportFetchError(err));
  }, [nodeID, prefix]);

  let records: IDataTableRecord[] | undefined;

  if (topics !== undefined) {
    records = [];
    for (const topic of topics) {
      records.push({
        key: topic.name,
        columns: [
          {
            value: topic.name,
          },
          { value: topic.partition },
          { value: topic.lowWatermark },
          { value: topic.highWatermark },
          { value: topic.offset },
        ],
        onClick: () => {
          let path: string;
          switch (prefix) {
            case 'msg':
              path = FF_NAV_PATHS.dataExchangeMessagesPath(selectedNamespace);
              break;
            case 'blb':
              path =
                FF_NAV_PATHS.dataExchangeBlobTransfersPath(selectedNamespace);
              break;
            case 'dlq':
              path =
                FF_NAV_PATHS.dataExchangeDeadLetterQueuePath(selectedNamespace);
              break;
          }
          navigate(`${path}/${topic.name}/${topic.partition}`);
        },
      });
    }
  }

  return (
    <>
      <Header
        title={t(
          prefix === 'msg'
            ? 'messages'
            : prefix === 'blb'
            ? 'blobTransfers'
            : 'deadLetterQueue'
        )}
        subtitle={t('dataExchange')}
      ></Header>
      <Grid
        container
        px={DEFAULT_PADDING}
        spacing={3}
        style={{ marginBottom: '32px' }}
      >
        <Grid item xs={12}>
          <ChartTableHeader title={t('topics')} />
        </Grid>
        <Grid item xs={12}>
          <DataTable
            stickyHeader={true}
            columnHeaders={[
              t('name'),
              t('partition'),
              t('lowWatermark'),
              t('highWatermark'),
              t('offset'),
            ]}
            records={records}
            emptyStateText={t('noTopicsToDisplay')}
          />
        </Grid>
      </Grid>
    </>
  );
};
