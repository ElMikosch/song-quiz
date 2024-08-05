import { Injectable, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack';

@Injectable({ providedIn: 'root' })
export class ConnectionService {
  hubConnection!: HubConnection;
  sessionId!: string;

  registerSuccess$ = signal<string>('');

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('/hubs/song-quiz')
      .withAutomaticReconnect()
      .withHubProtocol(new MessagePackHubProtocol())
      .build();

    const signalRPropNames = Object.getOwnPropertyNames(this).filter((n) =>
      n.endsWith('$'),
    );

    signalRPropNames.forEach((n) => {
      const methodName = n.substr(0, n.length - 1);
      const subject = signal<any>(undefined);
      this.hubConnection.on(methodName, (v) => {
        console.log(`[signalr][${methodName}] ${JSON.stringify(v)}`);
        subject.set(v);
      });
      this[<keyof ConnectionService>n] = subject as any;
    });

    this.hubConnection.start().then(this.onConnected.bind(this));
    this.hubConnection.onreconnected(this.onReconnected.bind(this));

    this.sessionId = sessionStorage.getItem('sessionId') || '';
  }

  public async sendMessage<T>(methodName: string, payload: T) {
    await this.hubConnection.invoke(methodName, {
      ...payload,
      sessionId: this.sessionId,
    });
  }

  private async onConnected() {
    console.log('connected');
    await this.register();
  }

  private async onReconnected(connectionId: string | undefined) {
    console.log('reconnected');
    await this.register();
  }

  private async register() {
    // await this.hubConnection.invoke('RegisterClient', this.sessionId);
    console.log('registered');
  }
}
