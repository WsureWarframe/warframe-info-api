const tran = require('../../utils/translate');
const utils = require('../../utils/utils');
const logger = require('../../utils/logger')(__filename)
const cycleState = require('../../utils/dict/CycleState.json');

const timeout = 24 * 60 * 60 * 1000;

const warframe = {
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
            case "flashSales":
                return flashSalesFormat(orginInfo);
            case "invasions":
                return invasionsFormat(orginInfo);
            case "voidTrader":
                return voidTraderFormat(orginInfo);
            case "dailyDeals":
                return dailyDealsFormat(orginInfo);
            case "persistentEnemies":
                return persistentEnemiesFormat(orginInfo);
            case "earthCycle":
            case "cetusCycle":
            case "cambionCycle":
            case "vallisCycle":
                return cycleFormat(orginInfo);
            case "nightwave":
                return nightwaveFormat(orginInfo);
            case "arbitration":
                return arbitrationFormat(orginInfo);
            case "conclaveChallenges":
            case "weeklyChallenges":
            case "globalUpgrades":
            case "constructionProgress":
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
                return sortieAsString(sortieFormat(orginInfo));
            case "syndicateMissions":
                return syndicateMissionsFormat(orginInfo);
            case "Solaris":
                return syndicateAsString(syndicateMissionsFormat(orginInfo),'Solaris United');
            case "Ostrons":
            case "Entrati":
                return syndicateAsString(syndicateMissionsFormat(orginInfo),type);
            case "EntratiSyndicate":
                return syndicateAsString(syndicateMissionsFormat(orginInfo),'Entrati');
            case "fissures":
                return fissuresAsString(fissuresFormat(orginInfo));
            case "globalUpgrades":
                return orginInfo;
            case "flashSales":
                return flashSalesAsString(flashSalesFormat(orginInfo));
            case "invasions":
                return invasionsAsString(invasionsFormat(orginInfo));
            case "voidTrader":
                return voidTraderAsString(voidTraderFormat(orginInfo));
            case "dailyDeals":
                return dailyDealsAsString(dailyDealsFormat(orginInfo));
            case "persistentEnemies":
                return persistentEnemiesAsString(persistentEnemiesFormat(orginInfo));
            case "vallisCycle":
            case "earthCycle":
            case "cetusCycle":
            case "cambionCycle":
                return cycleAsString(cycleFormat(orginInfo));
            case "constructionProgress":
                return constructionProgressAsString(orginInfo);
            case "nightwave":
                return nightwaveAsString(nightwaveFormat(orginInfo));
            case "arbitration":
                return arbitrationAsString(arbitrationFormat(orginInfo));
            case "conclaveChallenges":  //没人打pvp ， 没需求不做
            case "twitter":             //和我们没啥关系
            case "darkSectors":         //黑区已经废弃
            case "simaris":             //这个没用
            case "weeklyChallenges":    //一个未开发完成的接口
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

function arbitrationFormat(body){
    body.node = tran.translateByCache(body.node);
    body.eta = utils.timeDiff(null,body.expiry);
    body.type = tran.translateByCache(body.type);
    return body;
}

function sortieFormat(body){
    body.boss = tran.translateByCache(body.boss);
    body.eta = utils.timeDiff(null,body.expiry);
    body.variants.forEach(function (value) {
        Object.keys(value).forEach(function (val) {
            value[val] = tran.translateByCache(value[val])
        });
    });
    return body;
}

function eventsFormat(body){
    return utils.cacheUtil( 'events_key', async () => {
        for (let value of body) {
            value.description = tran.translateByCache(value.description);
            logger.info(tran.translateByCache(value.tooltip));
            value.tooltip = (await tran.googleTranslate(tran.translateByCache(value.tooltip)));
            value.node = tran.translateByCache(value.node);
            value.victimNode = tran.translateByCache(value.victimNode);
            for (let val of value.rewards) {
                val.asString = tran.translateByCache(val.asString);
                val.itemString = tran.translateByCache(val.itemString);
            }
            for (let val of value.interimSteps) {
                val.reward.asString = tran.translateByCache(val.reward.asString);
                val.reward.itemString = tran.translateByCache(val.reward.itemString);
            }
            value.eta = utils.timeDiff(null, value.expiry);

        }
        return body;
    }, timeout);
}

function newsFormat(body) {
    return utils.cacheUtil( 'news_key', async () => {
        for (let value of body) {
            if (value.translations.zh) {
                value.message = value.translations.zh
            } else {
                const language = Object.keys(value.translations)[0];
                logger.info(language, value.translations[language]);
                const tranRes = await tran.googleTranslate(tran.translateByCache(value.translations[language]), language);
                logger.info(tranRes);
                value.message = tranRes;
            }
            value.eta = utils.timeDiff(null, value.date);
        }
        return body;
    }, timeout);
}

function syndicateMissionsFormat(body){
    body.forEach(function (value) {
        value.eta = utils.timeDiff(null,value.expiry);
        value.syndicateZh = tran.translateByCache(value.syndicate);
        value.nodes.forEach(function (node,index) {
            value.nodes[index] = tran.translateByCache(node);
        });
        value.jobs.forEach(function (job) {
            job.rewardPool && job.rewardPool.forEach(function (reward,index) {
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
       // value.item = tran.translateByCache(value.item);
        value.eta = utils.timeDiff(null,value.expiry);
    });
    return body;
}

function invasionsFormat(body){
    let resArr = [];
    body.forEach(function (value) {
        if(!value.completed)
        {
            value.node = tran.translateByCache(value.node);
            value.desc = tran.translateByCache(value.desc);
            value.attackerReward.asString = tran.translateByCache(value.attackerReward.asString);
            value.defenderReward.asString = tran.translateByCache(value.defenderReward.asString);
            value.eta = utils.timeDiff(null,value.activation);
            resArr.push(value);
        }
    });
    return resArr;
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
        value.eta = utils.timeDiff(null,value.expiry);
    });
    return body
}

function persistentEnemiesFormat(body) {
    body.forEach(function (value) {
        value.agentType = tran.translateByCache(value.agentType);
        value.lastDiscoveredAt = tran.translateByCache(value.lastDiscoveredAt);
        value.lastDiscoveredTime = utils.timeDiff(null,value.lastDiscoveredTime);
    });
    return body
}

function cycleFormat(body){
    body.timeLeft = utils.timeDiff(null,body.expiry);
    !body.state && ( body.state = body.active ) ;
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

function eventsAsString(promise){
    return new Promise(async (resolve, reject) => {
        let body = await promise;
        let evevts = [];
        if(body.length === 0){
            resolve('暂无活动')
        }
        body.forEach(function (value,index) {
            evevts.push((index+1)+':'+value.description
                +'\n进度:'+(value.health===''?value.health:'未知')
                +'\n'+value.eta);
        });
        resolve(evevts.join('\n'));
    });
}

function alertsAsString(body){
    if(body.length ===0){
        return '暂无警报事件';
    }
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

function sortieAsString(body){
    let sortie = ['Boss:'+body.boss+' ('+body.faction+')\n'];
    body.variants.forEach(function (value,index) {
        sortie.push((index+1)+'.'+value.node
            +'\n任务：'+value.missionType+'('+value.modifier)
    });
    sortie.push('\n时间：'+body.eta);
    return sortie.join('\n');
}

/**
 * @return {string}
 */
function syndicateAsString(body,syndicate = 'Ostrons'){ //Solaris United
    let resArr = [],target = {};
    body.forEach(function (value) {
        if(value.syndicate === syndicate)
            target = value;
    });
    target.jobs.forEach(function (job,index) {
        resArr.push((index+1)+'.'+job.type+':');
        resArr.push(job.rewardPool.join('/')+'\n');
    });
    resArr.push('时间：'+target.eta);
    return resArr.join('\n');
}

function fissuresAsString(body){
    let fissures = [];
    body.forEach(function (value) {
        fissures.push('['+value.tier+']'+value.node
            +'\n任务：'+value.missionType+'('+value.enemy+')'
            +'\n时间：'+value.eta
        )
    });
    return fissures.join('\n\n');
}

function persistentEnemiesAsString(body) {
    let persistentEnemies = [];
    body.forEach(value=>{
        persistentEnemies.push('类型:'+value.agentType+'(生命:'+Math.round(value.healthPercent*100)+'%)'
            +'\n最近出现时间:'+value.lastDiscoveredTime
            +'\n最近出现位置:'+value.lastDiscoveredAt
            +'\n状态:'+( value.isDiscovered?'可以追捕喵(>^ω^<)':'正在逃跑，无法追捕喵(>^ω^<)')
        )
    });
    if(body.length === 0){
        persistentEnemies.push('当前没有小小黑哦');
    }
    return persistentEnemies.join('\n\n');
}


function cycleAsString(body){
    const state = cycleState[body.state] ? cycleState[body.state] : body.state;
    return '状态：'+state+'\n时间：'+body.timeLeft;
}

function constructionProgressAsString(body){
    return '巨人舰队：'+body.fomorianProgress+'%\n利刃豺狼：'+body.razorbackProgress+'%';
}

function dailyDealsAsString(body){
    let res = [];
    body.forEach(function (value) {
        res.push('商品：'+value.item+' [-'+value.discount+'%]'
        +'\n价格：'+value.salePrice+'('+value.originalPrice+')'
        +'\n库存：'+(value.total-value.sold)+'/'+value.total
        +'\n时间：'+value.eta);
    });
    return res.join('\n');
}

function flashSalesAsString(body) {
    let res = [];
    body.forEach((value)=>{
        res.push('商品：'+value.item
            +'\n价格：'+value.premiumOverride+'p ('+value.regularOverride+')'+' [-'+value.discount+'%] '
            +(value.isFeatured?'精选':(value.isPopular?'流行':'未知')))
    });
    return res.join("\n\n");
}

function invasionsAsString(body){
    let invasions = [];
    body.forEach(function (value,index) {
        invasions.push(
            (index+1)+'.'+value.node
            +'\n   攻['+value.completion.toFixed(2)+'%]\t受['+(100-value.completion).toFixed(2)+'%]'
            +'\n   '+value.attackingFaction+'\tvs\t'+value.defendingFaction
            +'\n'+(value.attackerReward.asString?value.attackerReward.asString:'没有奖励')+' vs '+(value.defenderReward.asString?value.defenderReward.asString:'没有奖励')
            +'\n'+(
                value.vsInfestation ? // 是否是I佬参与的？
                    ('I佬挨打中...   需'+(value.count+value.requiredRuns)+'助攻喵~') :  //是 就I佬挨打
                    (value.completion>=50 ?  //否 再判断进攻方是否是优势
                        ('需'+(value.requiredRuns-value.count)+'助攻喵~  '+value.defendingFaction.substr(0,1)+'佬挨打中...') :  // 攻方优势 受方挨打
                            (value.attackingFaction.substr(0,1)+'佬挨打中...   需'+(value.count+value.requiredRuns)+'助攻喵~')  // 受方优势 攻方挨打
                    )
            )
        )
    });
    return invasions.join('\n\n');
}

function voidTraderAsString(body){
    let voidTrader = [];
    voidTrader.push('奸商状态：'+(body.active?'到达':'离开'));
    voidTrader.push('奸商位置：'+body.location);
    if(body.active)
    {
        voidTrader.push('奸商货物：');
        body.inventory.forEach(function (val,ind) {
            voidTrader.push((ind+1)+'.'+val.item+'('+val.ducats+'du '+val.credits/10000+'Wcr)')
        })
    }
    voidTrader.push(
        '\n奸商：' + (body.active ? body.endString+'离开' : body.startString+'到达')
    );
    return voidTrader.join('\n');
}

function nightwaveAsString(body){
    let activeChallenges = [];
    body.activeChallenges.forEach(function (value,index) {
        activeChallenges.push(
            (index+1)+'.'+value.title+'('+value.reputation+')'
            +'\n'+value.desc
            +(value.isDaily ? '\n时间：'+value.eta:'')
        )
    });
    return activeChallenges.join('\n\n');
}

function arbitrationAsString(body){
    if(body.type)
        return `类型：${body.type} (${body.enemy})\n节点：${body.node}\n时间：${body.eta}`
    else
        return "获取失败，请去游戏里查看"
}
module.exports = warframe;
