// Copyright © 2022 Kaleido, Inc.

import { Chip, Grid, Pagination, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SmallCard } from '../../../components/Cards/SmallCard';
import { Header } from '../../../components/Header';
import { ChartTableHeader } from '../../../components/Headers/ChartTableHeader';
import { HashPopover } from '../../../components/Popovers/HashPopover';
import { DataTable } from '../../../components/Tables/Table';
import { ApplicationContext } from '../../../contexts/ApplicationContext';
import { SnackbarContext } from '../../../contexts/SnackbarContext';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import BadgeIcon from '@mui/icons-material/Badge';
import {
  FF_NAV_PATHS,
  IDataTableRecord,
  ISmallCard,
} from '../../../interfaces';
import { DEFAULT_PADDING, DEFAULT_SPACING, themeOptions } from '../../../theme';
import { invokeAPI } from '../dxComm';
import { FFJsonViewer } from '../../../components/Viewers/FFJsonViewer';

interface Props {
  prefix: 'msg' | 'blb' | 'dlq';
}

type topic = {
  name: string;
  highWatermark: number;
  lowWatermark: number;
  offset?: number;
};

export const DataExchangeMessageBrowser: React.FC<Props> = ({ prefix }) => {
  const { nodeID, selectedNamespace } = useContext(ApplicationContext);
  const { reportFetchError } = useContext(SnackbarContext); // TODO
  const { t } = useTranslation();

  const [topics, setTopics] = useState<topic[] | undefined>();
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();
  const [offset, setOffset] = useState<number | undefined>();
  const [message, setMessage] = useState<any>();
  const [fetchingMessage, setFetchingMessage] = useState(false);

  useEffect(() => {
    setTopics(undefined);
    setSelectedTopic(undefined);
    setOffset(undefined);
    setMessage(undefined);
    invokeAPI(nodeID, 'browser/topics')
      .then(async (topics: string[]) => {
        const processedTopics: topic[] = [];
        for (const topic of topics) {
          const offsets = await invokeAPI(nodeID, `browser/topics/${topic}/0`);
          processedTopics.push({
            name: topic,
            highWatermark: offsets.watermarks.highOffset,
            lowWatermark: offsets.watermarks.lowOffset,
            offset: offsets.offset,
          });
        }
        if (processedTopics.length > 0) {
          setSelectedTopic(processedTopics[0].name);
          setOffset(processedTopics[0].highWatermark);
        }
        setTopics(processedTopics);
      })
      .catch((err) => reportFetchError(err));
  }, [nodeID]);

  useEffect(() => {
    if (selectedTopic && offset !== undefined) {
      setFetchingMessage(true);
      invokeAPI(
        nodeID,
        `browser/topics/${selectedTopic}/0/messages?offset=${offset - 1}`
      )
        .then((messages) => {
          console.log(messages);
          if (messages.length > 0) {
            setMessage(messages[0]);
          }
        })
        .finally(() => setFetchingMessage(false));
    }
  }, [selectedTopic, offset]);

  let records: IDataTableRecord[] | undefined;

  if (topics !== undefined) {
    records = [];
    for (const topic of topics) {
      records.push({
        key: topic.name,
        columns: [
          {
            value: (
              <>
                <Grid container justifyContent="flex-start" alignItems="center">
                  {selectedTopic === topic.name ? (
                    <RadioButtonCheckedIcon sx={{ color: '#FFFFFF' }} />
                  ) : (
                    <RadioButtonUncheckedIcon sx={{ color: '#FFFFFF' }} />
                  )}
                  <Typography pl={DEFAULT_PADDING} variant="body1">
                    {topic.name}
                  </Typography>
                </Grid>
              </>
            ),
          },
          { value: 0 },
          { value: topic.lowWatermark },
          { value: topic.highWatermark },
          { value: topic.offset },
        ],
        onClick: () => {
          setSelectedTopic(topic.name);
          setOffset(topic.highWatermark);
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
      <Grid container px={DEFAULT_PADDING}>
        {/* Topics list */}
        <Grid
          container
          item
          wrap="nowrap"
          direction="column"
          pb={DEFAULT_PADDING}
        >
          <ChartTableHeader title={t('topics')} />
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
        {selectedTopic && offset && (
          <>
            <Grid
              container
              item
              justifyContent={'center'}
              style={{
                backgroundColor: themeOptions.palette?.background?.paper,
              }}
            >
              <Grid item>
                <Pagination
                  size="large"
                  variant="outlined"
                  disabled={fetchingMessage}
                  count={
                    topics?.find((topic) => topic.name === selectedTopic)
                      ?.highWatermark ?? 1
                  }
                  style={{ paddingTop: '30px' }}
                  showFirstButton
                  showLastButton
                  page={offset ?? 1}
                  onChange={(_, value) => {
                    setOffset(value);
                  }}
                />
              </Grid>
            </Grid>

            <Grid
              item
              container
              style={{
                backgroundColor: themeOptions.palette?.background?.paper,
              }}
            >
              <Grid item style={{ minHeight: '500px' }}>
                {message?.message && <FFJsonViewer json={message} />}
              </Grid>
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
};
