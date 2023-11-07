import {
  BlindedCommitmentType,
  BlindedCommitmentData,
  isDefined,
  NetworkName,
  NodeStatusAllNetworks,
  NodeStatusForNetwork,
  TXIDVersion,
  POIsPerListMap,
} from '@railgun-community/shared-models';
import { StateCreator } from 'zustand';
import { AvailableNodes, availableNodesArray } from '@constants/nodes';
import { POINodeRequest } from '@services/poi-node-request';

export type NodesSlice = {
  nodeIp: AvailableNodes;
  nodeStatusForAllNetworks: NodeStatusAllNetworks | null;
  allNodesData: NodeStatusForNetwork[] | null;
  setNodeIp: (ip: AvailableNodes) => void;
  setCurrentNetwork: (network: NetworkName) => void;
  getNodeStatusForAllNetworks: () => void;
  getAllNodesData: () => void;
  getPOIsPerList: (listKeys: string[], railgunTxids: string[]) => void;
  refreshNode: () => void;
  loadingNodeStatusForAllNetworks: boolean;
  refreshingNode: boolean;
  lastRefreshedNodeStatusForAllNetworks: Date | null;
  currentNetwork: NetworkName;
  poisPerList: POIsPerListMap | null;
};

// TODO: Add better naming to all variables and functions.

export const createNodesSlice: StateCreator<NodesSlice, [], [], NodesSlice> = (
  set,
  get,
) => ({
  nodeIp: AvailableNodes.Aggregator, //TODO: Change this if needed
  nodeStatusForAllNetworks: null,
  currentNetwork: NetworkName.EthereumGoerli, //TODO: Change this.
  allNodesData: null,
  refreshingNode: false,
  loadingNodeStatusForAllNetworks: false,
  lastRefreshedNodeStatusForAllNetworks: null,
  poisPerList: null,
  setCurrentNetwork: (network: NetworkName) => {
    set(() => ({ currentNetwork: network }));
  },
  getAllNodesData: async () => {
    let allNodesData: NodeStatusForNetwork[] = [];
    // This is for current network
    const currentNetwork = get().currentNetwork;

    for (const node of availableNodesArray) {
      const data = await POINodeRequest.getNodeStatusAllNetworks(node);
      const serializedData = data.forNetwork[currentNetwork];
      if (serializedData) {
        allNodesData.push(serializedData);
      }
    }
    set(() => {
      return { allNodesData };
    });
  },
  getPOIsPerList: async (listKeys: string[], railgunTxids: string[]) => {
    set(() => ({ loadingNodeStatusForAllNetworks: true }));
    const nodeIp = get().nodeIp;
    const currentNetwork = get().currentNetwork;

    if (isDefined(nodeIp)) {
      const currentTime = new Date();
      const data = await POINodeRequest.getPOIsPerList(
        nodeIp,
        currentNetwork,
        TXIDVersion.V2_PoseidonMerkle,
        listKeys,
        railgunTxids.map(blindedCommitment => ({
          blindedCommitment,
          type: BlindedCommitmentType.Unshield,
        })),
      );
      set(() => {
        return {
          loadingNodeStatusForAllNetworks: false,
          poisPerList: data,
        };
      });
    } else {
      set(() => ({ nodeStatusForAllNetworks: null }));
    }
  },
  getNodeStatusForAllNetworks: async () => {
    set(() => ({ loadingNodeStatusForAllNetworks: true }));
    const nodeIp = get().nodeIp;

    if (isDefined(nodeIp)) {
      const currentTime = new Date();
      const data = await POINodeRequest.getNodeStatusAllNetworks(nodeIp);
      set(() => {
        return {
          nodeStatusForAllNetworks: data,
          lastRefreshedNodeStatusForAllNetworks: currentTime,
          loadingNodeStatusForAllNetworks: false,
        };
      });
    } else {
      set(() => ({ nodeStatusForAllNetworks: null }));
    }
  },
  setNodeIp: (ip: AvailableNodes) => {
    set(() => ({ nodeIp: ip }));
    get().getNodeStatusForAllNetworks();
  },
  refreshNode: async () => {
    set(() => ({ refreshingNode: true }));

    const nodeIp = get().nodeIp;

    if (isDefined(nodeIp)) {
      const currentTime = new Date();
      const data = await POINodeRequest.getNodeStatusAllNetworks(nodeIp);
      set(() => {
        return {
          nodeStatusForAllNetworks: data,
          lastRefreshedNodeStatusForAllNetworks: currentTime,
          refreshingNode: false,
        };
      });
    }
  },
});
