import { POIListNames, POIsPerListMap } from '@railgun-community/shared-models';
import styles from './POIStatusDisplay.module.scss';

export const POIStatusDisplay = ({
  poisPerListMap,
  listNames,
}: {
  poisPerListMap: {
    txid: string;
    poisPerList: POIsPerListMap;
  }[];
  listNames: POIListNames;
}) => {
  return (
    <div className={styles.poiStatusDisplay}>
      {poisPerListMap.map(({ txid, poisPerList }) => (
        <div key={txid}>
          <h3>Txn Hash: {txid}</h3>
          {Object.entries(poisPerList).map(([blindedCommitment, poiList]) => (
            <div key={blindedCommitment}>
              <h4>Blinded Commitment: {blindedCommitment}</h4>
              <ul>
                {Object.entries(poiList).map(([listKey, poiStatus]) => (
                  
                  <li key={listKey}>
                    List Key: {listKey} <br />
                    List Name:  {listNames[listKey] ? listNames[listKey]: "unknown"} <br />
                    Status: {poiStatus}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};