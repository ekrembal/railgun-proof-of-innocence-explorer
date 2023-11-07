import { POIsPerListMap } from '@railgun-community/shared-models';
import React from 'react';

export const POIStatusDisplay = ({ poisPerListMap } : {poisPerListMap: POIsPerListMap}) => {
  return (
    <div>
      {Object.entries(poisPerListMap).map(([blindedCommitment, poisPerList]) => (
        <div key={blindedCommitment}>
          <h3>Blinded Commitment: {blindedCommitment}</h3>
          <ul>
            {Object.entries(poisPerList).map(([listKey, status]) => (
              <li key={listKey}>
                List Key: {listKey}, Status: {status}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
