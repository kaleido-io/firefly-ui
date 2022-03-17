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

interface Props {
  prefix: 'msg' | 'blb' | 'dlq';
}

export const DataExchangeBrowser: React.FC<Props> = ({ prefix }) => {
  const { nodeID, selectedNamespace } = useContext(ApplicationContext);
  const { reportFetchError } = useContext(SnackbarContext); // TODO
  const { t } = useTranslation();

  const [topics, setTopics] = useState<IDataTableRecord[] | undefined>(
    undefined
  );

  useEffect(() => {
    setTopics(undefined);
    invokeAPI(nodeID, 'browser/topics')
      .then(async (allTopics: string[]) => {
        const processedTopics: IDataTableRecord[] = [];
        const filteredTopics = allTopics.filter((topic) =>
          topic.startsWith(`dx.${prefix}.`)
        );

        for (const filteredTopic of filteredTopics) {
          const offsets = await invokeAPI(
            nodeID,
            `browser/topics/${filteredTopic}/0`
          );
          processedTopics.push({
            key: filteredTopic,
            columns: [
              {
                value: filteredTopic,
              },
              { value: 0 },
              { value: offsets.watermarks.lowOffset },
              { value: offsets.watermarks.highOffset },
              { value: offsets.offset },
            ],
            // onClick: () => {
            //   console.log('test');
            // },
          });
        }
        setTopics(processedTopics);
      })
      .catch((err) => reportFetchError(err));
  }, [nodeID, prefix]);

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
      <Grid container px={DEFAULT_PADDING}>
        <Grid
          container
          item
          direction="column"
          justifyContent="center"
          alignItems="flex-start"
        >
          {/* Topics list */}
          <Grid container item wrap="nowrap" direction="column">
            <ChartTableHeader title={t('topics')} />
            <DataTable
              stickyHeader={true}
              columnHeaders={[
                t('name'),
                t('partitions'),
                t('lowWatermark'),
                t('highWatermark'),
                t('offset'),
              ]}
              records={topics}
              emptyStateText={t('noTopicsToDisplay')}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
