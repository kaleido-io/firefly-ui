// Copyright © 2022 Kaleido, Inc.

import { FF_Paths } from '../../interfaces/constants';

let dxEndpoint: string | undefined = 'http://localhost:3331'; // TODO: temporary value for local development

const getDxEndpoint = async (nodeID: string): Promise<string> => {
  const res = await fetch(
    `${FF_Paths.apiPrefix}/${FF_Paths.networkNodeById(nodeID)}`
  );
  return (await res.json()).profile.endpoint;
};

export const invokeAPI = async (nodeID: string, apiPath: string) => {
  if (dxEndpoint === undefined) {
    dxEndpoint = await getDxEndpoint(nodeID);
  }
  const path = `${dxEndpoint}/api/v1/${apiPath}`;
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`${res.status} (${res.statusText}) ${path}`);
  }
  return await res.json();
};
