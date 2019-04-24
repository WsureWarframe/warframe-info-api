var tran = require('./translate');
var utils = require('./utils');

warframe = {
    getInfo:function (type = 'alerts',orginInfo) {
        switch (type) {
            case "timestamp":
                return utils.apiTimeUtil(orginInfo);
            case "news":
                return newsFormat(orginInfo);
            case "events":
                return eventsFormat(orginInfo);
            case "alerts":
                return alertsFormat(orginInfo);
            case "sortie":
                return sortieFormat(orginInfo);
            case "syndicateMissions":
                return syndicateMissionsFormat(orginInfo);
            case "fissures":
                return fissuresFormat(orginInfo);
            case "globalUpgrades":
                return orginInfo;
            case "flashSales":
                return flashSalesFormat(orginInfo);
            case "invasions":
                return invasionsFormat(orginInfo);
            case "voidTrader":
                return voidTraderFormat(orginInfo);
            case "dailyDeals":
                return dailyDealsFormat(orginInfo);
            case "conclaveChallenges":
                return orginInfo;
            case "persistentEnemies":
                return orginInfo;
            case "earthCycle":
                return cycleFormat(orginInfo);
            case "cetusCycle":
                return cycleFormat(orginInfo);
            case "weeklyChallenges":
                return orginInfo;
            case "constructionProgress":
                return orginInfo;
            case "vallisCycle":
                return cycleFormat(orginInfo);
            case "nightwave":
                return nightwaveFormat(orginInfo);
            case "twitter":
            case "darkSectors":
            case "simaris":
            default:
                return orginInfo;
        }
    },
    robotFormatStr:function (type = 'alerts',orginInfo) {
        switch (type) {
            case "timestamp":
                return timestampAsString(utils.apiTimeUtil(orginInfo));
            case "news":
                return newsAsString(newsFormat(orginInfo));
            case "events":
                return eventsAsString(eventsFormat(orginInfo));
            case "alerts":
                return alertsAsString(alertsFormat(orginInfo));
            case "sortie":
                return sortieFormat(orginInfo);
            case "syndicateMissions":
                return syndicateMissionsFormat(orginInfo);
            case "fissures":
                return fissuresFormat(orginInfo);
            case "globalUpgrades":
                return orginInfo;
            case "flashSales":
                return flashSalesFormat(orginInfo);
            case "invasions":
                return invasionsFormat(orginInfo);
            case "voidTrader":
                return voidTraderFormat(orginInfo);
            case "dailyDeals":
                return dailyDealsFormat(orginInfo);
            case "conclaveChallenges":
                return orginInfo;
            case "persistentEnemies":
                return orginInfo;
            case "earthCycle":
                return cycleFormat(orginInfo);
            case "cetusCycle":
                return cycleFormat(orginInfo);
            case "weeklyChallenges":
                return orginInfo;
            case "constructionProgress":
                return orginInfo;
            case "vallisCycle":
                return cycleFormat(orginInfo);
            case "nightwave":
                return nightwaveFormat(orginInfo);
            case "twitter":
            case "darkSectors":
            case "simaris":
            default:
                return orginInfo;
        }
    }
};

function alertsFormat(body){
    body.forEach(function (value) {
        //剩余时间格式化
        value.eta = utils.timeDiff(null,value.expiry);
        value.mission.description = tran.translateByCache(value.mission.description);
        value.mission.reward.asString = tran.translateByCache(value.mission.reward.asString);
        value.mission.node = tran.translateByCache(value.mission.node);
        value.mission.type = tran.translateByCache(value.mission.type);
        //
    });
    return body;
}

function nightwaveFormat(body){
    body.activeChallenges.forEach(function (value) {
        value.title = tran.translateByCache(value.title);
        value.desc = tran.translateByCache(value.desc);
        value.eta = utils.timeDiff(null,value.expiry);
    });
    return body;
}

function sortieFormat(body){
    body.boss = tran.translateByCache(body.boss);
    body.eta = utils.timeDiff(null,body.expiry);
    body.variants.forEach(function (value) {
        Object.keys(value).forEach(function (val) {
            value[val] = tran.translateByCache(value[val])
        });
        value.node = tran.translateByCache(value.node);
    });
    return body;
}

