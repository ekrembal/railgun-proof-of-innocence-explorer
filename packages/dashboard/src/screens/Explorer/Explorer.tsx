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
import { FullScreenSpinner } from '@components/FullScreenSpinner/FullScreenSpinner';
import { POIStatusDisplay } from '@components/POIStatusDisplay/POIStatusDisplay';
import { ErrorDisplay } from '@components/ErrorDisplay/ErrorDisplay';
import { useNodeStore } from '@state/stores';
import styles from './Explorer.module.scss';

const LIST_NAMES = {
  'efc6ddb59c098a13fb2b618fdae94c1c3a807abc8fb1837c93620c9143ee9e88': "SDN+BlockedPersons"
}

export const Explorer = () => {
  // useState()
  const [queryInput, setQueryInput] = useState('');
  const {
    getNodeStatusForAllNetworks,
    getPOIsPerList,
    setLoadingNodeStatusForAllNetworks,
    nodeStatusForAllNetworks,
    loadingNodeStatusForAllNetworks,
    currentNetwork,
    poisPerList,
  } = useNodeStore();

  const [error, setError] = useState<string | null>(null);

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
    try {
      setError(null);
      setLoadingNodeStatusForAllNetworks(true);
      if (!listKeys) throw new Error("Couldn't find listKeys");
      // if input does not start with 0x, add it
      if (!input.startsWith('0x')) {
        input = '0x' + input;
      }
      let queryData: { txid: string; railgunTxids: string[] }[];
      if (input.length === 42) {
        queryData = await getRailgunTransactionDataForUnshieldToAddress(
          NETWORK_CONFIG[currentNetwork].chain,
          input,
        );
      } else if (input.length === 66) {
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
      } else {
        queryData = [];
      }
      if (queryData.length == 0)
        throw new Error("Couldn't find any transactions");
      await getPOIsPerList(listKeys, queryData);
    } catch (e) {
      setError(e.message);
    }
    setLoadingNodeStatusForAllNetworks(false);
  };

  if (loadingNodeStatusForAllNetworks) {
    return <FullScreenSpinner />;
  }

  return (
    <div
      className={`${styles.explorerContainer} ${
        poisPerList ? styles.explorerContainerWithData : ''
      }`}
    >
      <input
        type="text"
        value={queryInput}
        onChange={e => setQueryInput(e.target.value)}
        placeholder="Search by Address or Txn Hash"
      />
      <button onClick={() => handleQuery(queryInput)}>Search</button>
      {error === null && poisPerList && <POIStatusDisplay poisPerListMap={poisPerList} listNames={LIST_NAMES} />}
      {error !== null && <ErrorDisplay message={error} />}
    </div>
  );
};
