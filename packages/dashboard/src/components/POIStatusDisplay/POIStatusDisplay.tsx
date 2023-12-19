import { POIsPerListMap } from '@railgun-community/shared-models';
import React from 'react';

export const POIStatusDisplay = ({
  poisPerListMap,
}: {
  poisPerListMap: {
    txid: string;
    poisPerList: POIsPerListMap;
  }[];
}) => {
  return (
    <div>
      {poisPerListMap.map(({ txid, poisPerList }) => (
        <div key={txid}>
          <h3>Transaction ID: {txid}</h3>
          {Object.entries(poisPerList).map(([blindedCommitment, poiList]) => (
            <div key={blindedCommitment}>
              <h4>Blinded Commitment: {blindedCommitment}</h4>
              <ul>
                {Object.entries(poiList).map(([listKey, poiStatus]) => (
                  <li key={listKey}>
                    List Key: {listKey}, Status: {JSON.stringify(poiStatus)}
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
