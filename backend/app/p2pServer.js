import WebSocket, { WebSocketServer } from "ws";
import dotenv from "dotenv";

dotenv.config();

// ws://192.168.101.3:12345
const peers = process.env.PEERS ? process.env.PEERS.split(",") : ['ws://localhost:5100'];
const P2P_PORT = process.env.P2P_PORT;
const MESSAGE_TYPES = {
  chain: "CHAIN",
  transaction: "TRANSACTION",
  clear_transactions: "CLEAR_TRANSACTIONS",
};

console.log("P2P_PORT:", P2P_PORT);
const sockets = [];

class P2PServer {
  constructor(blockchain, transactionPool) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
  }

  listen() {
    const server = new WebSocketServer({ host: "0.0.0.0", port: P2P_PORT });
    server.on("connection", (socket) => this.connectSocket(socket));
    console.log(
      "Listening for peer-to-peer connections on port " +
        P2P_PORT +
        "estos son los peer" +
        peers
    );

    this.connectToPeers();
  }

  connectToPeers() {
    peers.forEach((peer) => {
      const socket = new WebSocket(peer);
      socket.on("error", console.error);
      socket.on("open", () => this.connectSocket(socket));
    });
  }

  connectSocket(socket) {
    sockets.push(socket);
    this.messageHandler(socket);
    this.sendChain(socket);
    console.log("[ + ] Socket connected");
  }

  messageHandler(socket) {
    socket.on("message", (message) => {
      console.log("message received: " + message);
      const data = JSON.parse(message);
      // this.blockchain.remplaceChain(data);
      switch (data.type) {
        case MESSAGE_TYPES.chain:
          this.blockchain.remplaceChain(data.chain);
          break;
        case MESSAGE_TYPES.transaction:
          this.transactionPool.updateOrAddTransaction(data.transaction);
          break;
        case MESSAGE_TYPES.clear_transactions:
          this.transactionPool.clear();
          break;
      }
    });
  }

  sendChain(socket) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPES.chain,
        chain: this.blockchain.chain,
      })
    );
  }
  // C:\Users\samyr\OneDrive\Documentos\blockchain_minado\backend

  syncChains() {
    if (!sockets) {
      console.error("sockets is undefined or null");
      return;
    }

    if (!Array.isArray(sockets)) {
      console.error("sockets is not an array");
      return;
    }

    sockets.forEach((socket) => {
      this.sendChain(socket);
    });
  }
  sendTransaction(socket, transaction) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPES.transaction,
        transaction,
      })
    );
  }

  broadcastTransaction(transaction) {
    sockets.forEach((socket) => this.sendTransaction(socket, transaction));
  }

  broadcastClearTransactions() {
    sockets.forEach((socket) =>
      socket.send(
        JSON.stringify({
          type: MESSAGE_TYPES.clear_transactions,
        })
      )
    );
  }
}


export default P2PServer;
