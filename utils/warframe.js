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
        })
    });
    return body;
}

function newsFormat(body){
    body.forEach(function (value) {
        if(value.translations.zh)
        {
            value.message = value.translations.zh
        } else {
            var language = Object.keys(value.translations)[0];
            value.message = tran.googleTranslate(value.translations[language] ,language);
        }

        value.eta = utils.timeDiff(null,value.date);
    });
    return body;
}
module.exports = warframe;