import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import usuarioRoutes from "./routes/usuario.routes.js";
import conectarDB from "./config/db.js";
import Blockchain from "./src/blockcahain.js";
import P2Pserver from "./app/p2pServer.js";
import bodyParser from "body-parser";
import CampaniaRouter from "./routes/CampaniaRouter.js";
import OrganizacionRouter from "./routes/OrganizacionRouter.js";
import transaccionesRouter from "./routes/transaccionesRouter.js";
import Wallet from "../backend/wallet/index.js";
import TransactionsPoll from "./wallet/transactions_pool.js";
import Miner  from "./app/miner.js"
const wallet = new Wallet();
const tp = new TransactionsPoll();
const bc = new Blockchain();
const p2pserver = new P2Pserver(bc,tp);
const miner  = new Miner(bc,tp,wallet,p2pserver);
const app = express();
app.use(express.json());

dotenv.config();
// conectarDB();
app.use(cors());

app.use("/api/organizacion", OrganizacionRouter);
app.use("/api/campania", CampaniaRouter);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/transaccion", transaccionesRouter);
app.use(bodyParser.json());

const PORT = process.env.PORT;
console.log(PORT);
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

//Rutas para  la cripto moneda Paco Coin 

app.post("/mine", (req, res) => {
  const block = bc.addBlock(req.body.data);
  console.log(`New Block add: ${block.toString()}`);
  p2pserver.syncChains();
  res.redirect("/blocks");
});

app.get("/blocks", (req, res) => {
  res.json(bc.chain);
});

app.get("/transactions", (req, res) => {
  res.json(tp.transactions);
});

app.post("/transact", (req, res) => {
  const { recipient, amount } = req.body;
  const transaction = wallet.createTransaction(recipient, amount,bc, tp);
  p2pserver.broadcastTransaction(transaction)
  res.redirect("/transactions");
});
app.get('/publicKey',(req,res)=>{
  res.json({publicKey:wallet.publicKey})
})
app.get('/key',(req,res)=>{
  res.json({publicKey:wallet.keyPair})
})
app.post('/mine_transactions',(req,res)=>{
  const block = miner.mine();
  console.log('added New Block'+block)
  res.redirect('/blocks')
})

app.get('/balance',(req,res)=>{
  res.json(wallet.calculateBalance(bc,wallet.publicKey))
})

app.post('/address_balance',(req,res)=>{
  res.json(wallet.calculateBalance(bc, req.body.address))
})


p2pserver.listen();
