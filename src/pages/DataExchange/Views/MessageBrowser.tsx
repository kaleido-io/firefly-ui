// Copyright © 2022 Kaleido, Inc.

import {
  Box,
  Grid,
  IconButton,
  Pagination,
  Tooltip,
  Typography,
} from '@mui/material';
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
import { DEFAULT_PADDING, themeOptions, FFColors } from '../../../theme';
import { invokeAPI } from '../dxComm';
import GppGoodIcon from '@mui/icons-material/GppGood';
import { FFCircleLoader } from '../../../components/Loaders/FFCircleLoader';
import { FFJsonViewer } from '../../../components/Viewers/FFJsonViewer';
import { DisplaySlide } from '../../../components/Slides/DisplaySlide';
import { SlideHeader } from '../../../components/Slides/SlideHeader';
import { FFTextField } from '../../../components/Inputs/FFTextField';

interface Props {
  prefix: 'msg' | 'blb' | 'dlq';
}

type topic = {
  name: string;
  highWatermark: number;
  lowWatermark: number;
  offset?: number;
};

type peerEntry = { id: string; cert: string; self?: boolean };

export const DataExchangeMessageBrowser: React.FC<Props> = ({ prefix }) => {
  const { nodeID } = useContext(ApplicationContext);
  const { reportFetchError } = useContext(SnackbarContext);
  const { t } = useTranslation();

  const [topics, setTopics] = useState<topic[] | undefined>();
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();
  const [offset, setOffset] = useState<number | undefined>();
  const [message, setMessage] = useState<any>();
  const [peers, setPeers] = useState<peerEntry[] | undefined>();
  const [signatureVerificationSlideOpen, setSignatureVerificationSlideOpen] =
    useState(false);

  useEffect(() => {
    invokeAPI(nodeID, 'peers?include_self')
      .then((peers) => {
        setPeers(peers);
      })
      .catch((err) => reportFetchError(err));
  }, [nodeID]);

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
      invokeAPI(
        nodeID,
        `browser/topics/${selectedTopic}/0/messages?offset=${offset - 1}`
      ).then((messages) => {
        if (messages.length > 0) {
          setMessage(messages[0]);
        }
      });
    }
  }, [selectedTopic, offset]);

  let records: IDataTableRecord[] | undefined;

  if (topics !== undefined && peers !== undefined) {
    records = [];
    for (const topic of topics) {
      records.push({
        key: topic.name,
        columns: [
          {
            value: (
              <>
                <Grid
                  container
                  justifyContent="flex-start"
                  alignItems="center"
                  style={{ minHeight: '30px' }}
                >
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
          if (selectedTopic !== topic.name) {
            setMessage(undefined);
            setSelectedTopic(topic.name);
            setOffset(topic.highWatermark);
          }
        },
      });
    }
  }

  const handleSignatureVerification = () => {
    setSignatureVerificationSlideOpen(true);
  };

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
        {selectedTopic && offset !== undefined && (
          <Grid item container>
            <Grid
              p="10px 20px"
              item
              container
              wrap="nowrap"
              alignItems="center"
              style={{
                borderRadius: '8px 8px 0 0',
                backgroundColor: themeOptions.palette?.background?.paper,
              }}
            >
              <Grid item>
                <Typography
                  sx={{
                    fontWeight: 'bold',
                  }}
                >
                  {t('messages')}
                </Typography>
              </Grid>
              <Grid item container justifyContent="center">
                <Grid item>
                  <Pagination
                    size="large"
                    variant="outlined"
                    disabled={!message}
                    count={
                      topics?.find((topic) => topic.name === selectedTopic)
                        ?.highWatermark ?? 1
                    }
                    showFirstButton
                    showLastButton
                    page={offset ?? 1}
                    onChange={(_, value) => {
                      if (value !== offset) {
                        setMessage(undefined);
                        setOffset(value);
                      }
                    }}
                  />
                </Grid>
              </Grid>
              <Grid item>
                <IconButton
                  disabled={
                    !message ||
                    !(
                      message.message?.header ||
                      message.message?.transferMetadata
                    )
                  }
                  onClick={() => handleSignatureVerification()}
                >
                  <Tooltip arrow title={t('signatureVerification').toString()}>
                    <GppGoodIcon />
                  </Tooltip>
                </IconButton>
              </Grid>
            </Grid>
            <Grid
              item
              container
              wrap="nowrap"
              justifyContent={message ? 'left' : 'center'}
              style={{
                borderRadius: '0 0 8px 8px',
                backgroundColor: themeOptions.palette?.background?.paper,
              }}
            >
              <Grid item style={{ minHeight: '500px' }}>
                {message ? (
                  <Box style={{ paddingLeft: '40px', paddingBottom: '20px' }}>
                    <FFJsonViewer
                      json={
                        message.message && typeof message.message !== 'string'
                          ? message.message
                          : message
                      }
                    />
                  </Box>
                ) : (
                  <FFCircleLoader color="warning" />
                )}
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>

      <DisplaySlide
        open={signatureVerificationSlideOpen}
        onClose={() => setSignatureVerificationSlideOpen(false)}
      >
        <Grid container direction="column" p={DEFAULT_PADDING}>
          <Grid item pb={DEFAULT_PADDING}>
            <SlideHeader
              subtitle={t('message')}
              title={t('signatureVerification')}
            />
          </Grid>
          <Grid item pb={DEFAULT_PADDING}>
            <Typography
              style={{
                wordSpacing: '4px',
                color: FFColors.Orange,
                textAlign: 'center',
                fontWeight: 'bold',
                backgroundColor: 'black',
                borderRadius: '4px',
                padding: '20px',
              }}
            >
              {`${t('verify')} ( ${t('hash')} ( ${t('header')} ) , ${t(
                'signature'
              )} , ${t('certificate')} ) = ${t('ok')}`}
            </Typography>
          </Grid>
          <Grid item pb={DEFAULT_PADDING}>
            <FFTextField
              defaultValue={JSON.stringify(
                message?.message?.header ?? message?.message?.transferMetadata
              )}
              label={t('header')}
              hasCopyBtn
            />
          </Grid>
          <Grid item pb={DEFAULT_PADDING}>
            <FFTextField
              defaultValue={
                message?.message?.headerHash ??
                message?.message?.transferMetadataHash
              }
              label={t('headerHash')}
              hasCopyBtn
            />
          </Grid>
          <Grid item pb={DEFAULT_PADDING}>
            <FFTextField
              defaultValue={
                message?.message?.headerSignature ??
                message?.message?.transferMetadataSignature
              }
              label={t('signature')}
              hasCopyBtn
            />
          </Grid>
          <Grid item pb={DEFAULT_PADDING}>
            <FFTextField
              defaultValue={
                peers?.find(
                  (peer) =>
                    peer.id === message?.message?.header?.sender ||
                    peer.id === message?.message?.transferMetadata?.sender
                )?.cert ?? ''
              }
              label={t('certificate')}
              hasCopyBtn
            />
          </Grid>
        </Grid>
      </DisplaySlide>
    </>
  );
};
