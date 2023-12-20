import {
  isDefined,
  NETWORK_CONFIG,
  NetworkName,
} from '@railgun-community/shared-models';
import {
  getRailgunTransactionDataForUnshieldToAddress,
  getRailgunTxidsForUnshields,
} from '@railgun-community/wallet';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FullScreenSpinner } from '@components/FullScreenSpinner/FullScreenSpinner';
import { POIStatusDisplay } from '@components/POIStatusDisplay/POIStatusDisplay';
import { List } from '@screens/NodeStatus/components/List/List';
import { useNodeStore } from '@state/stores';
import styles from './Explorer.module.scss';

export const Explorer = () => {
  // useState()
  const [queryInput, setQueryInput] = useState(
    '',
  );
  const {
    getNodeStatusForAllNetworks,
    getPOIsPerList,
    nodeStatusForAllNetworks,
    loadingNodeStatusForAllNetworks,
    currentNetwork,
    poisPerList,
  } = useNodeStore();

  const nodeStatusForCurrentNetwork = useMemo(
    () => nodeStatusForAllNetworks?.forNetwork[currentNetwork],
    [currentNetwork, nodeStatusForAllNetworks?.forNetwork],
  );
  const listKeys = useMemo(
    () => nodeStatusForAllNetworks?.listKeys,
    [nodeStatusForAllNetworks],
  );

  useEffect(() => {
    if (!isDefined(nodeStatusForAllNetworks)) {
      getNodeStatusForAllNetworks();
    }
  }, [getNodeStatusForAllNetworks, nodeStatusForAllNetworks]);

  const handleQuery = async (input: string) => {
    console.log(input);
    console.log('query');
    if (!listKeys) return;
    let queryData: { txid: string; railgunTxids: string[] }[];
    if (input.length === 42) {
      queryData = await getRailgunTransactionDataForUnshieldToAddress(
        NETWORK_CONFIG[currentNetwork].chain,
        input,
      );
    } else if(input.length === 66) {
      let railgunTxids = await getRailgunTxidsForUnshields(
        NETWORK_CONFIG[currentNetwork].chain,
        input,
      );
      queryData = [
        {
          txid: input,
          railgunTxids,
        },
      ];
    }  else {
      queryData = [];
    }
    console.log(queryData);
    if (queryData.length === 0) {
      console.log('no transactions');
    }
    const data = await getPOIsPerList(listKeys, queryData);
    console.log(data);
  };

  if (loadingNodeStatusForAllNetworks) {
    return <FullScreenSpinner />;
  }

  return (
    <div className={`${styles.explorerContainer} ${poisPerList ? styles.explorerContainerWithData : ''}`}>
      <input
        type="text"
        value={queryInput}
        onChange={e => setQueryInput(e.target.value)}
        placeholder='Enter a txid or address'
      />
      <button onClick={() => handleQuery(queryInput)}>Search</button>
      {poisPerList && <POIStatusDisplay poisPerListMap={poisPerList} />}
    </div>
  );
};
