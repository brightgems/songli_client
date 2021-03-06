'use strict';

angular.module('clientApp')
    .config(function($stateProvider) {
        $stateProvider
            .state('gift', {
                abstract: true,
                url: '/gift',
                template: '<ui-view/>'
            })
            .state('gift.list', {
                url: '/list',
                templateUrl: 'app/gift/gift.lists.html',
                controller: 'GiftListCtrl',
            })
            .state('gift.my', {
                url: '/my',
                templateUrl: 'app/gift/orderlist/order.list.html',
                controller: 'GiftMyCtrl'
            })
            .state('gift.listen', {
                url: '/listen/:id?from',
                templateUrl: 'app/gift/gift.listen.html',
                controller: 'GiftListenCtrl',
                resolve: {
                    order: function($stateParams, RestGiftOrder) {　
                        return RestGiftOrder.one($stateParams.id).one('detail').get({
                            from: $stateParams.from
                        });
                    }
                }
            })
            .state('gift.audio', {
                url: '/audio',
                templateUrl: 'app/gift/gift.audio.html',
                controller: 'GiftAudioCtrl'
            })
            .state('gift.detail', {
                url: '/:id',
                templateUrl: 'app/gift/gift.detail.html',
                controller: 'GiftDetailCtrl',
                resolve: {
                    gift: function($state, $stateParams, $location, RestGift, Wechat, Alert) {
                        var gift = RestGift.one($stateParams.id).get();
                        var apiCfg = window.SONGNI_CFG_API;
                        gift.then(function(gift) {
                            var url = 'http://' + $location.host() + '/gift/' + gift.id;
                            var title = gift.info.name;
                            var desc = gift.info.lead;
                            var timeline = title;
                            var img = 'http://' + apiCfg.phtUri + gift.info.cover;
                            // var img = 'http://static.ifindu.cn/gift/images/share.png?2';
                            Wechat.ready({
                                url: url,
                                title: title,
                                desc: desc,
                                timeline: timeline,
                                img: img
                            });
                            if (gift.status.online === false) {
                                // Alert.add('danger', '该礼物已下架!');
                            }
                        });　
                        return gift;
                    }
                },
              
            })

        /**
         * 录制声音, 选择人数
         * 一送一 模式填入收礼人姓名
         */
        // one 2 one
        .state('gift.detail.one2one-record', { //录制礼物
            url: '/one2one-record',
            templateUrl: 'app/gift/order/one2one/record.html',
            controller: 'GiftRecordSingleCtrl',
            authenticate: true,
        })

        // one 2 many
        .state('gift.detail.one2many-record', { //录制礼物
            url: '/one2many-record',
            templateUrl: 'app/gift/order/one2many/record.html',
            controller: 'GiftRecordMultiCtrl',
            authenticate: true
        })

        /**
         * 分享
         */
        .state('gift.detail.share', { //分享页面
            url: '/share?from',
            templateUrl: 'app/gift/gift.share.html',
            controller: 'GiftShareCtrl',
        })
        .state('gift.detail.orders', { //分享后页面
            url: '/orders',
            templateUrl: 'app/gift/gift.orders.html',
            controller: 'GiftOrdersCtrl',
        })
        .state('gift.detail.qrcode', {
            url: '/qrcode',
            templateUrl: 'app/gift/gift.qrcode.html',
            controller: 'GiftShareCtrl',
            authenticate: true
        })
        .state('order', {
            abstract: true,
            url: '/order',
            template: '<ui-view/>'
        })
        .state('order.list', {
            url: '/list',
            templateUrl: 'app/gift/orderlist/order.list.html',
            controller: 'GiftMyCtrl',
        })
        .state('order.detail', {
            url: '/:id?from',
            template: '<ui-view/>',
            abstract: true,
            resolve: {
                order: function($stateParams, RestGiftOrder) {　
                    return RestGiftOrder.one($stateParams.id).one('detail').get({
                        from: $stateParams.from
                    });
                }
            }
        })
        .state('order.detail.go', {
            url: '/go',
            controller: function($scope, $state, order) {
                // if (order.receiver.consignee)
                location.href = $state.href('order.detail.info', {
                    id: order.id
                });
                // else
                //     location.href = $state.href('order.detail.address', {
                //         id: order.id
                //     });
            }
        })

        /**
         * 支付后
         * 支付成功后，送礼人分享／填写地址界面
         */
        .state('order.detail.one2one-address', { //我填写地址
            url: '/one2one-address',
            templateUrl: 'app/gift/order/one2one/address.html',
            controller: 'OrderAddressOne2OneCtrl',
            authenticate: true,
        })

        .state('order.detail.one2many-address', { //我填写地址
            url: '/one2many-address',
            templateUrl: 'app/gift/order/one2many/address.html',
            controller: 'OrderAddressOne2ManySendCtrl',
            authenticate: true,
        })

        // .state('order.detail.one2one-received', { //1送1已收货
        //         url: '/one2one-received',
        //         templateUrl: 'app/gift/order/one2one/received.html',
        //         controller: 'OrderReceivedOne2OneCtrl',
        //         authenticate: true,
        //         css: [{
        //             href: 'assets/v2/css/gift-style.css',
        //         }]
        //     })
            
        .state('order.detail.guide', {
            url: '/guide',
            templateUrl: 'app/gift/address.guide.html',
            controller: 'OrderAddressCtrl',
            authenticate: true,
        })
        .state('order.detail.fillin', { //好友填写地址
            url: '/fillin?from',
            templateUrl: 'app/gift/order/gift.receive.status.html',
            controllerProvider: function(order) {
                console.warn(order.capacity);
                if (order.capacity == 1) { 
                    return 'OrderAddressOne2OneCtrl';
                }
                return 'OrderAddressOne2ManyRecevCtrl';
            },
            authenticate: true,
        })
        .state('order.detail.subscribe', {
            url: '/subscribe',
            template: '<order-subscribe order="$ctrl.order"></order-subscribe>',
            controller: function(order){
                this.order = order;
            },
            controllerAs: '$ctrl'
        })
        .state('order.detail.fillin-one2many', { // One 2 Many 收取礼物
            url: '/fillin-one2many',
            templateUrl: 'app/gift/order/one2many/address.fillin.html',
            controller: 'OrderAddressOne2ManyRecevAddrCtrl',
            authenticate: true
        })
        .state('order.detail.fillin-one2one', { // One 2 One 收取礼物
            url: '/fillin-one2one',
            templateUrl: 'app/gift/order/one2one/address.fillin.html',
            controller: 'OrderAddressOne2OneRecevAddrCtrl',
            authenticate: true
        })

        .state('order.detail.received-result', {
            url: '/received-result',
            template: '<order-received order="$ctrl.order"></order-received>',
            controller: function(order){
                this.order = order;
            },
            controllerAs: '$ctrl',
            authenticate: true,
        })

        .state('order.detail.received-guide', {
            url: '/received-guide',
            template: '<order-received-guide order="$ctrl.order"></order-received-guide>',
            controller: function(order){
                this.order = order;
            },
            controllerAs: '$ctrl',
            authenticate: true
        })

        .state('order.detail.info', { //订单详情
            url: '/info',
            templateUrl: 'app/gift/orderlist/order.info.html',
            controller: 'GiftOrderDetailCtrl',
            authenticate: true,
        })
        
        // .state('order.detail.receive', {
        //     url: '/receive',
        //     templateUrl: '<order-receive order="$ctrl.order" address="$ctrl.address"></order-receive>',
        //     controller: function(order){
        //         this.order = order;
        //     },
        //     controllerAs: '$ctrl',
        //     authenticate: true
        // })

        .state('order.detail.received', {
            url: '/received',
            templateUrl: 'app/gift/orderlist/order.received.html',
            controller: 'GiftReceivedCtrl',
            authenticate: true,
        })
        .state('order.detail.shipped', {
            url: '/shipped',
            templateUrl: 'app/gift/orderlist/order.shipped.html',
            controller: 'GiftShippedCtrl',
            authenticate: true,
        })
        .state('order.detail.listened', {
            url: '/listened',
            templateUrl: 'app/gift/orderlist/order.listened.html',
            controller: 'GiftListenedCtrl',
            authenticate: true,
        })
        .state('order.detail.listen', { //收听订单
            url: '/listen',
            templateUrl: 'app/gift/gift.listen.html',
            controller: 'GiftListenCtrl',
            authenticate: true,
        })
        .state('guide', {
            url: '/guide?id',
            templateUrl: 'app/gift/gift.guide.html',
            controller: 'GiftGuideCtrl'
        })
        .state('test', {
            url: '/test',
            templateUrl: 'app/gift/test.html',
            controller: 'TestCtrl'
        });
    });
