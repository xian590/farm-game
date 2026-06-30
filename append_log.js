const fs = require('fs');
const now = new Date();
const timestamp = now.toISOString().replace('T', ' ').slice(0, 19);

const entry = `[${timestamp}] CHECK | WebBridge 状态检查 | day=43 season=summer time=16 money=3706(UI显示4306) stamina=200/200 health=199/200 fields=1 eventsToday=0 eventHistory=0 skills={cropFamiliarity:2(186exp), fieldManagement:1(84exp), toolMastery:0(9exp), composting:0(20exp)} npcs={wangcunzhang:4,lilaonong:6,zhangshen:5,wangerdan:10,zhaolaoban:2,laoyufu:6,linxiaoyu:4,suxiao:5,chenyang:7} reputation=21 mood=100 weather=windy mode=normal disasterRate=1.0 house=进阶房 quests=18 pets=2 workers=0 fishPond=true totalHarvest=11552 totalSell=7634 daysPlayed=102 items={fertilizer:1,medicine:2,organicFertilizer:3,shepherds_purse:9} seeds={rice_spring:1,sweet_spring:2}\nNOTE: 页面保持打开，时间推进仍冻结(自08:07起约48分钟无变化)，存档资金3706与UI资金4306不同步(差600元，丰收+乔迁里程碑奖励)。任务追踪显示18个待完成，田地1块idle荒地未整地。截图显示当前位于田地管理面板，事件日志显示第43天达成两个里程碑。\n========================\n`;

fs.appendFileSync('farm_test_log.txt', '\n========================\n' + entry, 'utf8');
console.log('Appended log entry.');
