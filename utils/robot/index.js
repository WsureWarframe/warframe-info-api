const schedule = require('../../schedule/worldStateSchedule');
const wfUtils = require('../warframe')
const moment = require('moment')
const robotJson = require("../dict/robot.json");

module.exports = {
    async taskQueue(type){
        let res = []
        let data = await worldState(type)
        let warframe = []
        if(data instanceof Array){
            warframe = data.sort( (v1,v2) => v2.activation - v1.activation )
                .filter(v => !v.expiry || moment(v.expiry).diff(moment()) >= 0 )
        } else {
            warframe = [data]
        }
        if(warframe.length >0){
            res = warframe.map( item => {
                return {key:item.id,timeout:!item.expiry ? moment().valueOf() + 30*60*1000 : moment(item.expiry).valueOf()}
            })
        }
        return res
    },
    async taskInfo(type,key){
        let keys = key.split(',')
        let res = ''
        let task = robotJson.tasks.filter( v => v.alia === type).slice(0,1)
        let head = task[0] && task[0].head ? task[0].head : ''
        let warframe = await worldState(type)
        let itemList = []
        if(warframe instanceof Array){
            itemList = warframe.filter( v=> keys.includes(v.id))
            if(itemList.length >0){
                res = head + '\n' + wfUtils.robotFormatStr(type,itemList)
            }
        } else {
            if(keys.includes(warframe.id)){
                res = head + '\n' + wfUtils.robotFormatStr(type,warframe)
            }
        }
        return res
    }
}

async function worldState(type){
    let worldState = await schedule.getWorldStateCache(schedule);
    return worldState[type]? worldState[type] : [] ;
}