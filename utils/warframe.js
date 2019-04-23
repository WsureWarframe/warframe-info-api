var tran = require('./translate');
var utils = require('./utils');

warframe = {
    getInfo:function (type = 'alerts',orginInfo) {
        switch (type) {
            case "timestamp":
                return utils.apiTimeUtil(orginInfo);
            case "news":
                return orginInfo;
            case "events":
                return orginInfo;
            case "alerts":
                return alertsFormat(orginInfo);
            case "sortie":
                return sortieFormat(orginInfo);
            case "syndicateMissions":
                return orginInfo;
            case "fissures":
                return orginInfo;
            case "globalUpgrades":
                return orginInfo;
            case "flashSales":
                return orginInfo;
            case "invasions":
                return orginInfo;
            case "darkSectors":
                return orginInfo;
            case "voidTrader":
                return orginInfo;
            case "dailyDeals":
                return orginInfo;
            case "simaris":
                return orginInfo;
            case "conclaveChallenges":
                return orginInfo;
            case "persistentEnemies":
                return orginInfo;
            case "earthCycle":
                return orginInfo;
            case "cetusCycle":
                return orginInfo;
            case "weeklyChallenges":
                return orginInfo;
            case "constructionProgress":
                return orginInfo;
            case "vallisCycle":
                return orginInfo;
            case "nightwave":
                return nightwaveFormat(orginInfo);
            case "twitter":
                return orginInfo;
        }
    }
};

function alertsFormat(body){
    body.forEach(function (value) {
        //剩余时间格式化
        value.eta = utils.timeDiff(null,value.expiry);
        value.mission.description = tran.rewardString(value.mission.description);
        value.mission.reward.asString = tran.rewardString(value.mission.reward.asString);
        value.mission.node = tran.nodeString(value.mission.node);
        value.mission.type = tran.rewardString(value.mission.type);
        //
    });
    return body;
}

function nightwaveFormat(body){
    body.activeChallenges.forEach(function (value) {
        value.title = tran.rewardString(value.title);
        value.desc = tran.rewardString(value.desc);
        value.eta = utils.timeDiff(null,value.expiry);
    });
    return body;
}

function sortieFormat(body){
    body.boss = tran.rewardString(body.boss);
    body.eta = utils.timeDiff(null,body.expiry);
    body.variants.forEach(function (value) {
        Object.keys(value).forEach(function (val) {
            value[val] = tran.rewardString(value[val])
        });
        value.node = tran.nodeString(value.node);
    });
    return body;
}

module.exports = warframe;