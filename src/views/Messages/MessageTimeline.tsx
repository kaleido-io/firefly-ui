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

import React, { useState, useEffect } from 'react';
import { IMessage, ITimelineItem, IHistory } from '../../interfaces';
import { useHistory } from 'react-router';
import dayjs from 'dayjs';
import BroadcastIcon from 'mdi-react/BroadcastIcon';
import { DataTimeline } from '../../components/DataTimeline/DataTimeline';

interface Props {
  messages: IMessage[];
  setViewMessage: React.Dispatch<React.SetStateAction<IMessage | undefined>>;
}

export const MessageTimeline: React.FC<Props> = ({
  messages,
  setViewMessage,
}) => {
  const history = useHistory<IHistory>();
  const [items, setItems] = useState<ITimelineItem[]>([]);

  useEffect(() => {
    setItems(
      messages.map((message: IMessage) => ({
        key: message.header.id,
        title: message.header.type,
        description: message.header.tag,
        author: message.header.author,
        time: dayjs(message.header.created).format('MM/DD/YYYY h:mm A'),
        icon: <BroadcastIcon />,
        onClick: () => {
          setViewMessage(message);
          history.replace('/messages', { viewMessage: message });
        },
      }))
    );
  }, [messages]);

  return <DataTimeline items={items} />;
};
