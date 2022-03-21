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
import { ApplicationContext } from '../../../contexts/ApplicationContext';
import { SnackbarContext } from '../../../contexts/SnackbarContext';
import { ISmallCard } from '../../../interfaces';
import { DEFAULT_PADDING, themeOptions, FFColors } from '../../../theme';
import { invokeAPI } from '../dxComm';
import GppGoodIcon from '@mui/icons-material/GppGood';
import { FFCircleLoader } from '../../../components/Loaders/FFCircleLoader';
import { FFJsonViewer } from '../../../components/Viewers/FFJsonViewer';
import { DisplaySlide } from '../../../components/Slides/DisplaySlide';
import { SlideHeader } from '../../../components/Slides/SlideHeader';
import { FFTextField } from '../../../components/Inputs/FFTextField';
import { useParams } from 'react-router-dom';
import { NumberParam, useQueryParam } from 'use-query-params';
import { SmallCard } from '../../../components/Cards/SmallCard';

interface Props {
  prefix: 'msg' | 'blb' | 'dlq';
}

type TopicDetails = {
  watermarks: {
    lowOffset: number;
    highOffset: number;
  };
  offset?: number;
};

type peerEntry = { id: string; cert: string; self?: boolean };

export const DataExchangeMessageBrowser: React.FC<Props> = ({ prefix }) => {
  const { nodeID } = useContext(ApplicationContext);
  const { reportFetchError } = useContext(SnackbarContext);
  const { t } = useTranslation();

  const { topic, partition } =
    useParams<{ topic: string; partition: string }>();
  const [index, setIndex] = useQueryParam('index', NumberParam);
  const [topicDetails, setTopicDetails] = useState<TopicDetails>();
  const [message, setMessage] = useState<any>();
  const [peers, setPeers] = useState<peerEntry[]>();
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
    invokeAPI(nodeID, `browser/topics/${topic}/${partition}`)
      .then(async (watermarks: TopicDetails) => {
        if (
          typeof index !== 'number' ||
          index > watermarks.watermarks.highOffset
        ) {
          setIndex(watermarks.watermarks.highOffset);
        }
        setTopicDetails(watermarks);
      })
      .catch((err) => reportFetchError(err));
  }, [topic, partition]);

  useEffect(() => {
    if (topicDetails) {
      invokeAPI(
        nodeID,
        `browser/topics/${topic}/0/messages?offset=${
          (index ?? topicDetails.watermarks.highOffset) - 1
        }`
      )
        .then((messages) => {
          if (messages.length > 0) {
            setMessage(messages[0]);
          }
        })
        .catch((err) => reportFetchError(err));
    }
  }, [topicDetails, index]);

  const handleSignatureVerification = () => {
    setSignatureVerificationSlideOpen(true);
  };

  const topicCard: ISmallCard = {
    header: t('topic'),
    data: [
      {
        header: t('name'),
        data: topic,
      },
      {
        header: t('lowWatermark'),
        data: topicDetails?.watermarks.lowOffset,
      },
      {
        header: t('highWatermark'),
        data: topicDetails?.watermarks.highOffset,
      },
      {
        header: t('offset'),
        data: topicDetails?.offset,
      },
    ],
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
        <Grid
          key={topicCard.header}
          xs={12}
          alignItems="center"
          justifyContent="center"
          pb={DEFAULT_PADDING}
          item
        >
          <SmallCard card={topicCard} />
        </Grid>
        {topicDetails && (
          <Grid item container>
            <Grid
              item
              container
              style={{
                borderRadius: '8px',
                backgroundColor: themeOptions.palette?.background?.paper,
              }}
            >
              <Grid
                item
                container
                wrap="nowrap"
                alignItems="center"
                p="10px 20px"
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
                      count={topicDetails.watermarks.highOffset}
                      showFirstButton
                      showLastButton
                      page={index ?? 1}
                      onChange={(_, value) => {
                        if (value !== index) {
                          setMessage(undefined); ///
                          setIndex(value);
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
                    <Tooltip
                      arrow
                      title={t('signatureVerification').toString()}
                    >
                      <GppGoodIcon />
                    </Tooltip>
                  </IconButton>
                </Grid>
              </Grid>
              <Grid
                item
                container
                wrap="nowrap"
                style={{
                  minHeight: '500px',
                }}
                pb="60px"
              >
                {message ? (
                  <Grid item xs={12}>
                    <Box px="40px" py="20px">
                      <FFJsonViewer
                        json={
                          message.message &&
                          typeof message.message !== 'string' &&
                          !message.message.error
                            ? message.message
                            : message
                        }
                      />
                    </Box>
                  </Grid>
                ) : (
                  <Grid item xs={12} textAlign="center" alignSelf="center">
                    <FFCircleLoader color="warning" />
                  </Grid>
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
              label={t('headerJSON')}
              hasCopyBtn
            />
          </Grid>
          <Grid item pb={DEFAULT_PADDING}>
            <FFTextField
              defaultValue={
                message?.message?.headerHash ??
                message?.message?.transferMetadataHash
              }
              label={t('headerHashSHA256')}
              hasCopyBtn
            />
          </Grid>
          <Grid item pb={DEFAULT_PADDING}>
            <FFTextField
              defaultValue={
                message?.message?.headerSignature ??
                message?.message?.transferMetadataSignature
              }
              label={t('signatureBase64')}
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
              label={t('certificatePEM')}
              hasCopyBtn
            />
          </Grid>
        </Grid>
      </DisplaySlide>
    </>
  );
};
