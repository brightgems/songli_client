'use strict';

angular.module('clientApp')
  .service('RestWechat', function(Restangular){
    return Restangular.service('wechat');
  })
  .service('RestWxQrcode', function(Restangular){
    return Restangular.service('gift/wx_qrcode');
  })
  .service('Wechat',function($rootScope, $location, $document, $state, RestWechat, Alert, UserAgent) {
    return {
      params: {
        url  : $location.absUrl(),
        title : $document[0].title,
        desc : this.url,
        img : 'http://static.ifindu.cn/91pintuan/images/logo.png'
      },
      config:function(){
        this.params.url = $location.absUrl();
        
        return RestWechat.one('sign').one('jssdk').get({type:'jsapi',url:this.params.url}).then(function(data){
          $rootScope.signature = data.signature;
          
          var config = {
            appId: data.appId,
            timestamp: data.timestamp,
            nonceStr: data.nonceStr,
            signature: data.signature,
            jsApiList: [
              'onMenuShareTimeline',
              'onMenuShareAppMessage',
              'onMenuShareQQ',
              'onMenuShareWeibo',
              'chooseWXPay',
              'editAddress',
              'startRecord',
              'stopRecord',
              'onVoiceRecordEnd',
              'playVoice',
              'pauseVoice',
              'stopVoice',
              'getLocation',
              'onVoicePlayEnd',
              'uploadVoice',
              'downloadVoice',
              'openLocation'
            ]
          };
          wx.config(config);
          return;
        });
      },
      ready:function(data){
        
        if (UserAgent.isiOS) {
          wx.ready(done.bind(this))
        } else {
          this.config().then(() => {
            wx.ready(done.bind(this))
          })
        }

        function done () {
          if (typeof data === 'function') {
            return data()
          }

          try{
            data  = data || {};
            var url   = data.url ?  data.url  : this.params.url;
            var title = data.title? data.title: this.params.title;
            var desc  = data.desc?  data.desc : this.params.url;
            var img   = data.img ?  data.img  : this.params.img;
            var options = {
              title: title,
              desc: desc,
              link: url,
              imgUrl:  img,
              success: function(res){
                if($rootScope.modalInstance) $rootScope.modalInstance.close();
                if(data.state&&data.params) $state.go(data.state,data.params);
              },
              cancel: function(res){
                //Alert.add('warning',res.errMsg);alert(res.errMsg);
              },
              fail: function(res){
              // alert(res.errMsg)
              },
              complete: function(res){
              // alert(res.errMsg)
              },
              trigger: function(res){
              // alert(res.errMsg)
              }
            };
            var optionsTimeline = {
              title: data.timeline,
              link: url,
              imgUrl:  img
            };
            wx.ready(function(){
              wx.onMenuShareTimeline(optionsTimeline);
              wx.onMenuShareAppMessage(options);
              wx.onMenuShareQQ(options);
              wx.onMenuShareWeibo(options);
            });
          }catch(e){
            alert(e.message);
          }
        }
      } 
    };
  })
  ;
