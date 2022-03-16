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
  const res = await fetch(`${dxEndpoint}/api/v1/${apiPath}`);
  return await res.json();
};
