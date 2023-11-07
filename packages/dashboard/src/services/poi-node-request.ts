import {
  BlindedCommitmentData,
  GetPOIsPerListParams,
  NETWORK_CONFIG,
  NetworkName,
  NodeStatusAllNetworks,
  POIsPerListMap,
  TXIDVersion,
} from '@railgun-community/shared-models';
import axios, { AxiosError } from 'axios';
import debug from 'debug';
import { AvailableNodes } from '@constants/nodes';

const dbg = debug('poi:request');

/*
 TODO: This file is a copy of packages/node/src/api/poi-node-request.ts it should be moved to a shared location
 Some changes has been made in this file, before deleting check changes.
*/

export class POINodeRequest {
  private static getNodeRouteURL = (url: string, route: string): string => {
    return `${url}/${route}`;
  };

  private static async getRequest<ResponseData>(
    url: string,
  ): Promise<ResponseData> {
    try {
      const { data }: { data: ResponseData } = await axios.get(url);
      return data;
    } catch (err) {
      const errMessage = err.message;
      dbg(`ERROR ${url} - ${errMessage}`);
      throw new Error(errMessage);
    }
  }

  private static async postRequest<Params, ResponseData>(
    url: string,
    params: Params,
  ): Promise<ResponseData> {
    try {
      const { data }: { data: ResponseData } = await axios.post(url, params);
      return data;
    } catch (err) {
      if (!(err instanceof AxiosError)) {
        throw err;
      }
      const errMessage = `${err.message}: ${err.response?.data}`;
      dbg(`ERROR ${url} - ${errMessage}`);
      throw new Error(errMessage);
    }
  }

  static getNodeStatusAllNetworks = async (
    nodeURL: AvailableNodes,
  ): Promise<NodeStatusAllNetworks> => {
    const route = `node-status-v2`;
    const url = POINodeRequest.getNodeRouteURL(nodeURL, route);
    console.log("URL IS", url);
    const nodeStatusAllNetworks =
      await POINodeRequest.getRequest<NodeStatusAllNetworks>(url);
    return nodeStatusAllNetworks;
  };

  static getPOIsPerList = async (
    nodeURL: string,
    networkName: NetworkName,
    txidVersion: TXIDVersion,
    listKeys: string[],
    blindedCommitmentDatas: BlindedCommitmentData[]
  ): Promise<POIsPerListMap> => {
    const chain = NETWORK_CONFIG[networkName].chain;
    const route = `pois-per-list/${chain.type}/${chain.id}`;
    const url = POINodeRequest.getNodeRouteURL(nodeURL, route);
    console.log("URL IS", url);

    const poisPerList = await POINodeRequest.postRequest<
      GetPOIsPerListParams,
      POIsPerListMap
    >(url, {
      txidVersion,
      listKeys,
      blindedCommitmentDatas,
    });
    console.log("POIS PER LIST", poisPerList);
    return poisPerList;
  };
}
