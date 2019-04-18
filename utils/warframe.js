var wfaLibs = require('./wfaLibs');
var utils = require('./utils');
var mcache = wfaLibs.mcache;

warframe = {
    getInfo:function (type = 'alerts',orginInfo) {
        switch (type) {
            case "timestamp":
                return utils.apiTimeUtil(orginInfo);
            case "news":
                return null;
            case "events":
                return null;
            case "alerts":
                return utils;
            case "sortie":
                return null;
            case "syndicateMissions":
                return null;
            case "fissures":
                return null;
            case "globalUpgrades":
                return null;
            case "flashSales":
                return null;
            case "invasions":
                return null;
            case "darkSectors":
                return null;
            case "voidTrader":
                return null;
            case "dailyDeals":
                return null;
            case "simaris":
                return null;
            case "conclaveChallenges":
                return null;
            case "persistentEnemies":
                return null;
            case "earthCycle":
                return null;
            case "cetusCycle":
                return null;
            case "weeklyChallenges":
                return null;
            case "constructionProgress":
                return null;
            case "vallisCycle":
                return null;
            case "nightwave":
                return null;
            case "twitter":
                return null;
        }
    }
};


module.exports = warframe;