function eventsFormat(body){
    body.forEach(function (value) {
        value.description = tran.translateByCache(value.description);
        value.tooltip = tran.translateByCache(value.tooltip);
        value.node = tran.translateByCache(value.node);
        value.victimNode = tran.translateByCache(value.victimNode);
        value.rewards.forEach(function (val) {
            val.asString = tran.translateByCache(val.asString);
        });
        value.eta = utils.timeDiff(null,value.expiry);
    });
    return body;
}

function newsFormat(body) {
    return new Promise(async (resolve, reject) => {
        for (let value of body) {
            if (value.translations.zh) {
                value.message = value.translations.zh
            } else {
                var language = Object.keys(value.translations)[0];
                console.log(language, value.translations[language]);
                var tranRes = await tran.googleTranslate(value.translations[language], language);
                console.log(tranRes);
                value.message = tranRes.dist;
            }
            value.eta = utils.timeDiff(null, value.date);
        }
        resolve(body);
    })
}

function syndicateMissionsFormat(body){
    body.forEach(function (value) {
        value.eta = utils.timeDiff(null,value.expiry);
        value.syndicate = tran.translateByCache(value.syndicate);
        value.nodes.forEach(function (node,index) {
            value.nodes[index] = tran.translateByCache(node);
        });
        value.jobs.forEach(function (job) {
            job.rewardPool.forEach(function (reward,index) {
                job.rewardPool[index] = tran.translateByCache(reward);
            });
            job.type = tran.translateByCache(job.type);
        })
    });
    return body;
}

function fissuresFormat(body){
    body.forEach(function (value) {
        value.eta = utils.timeDiff(null,value.expiry);
        value.node = tran.translateByCache(value.node);
        value.missionType = tran.translateByCache(value.missionType);
        value.tier = tran.translateByCache(value.tier);
    });
    return body
}

function flashSalesFormat(body){
    body.forEach(function (value) {
       value.item = tran.translateByCache(value.item);
    });
    return body;
}

function invasionsFormat(body){
    body.forEach(function (value) {
        value.node = tran.translateByCache(value.node);
        value.desc = tran.translateByCache(value.desc);
        value.attackerReward.asString = tran.translateByCache(value.attackerReward.asString);
        value.defenderReward.asString = tran.translateByCache(value.defenderReward.asString);
        value.eta = utils.timeDiff(null,value.activation);
    });
    return body
}

function voidTraderFormat(body){
    body.location = tran.translateByCache(body.location);
    body.startString = utils.timeDiff(null,body.activation);
    body.endString = utils.timeDiff(null,body.expiry);
    body.activation = utils.apiTimeUtil(body.activation).localTime;
    body.expiry = utils.apiTimeUtil(body.expiry).localTime;
    body.inventory.forEach(function (value) {
        value.item = tran.translateByCache(value.item);
    });
    return body;
}

function dailyDealsFormat(body){
    body.forEach(function (value) {
        value.item = tran.translateByCache(value.item);
    });
    return body
}

function cycleFormat(body){
    body.timeLeft = utils.timeDiff(null,body.expiry);
    return body;
}

function timestampAsString(body){
    return body.localTime;
}

function newsAsString(promise){
    return new Promise(async (resolve, reject) => {
        let asString = '';
        let zhArr = [],otherArr = [];
        let body = await promise;
        body.forEach(function (value) {
            if(value.translations.zh)
            {
                zhArr.push(value.message+'\n'+value.link);
            } else {
                otherArr.push(Object.keys(value.translations)[0]+':'+value.message+'\n'+value.link);
            }
        });
        asString += '新闻：\n\n'+zhArr.join('\n')+'\n\n外区新闻(谷歌机翻)：\n\n'+otherArr.join('\n');
        resolve(asString);
    });
}

function eventsAsString(body){
    let evevts = [];
    body.forEach(function (value,index) {
        evevts.push((index+1)+':'+value.description
            +'\n进度:'+value.health
            +'\n'+value.eta);
    });
    return evevts.join('\n');
}

function alertsAsString(body){
    let alerts = [];
    body.forEach(function (value,index) {
        alerts.push((index+1)+'.'+value.mission.node
            +(value.mission.description === 'Gift From The Lotus'?' Lotus的施舍':'')
            +'\n类型：'+value.mission.faction+' '+value.mission.type+(value.mission.archwingRequired?'(Archwing)':'')
            +'\n奖励：'+value.mission.reward.asString
            +'\n时间：'+value.eta
        )
    });
    return alerts.join('\n');
}
module.exports = warframe;