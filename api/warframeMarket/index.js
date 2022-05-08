const utils = require('../../utils/utils')
const { getJson,getText } = require('../../utils/superagent')

const WARFRAME_HOST = "https://api.warframe.market/v1/"
const AUCTIONS_HOST = "https://warframe.market/auctions"
const AUCTIONS_HOST_ZH = "https://warframe.market/zh-hans/auctions"
const language_zh = 'zh-hans'
const language_en = 'en'

const index = {
    items:() => {
        const url = `${WARFRAME_HOST}items`
        return getJson(url).payload.items
    },
    item:(type) => {
        const url = `${WARFRAME_HOST}items/${type}`
        return getJson(url).payload.item
    },
    auctions:async () => {
        let text_zh = await getText(AUCTIONS_HOST_ZH,{language:language_zh})
        let state_zh = JSON.parse(text_zh.match(/(?<=id="application-state">).*(?=<\/script>)/).join())
        let text_en = await getText(AUCTIONS_HOST,{language:language_en})
        let state_en = JSON.parse(text_en.match(/(?<=id="application-state">).*(?=<\/script>)/).join())
        let merge = (v1,v2)=>{ return {...v1,en_item_name:v2.item_name}}
        let getKey = (v)=> v['url_name']
        let items = utils.mergeArray(state_zh.items,state_en.items,getKey,merge)
        let riven = utils.mergeArray(state_zh.riven.items,state_en.riven.items,getKey,merge)
        let auctionsWeapons = utils.mergeArray(
            state_zh.lich.weapons.concat(state_zh.sister.weapons),
            state_en.lich.weapons.concat(state_en.sister.weapons),
            getKey,
            merge
        )
        let ephemeras = utils.mergeArray(
            state_zh.lich.ephemeras.concat(state_zh.sister.ephemeras),
            state_en.lich.ephemeras.concat(state_en.sister.ephemeras),
            getKey,
            merge
        )
        let quirks = utils.mergeArray(
            state_zh.lich.quirks.concat(state_zh.sister.quirks),
            state_en.lich.quirks.concat(state_en.sister.quirks),
            getKey,
            merge
        )
        return {
            items,
            riven,
            auctionsWeapons,
            ephemeras,
            quirks
        }
    },
    auctionsSearch:(type, weapon_url_name)=>{
        let url = `${WARFRAME_HOST}auctions/search?type=${type}&weapon_url_name=${weapon_url_name}&polarity=any&buyout_policy=direct&sort_by=price_desc`
        return getJson(url).payload.auctions
    }
}

module.exports = index
