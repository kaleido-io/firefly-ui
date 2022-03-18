// Copyright © 2022 Kaleido, Inc.

import { Box, Grid, Pagination, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '../../../components/Header';
import { ChartTableHeader } from '../../../components/Headers/ChartTableHeader';
import { DataTable } from '../../../components/Tables/Table';
import { ApplicationContext } from '../../../contexts/ApplicationContext';
import { SnackbarContext } from '../../../contexts/SnackbarContext';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import { IDataTableRecord } from '../../../interfaces';
import { DEFAULT_PADDING, themeOptions } from '../../../theme';
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
  const { nodeID } = useContext(ApplicationContext);
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
          if (topic.startsWith(`dx.${prefix}.`)) {
            const offsets = await invokeAPI(
              nodeID,
              `browser/topics/${topic}/0`
            );
            processedTopics.push({
              name: topic,
              highWatermark: offsets.watermarks.highOffset,
              lowWatermark: offsets.watermarks.lowOffset,
              offset: offsets.offset,
            });
          }
        }
        if (processedTopics.length > 0) {
          setOffset(processedTopics[0].highWatermark);
          setSelectedTopic(processedTopics[0].name);
        }
        setTopics(processedTopics);
      })
      .catch((err) => reportFetchError(err));
  }, [nodeID, prefix]);

  useEffect(() => {
    if (selectedTopic && offset !== undefined) {
      setFetchingMessage(true);
      invokeAPI(
        nodeID,
        `browser/topics/${selectedTopic}/0/messages?offset=${offset - 1}`
      )
        .then((messages) => {
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
          <Grid item>
            <ChartTableHeader title={t('topics')} />
          </Grid>
          <Grid item>
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
        {selectedTopic && offset && (
          <>
            <Grid
              container
              item
              justifyContent={'center'}
              style={{
                borderRadius: '8px 8px 0 0',
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
                marginBottom: '20px',
                borderRadius: '0 0 8px 8px',
              }}
            >
              <Grid item style={{ minHeight: '300px' }}>
                {message?.message && (
                  <Grid
                    item
                    style={{
                      overflow: 'hidden',
                      opacity: fetchingMessage ? 0.5 : 1,
                    }}
                  >
                    <Box style={{ paddingLeft: '40px', paddingBottom: '40px' }}>
                      <FFJsonViewer
                        json={message.message ?? message.rawMessage}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
};
