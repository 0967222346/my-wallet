const QRScanner = window.QRScanner
const coinUtil=require("../js/coinUtil")
module.exports=require("./qrcode.html")({
  data:()=>({
    cameras:[],
    loading:true,
    error:false,
    scanner:null,
    cameraIndex:0,
    canEnableLight:false,
    lightEnabled:false,
    canChangeCamera:false,
    currentCamera:0
  }),
  store:require("../js/store.js"),
  methods:{
    back(){
      QRScanner.destroy((status)=>{
        this.$emit("pop")
        this.$store.commit("setTransparency",false)
      });
      
      
    },
    settings(){
      QRScanner.openSettings();
    },
    parse(content){
      coinUtil.parseUrl(content).then(res=>{
        if(res.isCoinAddress&&res.isPrefixOk&&res.isValidAddress){
          this.$store.commit("setSendUrl",res.url)
          QRScanner.destroy((status)=>{
            this.$emit("pop")
            this.$store.commit("setTransparency",false)
            this.$emit("push",require("./send.js"))
          });
          
        }else if(res.protocol==="http"||res.protocol==="https"){
          window.open(res.url,this.$store.state.openInAppBrowser?"_blank":"_system")
        }else{
          this.$ons.notification.alert(res.url)
        }
      })
    },
    toggleLight(){
      if(this.lightEnabled){
        QRScanner.disableLight(function(err, status){
          this.$set(this,"lightEnabled",status&&status.lightEnabled)
        });
      }else{
        QRScanner.enableLight(function(err, status){
          this.$set(this,"lightEnabled",status&&status.lightEnabled)
        });
      }
    },
    changeCam(){
      this.$set(this,"loading",true)
      QRScanner.useCamera((!this.currentCamera)|0, (err, status)=>{
        this.$set(this,"currentCamera",status&&status.currentCamera)
        this.$set(this,"loading",false)
      });
    }
  },
  mounted(){
    this.$store.commit("setTransparency",true)
    this.loading=true
    QRScanner.prepare((err, status)=>{
      if (err) {
        this.$ons.notification.alert("error"+(err&&err.code))
      }
      if (status.authorized) {
        this.$set(this,"canEnableLight",status.canEnableLight)
        this.$set(this,"canChangeCamera",status.canChangeCamera)
        this.$set(this,"lightEnabled",status&&status.lightEnabled)
        this.$set(this,"currentCamera",status.currentCamera)
        this.$set(this,"loading",false)
        QRScanner.scan((err2,t)=>{
          if (err2) {
            if(err2.code===6){return }
            this.$ons.notification.alert("error code:"+err2.code)
            return
          }
          QRScanner.destroy()
          this.parse(t)
        })
        QRScanner.show()
      } else if (status.denied) {
        this.$ons.notification.alert("Please allow Camera")
      } else {
        this.back()
      }
    })
    
    
  }
})
