/// <reference types="../types/index" />
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { ProofOfInnocenceNode } from '../proof-of-innocence-node';
import { TestMockListProviderExcludeSingleAddress } from '../tests/list-providers/test-mock-list-provider-exclude-single-address.test';
import { PollStatus } from '../models/general-types';
import { poll } from '@railgun-community/shared-models';
import { MOCK_LIST_KEYS } from '../tests/mocks.test';
import sinon, { SinonStub } from 'sinon';
import axios from 'axios';

chai.use(chaiAsPromised);

const PORT_1 = '3010';
const PORT_2 = '3011';

describe('proof-of-innocence-node', () => {
  let nodeWithListProvider: ProofOfInnocenceNode;

  let nodeOnlyAggregator: ProofOfInnocenceNode;

  it('Should start up an aggregator node', async () => {
    // Start the node
    nodeOnlyAggregator = new ProofOfInnocenceNode(
      '0.0.0.0',
      PORT_2,
      [], // No connected nodes
      undefined,
    );
    await nodeOnlyAggregator.start();
    await nodeOnlyAggregator.stop();
  }).timeout(40000);

  it('Should start up a node with list provider', async () => {
    // Start the aggregator
    nodeOnlyAggregator = new ProofOfInnocenceNode(
      '0.0.0.0',
      PORT_2,
      [], // No connected nodes
      undefined,
    );
    await nodeOnlyAggregator.start();
    // Start the node
    nodeWithListProvider = new ProofOfInnocenceNode(
      '0.0.0.0',
      PORT_1,
      [{ name: 'test', nodeURL: `http://localhost:${PORT_2}` }],
      new TestMockListProviderExcludeSingleAddress(MOCK_LIST_KEYS[0]),
    );
    await nodeWithListProvider.start();

    // Check that the node is an instance of ProofOfInnocenceNode
    expect(nodeWithListProvider).to.be.an.instanceOf(ProofOfInnocenceNode);

    expect(nodeWithListProvider.getPollStatus()).to.equal(PollStatus.IDLE);

    // Poll until PollStatus is POLLING.
    const pollStatusPolling = await poll(
      async () => nodeWithListProvider.getPollStatus(),
      status => status === PollStatus.POLLING,
      20,
      10000 / 20, // 10 seconds
    );
    if (pollStatusPolling !== PollStatus.POLLING) {
      throw new Error(
        `Should be polling, got ${nodeWithListProvider.getPollStatus()}`,
      );
    }

    await nodeWithListProvider.stop();
  }).timeout(30000);

  it('Should not start a list provider node if already running', async function () {
    this.timeout(40000);

    // Start the node
    nodeWithListProvider = new ProofOfInnocenceNode(
      '0.0.0.0',
      PORT_1,
      [{ name: 'test', nodeURL: `http://localhost:${PORT_2}` }],
      new TestMockListProviderExcludeSingleAddress(MOCK_LIST_KEYS[0]),
    );
    await nodeWithListProvider.start();

    // Wait for a short delay to ensure that the start method has finished
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Try to start the node for the second time
    // This should return immediately without throwing any errors
    await expect(nodeWithListProvider.start()).to.be.fulfilled;

    // Stop the node
    await nodeWithListProvider.stop();
  });

  it('Should not start a node if API fails to run', async function () {
    this.timeout(40000);

    // Start the node
    nodeWithListProvider = new ProofOfInnocenceNode(
      '0.0.0.0',
      PORT_1,
      [{ name: 'test', nodeURL: `http://localhost:${PORT_2}` }],
      new TestMockListProviderExcludeSingleAddress(MOCK_LIST_KEYS[0]),
    );

    // Stub the axios.get method to throw an error
    const stub: SinonStub = sinon.stub(axios, 'get');
    stub.throws(new Error('Network Error'));

    // This should throw an error because the API fails to run
    await expect(nodeWithListProvider.start()).to.be.rejectedWith(
      `Cannot start node: port ${PORT_1} is already in use`,
    );

    // Restore the axios.get method
    stub.restore();

    // Stop the node
    await nodeWithListProvider.stop();
  });
});
