const fs = require('fs');
const html = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/farm_game.html', 'utf8');

const eventsEnd = html.indexOf('// ==================== 游戏状态 ====================');
if (eventsEnd === -1) {
    console.error('EVENTS end not found');
    process.exit(1);
}

const before = html.substring(0, eventsEnd);
const after = html.substring(eventsEnd);

const npcChainCode = `
// ==================== NPC主动事件（事件链） ====================
const NPC_CHAIN_EVENTS = {
    suxiao_dinner: {
        id: 'suxiao_dinner',
        npc: 'suxiao',
        name: '来尝尝我的新菜',
        emoji: '👩‍🍳',
        description: '苏晓亲自下厨，做了一桌子菜，喊你过去尝尝。她站在门口，围裙上还沾着面粉，笑得特别真诚。',
        requireFriendship: 15,
        requireDay: 6,
        requireCompleted: null,
        options: [
            { text: '欣然前往（+10好感，+15体力）', effect: { npcFriendship: { suxiao: 10 }, stamina: 15 }, result: '苏晓的红烧肉绝了，你吃了三碗饭。她看着你吃得香，笑得眼睛弯成了月牙。' },
            { text: '说今天忙（+3好感）', effect: { npcFriendship: { suxiao: 3 } }, result: '苏晓有点失望，但说"改天，改天一定来啊"。' }
        ]
    },
    suxiao_recipe: {
        id: 'suxiao_recipe',
        npc: 'suxiao',
        name: '祖传菜谱',
        emoji: '📖',
        description: '苏晓把你拉到厨房，从柜子里翻出一本泛黄的旧本子。"这是我妈留下的菜谱，我想...传给你。"',
        requireFriendship: 35,
        requireDay: 12,
        requireCompleted: 'suxiao_dinner',
        options: [
            { text: '郑重接过（+15好感，+20金币）', effect: { npcFriendship: { suxiao: 15 }, money: 20 }, result: '你接过菜谱，苏晓的眼眶有点红。"以后...咱们一起开个大饭馆？"' },
            { text: '说太贵重了（+5好感）', effect: { npcFriendship: { suxiao: 5 } }, result: '苏晓坚持塞给你，"你值得。"' }
        ]
    },
    chenyang_tools: {
        id: 'chenyang_tools',
        npc: 'chenyang',
        name: '帮我修农具',
        emoji: '🔧',
        description: '陈阳扛着一把坏了的锄头来找你，"这锄头柄裂了，我一个人搞不定，你帮把手？"',
        requireFriendship: 15,
        requireDay: 8,
        requireCompleted: null,
        options: [
            { text: '一起修（-10体力，+10好感）', effect: { stamina: -10, npcFriendship: { chenyang: 10 } }, result: '你们忙了一下午，锄头修好了。陈阳递给你一瓶水，"谢了，兄弟。"' },
            { text: '说你自己能行（+3好感）', effect: { npcFriendship: { chenyang: 3 } }, result: '陈阳笑了笑，"也是，那我试试。"' }
        ]
    },
    chenyang_fishing: {
        id: 'chenyang_fishing',
        npc: 'chenyang',
        name: '一起去钓鱼',
        emoji: '🎣',
        description: '陈阳提着两根鱼竿站在田埂边，"后山塘里有鱼，去不去？"',
        requireFriendship: 35,
        requireDay: 15,
        requireCompleted: 'chenyang_tools',
        options: [
            { text: '去！（+15好感，+10金币）', effect: { npcFriendship: { chenyang: 15 }, money: 10 }, result: '你们钓了一下午，收获不小。陈阳说："小时候我爸常带我来这儿。"' },
            { text: '说今天有事（+5好感）', effect: { npcFriendship: { chenyang: 5 } }, result: '陈阳点点头，"那改天，我等你。"' }
        ]
    },
    linxiaoyu_story: {
        id: 'linxiaoyu_story',
        npc: 'linxiaoyu',
        name: '给学生讲讲城市',
        emoji: '📚',
        description: '林小雨站在教室门口，有些不好意思地看着你，"孩子们想听听城市里的故事...你能来讲讲吗？"',
        requireFriendship: 15,
        requireDay: 12,
        requireCompleted: null,
        options: [
            { text: '答应（+10好感，+5声望）', effect: { npcFriendship: { linxiaoyu: 10 }, reputation: 5 }, result: '你讲了一个小时，孩子们眼睛亮晶晶的。林小雨站在角落，偷偷给你竖了个大拇指。' },
            { text: '说不太会讲（+3好感）', effect: { npcFriendship: { linxiaoyu: 3 } }, result: '林小雨笑了，"没关系，下次准备好了再来。"' }
        ]
    },
    linxiaoyu_walk: {
        id: 'linxiaoyu_walk',
        npc: 'linxiaoyu',
        name: '一起去后山散步',
        emoji: '🌸',
        description: '傍晚，林小雨在村口等你，手里拿着一本书。"后山的野花开了，一起去看看吗？"',
        requireFriendship: 35,
        requireDay: 20,
        requireCompleted: 'linxiaoyu_story',
        options: [
            { text: '一起去（+15好感，+10体力）', effect: { npcFriendship: { linxiaoyu: 15 }, stamina: 10 }, result: '夕阳下，野花金灿灿的。林小雨轻声说："谢谢你，愿意来这村里。"' },
            { text: '说还有活要干（+5好感）', effect: { npcFriendship: { linxiaoyu: 5 } }, result: '林小雨点点头，"那...改天？"' }
        ]
    },
    wangmengmeng_video: {
        id: 'wangmengmeng_video',
        npc: 'wangmengmeng',
        name: '帮我拍个视频',
        emoji: '📱',
        description: '王萌萌举着一个手机冲过来，"帮我拍个视频呗！就你在地里干活的样子！"',
        requireFriendship: 15,
        requireDay: 14,
        requireCompleted: null,
        options: [
            { text: '配合拍摄（+10好感，+5声望）', effect: { npcFriendship: { wangmengmeng: 10 }, reputation: 5 }, result: '你对着镜头憨厚一笑，王萌萌说："绝了！这个表情肯定火！"' },
            { text: '说不想出镜（+3好感）', effect: { npcFriendship: { wangmengmeng: 3 } }, result: '王萌萌噘嘴，"好吧...那我拍花。"' }
        ]
    },
    wangmengmeng_viral: {
        id: 'wangmengmeng_viral',
        npc: 'wangmengmeng',
        name: '视频火了！',
        emoji: '🔥',
        description: '王萌萌一路小跑冲过来，举着手机激动得脸都红了，"火了！你那个视频点赞过万了！"',
        requireFriendship: 35,
        requireDay: 25,
        requireCompleted: 'wangmengmeng_video',
        options: [
            { text: '恭喜！（+15好感，+30金币）', effect: { npcFriendship: { wangmengmeng: 15 }, money: 30 }, result: '王萌萌一把抱住你，"谢谢你！没有你我火不了！"然后她意识到自己干了什么，脸更红了。' },
            { text: '说没什么大不了（+5好感）', effect: { npcFriendship: { wangmengmeng: 5 } }, result: '王萌萌认真地看着你，"不，你对我很重要。"' }
        ]
    },
    zhouming_online: {
        id: 'zhouming_online',
        npc: 'zhouming',
        name: '试试网上卖菜',
        emoji: '💻',
        description: '周明抱着笔记本电脑来找你，"我帮你注册了个账号，试试在网上卖菜？"',
        requireFriendship: 15,
        requireDay: 18,
        requireCompleted: null,
        options: [
            { text: '试试（+10好感，+15金币）', effect: { npcFriendship: { zhouming: 10 }, money: 15 }, result: '你拍了几张农产品照片，周明帮你上架。第二天就卖出了三单！' },
            { text: '说不太懂（+3好感）', effect: { npcFriendship: { zhouming: 3 } }, result: '周明耐心给你讲解，"没事，我教你，慢慢来。"' }
        ]
    },
    zhouming_bigorder: {
        id: 'zhouming_bigorder',
        npc: 'zhouming',
        name: '第一笔大订单',
        emoji: '📦',
        description: '周明难得地激动起来，"有个客户要订一百斤大米！这是你的订单！"',
        requireFriendship: 35,
        requireDay: 30,
        requireCompleted: 'zhouming_online',
        options: [
            { text: '立刻准备（+15好感，+50金币）', effect: { npcFriendship: { zhouming: 15 }, money: 50 }, result: '你连夜打包，周明帮你联系物流。他说："以后，我帮你把生意做大。"' },
            { text: '说太多了怕做不好（+5好感）', effect: { npcFriendship: { zhouming: 5 } }, result: '周明拍拍你肩膀，"有我在，你怕什么。"' }
        ]
    }
};

`;

fs.writeFileSync('C:/Users/Administrator/Documents/kimi/workspace/farm_game.html', before + npcChainCode + after);
console.log('Inserted NPC_CHAIN_EVENTS');
