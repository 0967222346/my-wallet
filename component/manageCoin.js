const currencyList = require("../js/currencyList")
const storage = require("../js/storage.js")
const coinUtil = require("../js/coinUtil")
module.exports=require("./manageCoin.html")({
  data:()=>({
    coins:[],
    loading:false,
    requirePassword:false,
    password:"",
    incorrect:false
  }),
  methods:{
    push(){
      this.$emit("push",require("./send.js"))
    },
    load(){
      this.curs=[]
      this.fiatConv=0
      currencyList.each(cur=>{
        this.coins.push({
          coinId:cur.coinId,
          screenName:cur.coinScreenName,
          icon:cur.icon,
          usable:!!cur.hdPubNode
        })
      })
    },
    
    operateCoins(){
      const curs=[]
      this.loading=true
      this.coins.forEach(v=>{
        if(v.usable){
          curs.push(v.coinId)
        }
      })
      this.requirePassword=false
      
      this.$nextTick()
        .then(coinUtil.shortWait)
        .then(()=>storage.get("keyPairs"))
        .then((cipher)=>coinUtil.makePairsAndEncrypt({
          entropy:coinUtil.decrypt(cipher.entropy,this.password),
          password:this.password,
          makeCur:curs
        }))
        .then((data)=>storage.set("keyPairs",data))
        .then((cipher)=>{
          this.password=""
          this.$emit("replace",require("./login.js"))
        }).catch(()=>{
          this.password=""
          this.requirePassword=true
          this.loading=false
          this.incorrect=true
          setTimeout(()=>{
            this.incorrect=false
          },3000)
        })
    }
  },
  
  store:require("../js/store.js"),
  mounted(){
    this.$nextTick(this.load)
  }
});
