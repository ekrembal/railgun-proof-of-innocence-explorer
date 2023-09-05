import debug from 'debug';
import { initModules, uninitModules } from './init/init';
import { ListProvider } from './list-provider/list-provider';
import { API } from './api/api';

const dbg = debug('poi:node');

export class ProofOfInnocenceNode {
  private running = false;

  private port: string;

  private host: string;

  private listProvider: Optional<ListProvider>;

  private api: Optional<API>;

  constructor(host: string, port: string, listProvider?: ListProvider) {
    this.host = host;
    this.port = port;
    this.listProvider = listProvider;
  }

  async start() {
    if (this.running) {
      return;
    }
    dbg(`Starting Proof of Innocence node...`);

    this.running = true;

    this.api = new API();
    this.api.serve(this.host, this.port);

    await initModules();

    await this.listProvider?.init();
    await this.listProvider?.startPolling();

    dbg(`Proof of Innocence node running...`);
  }

  async stop() {
    dbg(`Stopping Proof of Innocence node...`);

    this.api?.stop();

    await uninitModules();
    await this.listProvider?.stopPolling();

    this.running = false;

    dbg(`Proof of Innocence node stopped.`);
  }
}
