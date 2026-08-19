import ChainUtil from "../wallet/chain_ultis.js";
const DIFFICULTY=300;
const MINE_RATE =3000;

class Block{

 
    constructor(time, previousHash,hash,data,nonce,difficulty,processTime){
        
        this.time=time;
        this.previousHash=previousHash;
        this.hash=hash;
        this.data=data;
        this.nonce=nonce;
        this.difficulty=difficulty;
        this.processTime=processTime
    }

    
    static get genesis(){
        const time = new Date('2009-03-01').getTime()
        return new this( 
            time,
            undefined,
            'GENESIS_HASH',
            "GENESIS_BLOCK",
            0,
            DIFFICULTY,
            0
        );
    }

  
    static mine(previousBlock,data){
        const{ hash:previousHash}=previousBlock;
        let{difficulty}=previousBlock;
        let hash;
        let time;
        let nonce=0;
        let t1=Date.now();
        do{
            time=Date.now();
            nonce +=1;
            difficulty = previousBlock.time + MINE_RATE > time ? difficulty + 1 : Math.max(difficulty - 1, 1);
            hash=this.hash(previousHash+time+data+nonce+difficulty)
        }while(hash.substring(0,difficulty)!=="0".repeat(difficulty));
        let t2=Date.now()
        let processtime=t2-t1
        return new this(time,previousHash,hash,data,nonce,difficulty,processtime);

    }

   static hash(previousHash,time,data,nonce,difficulty){
        return ChainUtil.hash(previousHash+time+data+nonce+difficulty).toString()
    }


    toString(){
        const {time, previousHash, hash,data,nonce,difficulty,processTime}=this
        return`
         BLock-
            Time:${time}
            Previus Hash:${previousHash}
            Hash:${hash}
            Data:${data}
            Nonce:${nonce}
            Difficulty:${difficulty}
            Process Time:${processTime}
        ------------------------------------------------------------------------
        `
    }
    

    static blockHash(block){
        const{time, previousHash, hash,data,nonce,difficulty}=block

        return block.hash;

    }
}

export default Block



