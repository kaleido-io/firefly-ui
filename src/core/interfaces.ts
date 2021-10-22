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

import { MdiReactIconComponentType } from 'mdi-react';

export type DataView = 'timeline' | 'list';

export enum TXStatus {
  Succeeded = 'Succeeded',
  Pending = 'Pending',
  Error = 'Error',
}

export type CreatedFilterOptions = '24hours' | '7days' | '30days';

export type FilterOptions = CreatedFilterOptions;

export interface IRoute {
  exact?: boolean;
  route: string;
  component: (props: any) => JSX.Element;
}

export interface IRouterParams {
  namespace: string;
}

export interface IStatus {
  node: {
    name: string;
    registered: boolean;
    id: string;
  };
  org: {
    name: string;
    registered: boolean;
    identity: string;
    id: string;
  };
  defaults: {
    namespace: string;
  };
}

export interface IDataTableColumn {
  value: string | number | JSX.Element | undefined;
}

export interface IFilterItem {
  value: string;
  label: string;
}

export interface IPieChartElement {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface ITimelineItem {
  key: string;
  title?: string;
  description?: string;
  icon?: JSX.Element;
  time?: string;
  author?: string;
  onClick?: () => void;
}

export interface IDataTableRecord {
  columns: IDataTableColumn[];
  key: string;
  onClick?: () => void;
}

export interface IHistory {
  viewMessage: IMessage;
}

export interface IFireflyHeader {
  id: string;
  type: string;
  txtype: string;
  author: string;
  created: string;
  namespace: string;
  topic: string[];
  tag: string;
  datahash: string;
}

export interface IData {
  hash: string;
  id: string;
}

export interface IMessage {
  batch: string;
  confirmed: string;
  data: IData[];
  hash: string;
  header: IFireflyHeader;
  sequence: number;
  local: boolean;
}

export interface INamespace {
  id: string;
  name: string;
  description: string;
  type: string;
  created: string;
  confirmed: string;
}

export interface ITransaction {
  created: number;
  hash: string;
  id: string;
  protocolId?: string;
  sequence: number;
  status: TXStatus;
  info?: IEthTransactionInfo;
  subject: {
    signer: string;
    namespace: string;
    type: string;
    reference: string;
  };
}

export interface IEthTransactionInfo {
  address: string;
  blockNumber: string;
  data: {
    author: string;
    batchHash: string;
    contexts: string[];
    namespace: string;
    payloadRef: string;
    timestamp: string;
    uuids: string;
  };
  logIndex: string;
  signature: string;
  subID: string;
  transactionHash: string;
  transactionIndex: string;
}

export interface IData {
  created: number;
  definition: {
    name: string;
    version: string;
  };
  hash: string;
  id: string;
  namespace: string;
  validator?: string;
  value?: any;
}

export interface IBatch {
  author: string;
  confirmed: string;
  created: string;
  hash: string;
  id: string;
  namespace: string;
  payload: {
    data: IData[];
    messages: IMessage[];
    tx: {
      id: string;
      type: string;
    };
  };
  payloadRef: string;
  type: string;
}

export interface IOrganization {
  created: string;
  id: string;
  identity: string;
  description: string;
  message: string;
  parent: string;
  name: string;
}

export interface INode {
  created: string;
  id: string;
  message: string;
  name: string;
  owner: string; // owner is IOrganization.identity
  dx: {
    endpoint: {
      cert: string;
      endpoint: string;
      id: string;
    };
    peer: string;
  };
}

export interface IPagedMessageResponse {
  pageParam: number;
  count: number;
  items: IMessage[];
  total: number;
}

export interface IPagedTransactionResponse {
  pageParam: number;
  count: number;
  items: ITransaction[];
  total: number;
}

export interface NavItem {
  description?: string;
  icon: MdiReactIconComponentType;
  translationNs: string;
  translationKey: string;
  routesRequireNamespace: boolean;
  makePathname: (namespace?: string) => string;
  isActiveCheck: (namespace?: string, pathname?: string) => boolean;
}

export interface ModuleNav {
  makeModulePathnamePrefix: (namespace?: string) => string;
  includeNamespacePicker: boolean;
  routesRequireNamespace: boolean;
  navItems: NavItem[];
  translationNs: string;
  translationKey: string;
}

export interface ITokenAccount {
  poolProtocolId: string;
  tokenIndex: string;
  connector: string;
  key: string;
  balance: string;
  updated: string;
}

export interface ITokenConnector {
  name: string;
}

export interface ITokenPool {
  id: string;
  type: 'nonfungible' | 'fungible';
  namespace: string;
  name: string;
  protocolId: string;
  key: string;
  connector: string;
  message: string;
  created: string;
  tx: {
    type: string;
    id: string;
  };
}

export interface ITokenTransaction {
  id: string;
  hash: string;
  subject: {
    signer: string;
    namespace: string;
    type: string;
    reference: string;
  };
  created: string;
  status: string;
  protocolId: string;
  info: {
    blockNumber: string;
    transactionHash: string;
    transactionIndex: string;
  };
}

export interface ITokenTransfer {
  type: 'mint' | 'burn' | 'transfer';
  localId: string;
  poolProtocolId: string;
  tokenIndex: string;
  connector: string;
  key: string;
  from?: string;
  to: string;
  amount: string;
  protocolId: string;
  messageHash: string;
  created: string;
  tx: {
    type: string;
    id: string;
  };
}
