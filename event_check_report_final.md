# 事件系统检查报告

## 一、事件总数统计
- EVENTS 对象（随机天气/增益/人为事件）: **25** 个
- STORY_EVENTS 数组（日常/恐怖/剧情事件）: **128** 个
- NIGHT_EVENTS 数组（夜间事件）: **11** 个
- 合计: **164** 个

## 二、EVENTS 事件概览
| id | 名称 | emoji | 概率 | 类型 |
|---|---|---|---|---|
| drought | 持续干旱 | 🏜️ | 0.05 | disaster |
| rainstorm | 暴雨内涝 | 🌧️ | 0.04 | disaster |
| pest | 病虫害 | 🐛 | 0.05 | disaster |
| heatwave | 高温热害 | 🔥 | 0.03 | disaster |
| sunnyDay | 风和日丽 | 🌤️ | 0.08 | gain |
| bumperHarvest | 瑞雪兆丰年 | ❄️ | 0.05 | gain |
| villageChiefVisit | 村长慰问 | 👨‍💼 | 0.03 | human |
| kidTrample | 熊孩子捣蛋 | 👦 | 0.04 | human |
| auntGift | 张婶送菜 | 👩 | 0.03 | human |
| oldFarmerAdvice | 老农指点 | 👴 | 0.03 | human |
| rainbow | 雨后彩虹 | 🌈 | 0.05 | gain |
| birdNest | 喜鹊筑巢 | 🐦 | 0.04 | gain |
| marketBoom | 粮价上涨 | 📈 | 0.03 | gain |
| tiredDay | 疲惫的一天 | 😴 | 0.04 | human |
| findTreasure | 意外发现 | 💎 | 0.02 | human |
| continuousRain | 连阴雨 | 🌧️ | 0.03 | disaster |
| hail | 冰雹灾害 | 🧊 | 0.02 | disaster |
| lateSpringCold | 倒春寒 | ❄️ | 0.03 | disaster |
| fireflies | 萤火虫之夜 | ✨ | 0.04 | gain |
| swallowsReturn | 燕子归来 | 🐦 | 0.04 | gain |
| doubleRainbow | 双彩虹 | 🌈 | 0.03 | gain |
| neighborHelp | 邻居帮忙 | 🤝 | 0.03 | human |
| buyerVisit | 收购商上门 | 🚚 | 0.02 | human |
| villageWedding | 村里办喜事 | 🎊 | 0.02 | human |
| agriExtension | 农技推广 | 📚 | 0.02 | human |

## 三、STORY_EVENTS 事件概览（前30个）
| id | 名称 | emoji | 概率 | 类型 |
|---|---|---|---|---|
| borrow_hoe | 隔壁借锄头 | 🔧 | 0.06 | story |
| pick_mushroom | 后山捡蘑菇 | 🍄 | 0.06 | story |
| hen_egg | 老母鸡下蛋 | 🥚 | 0.12 | story |
| snake_in_field | 田里有蛇 | 🐍 | 0.12 | story |
| wild_rabbit | 野兔子跑地里 | 🐇 | 0.12 | story |
| village_doctor | 村医上门 | 💊 | 0.12 | story |
| vegetables_stolen | 菜被偷了 | 🥬 | 0.12 | story |
| package_arrived | 快递到了 | 📦 | 0.12 | story |
| rain_collect_clothes | 下雨收衣服 | ☔ | 0.12 | story |
| pick_wild_fruits | 山上摘野果 | 🍇 | 0.12 | story |
| lost_puppy | 走丢的小狗 | 🐶 | 0.12 | story |
| watermelon | 冰西瓜 | 🍉 | 0.12 | story |
| chop_wood | 上山砍柴 | 🪓 | 0.12 | story |
| beggar | 要饭的 | 🥣 | 0.12 | story |
| snowing | 下雪了 | ❄️ | 0.06 | story |
| roast_sweet_potato | 烤红薯 | 🍠 | 0.06 | story |
| dig_bamboo_shoots | 挖春笋 | 🎋 | 0.06 | story |
| swallow_nest | 燕子搭窝 | 🐦 | 0.06 | story |
| pick_chestnuts | 打板栗 | 🌰 | 0.06 | story |
| dry_grain | 晒谷子 | 🌾 | 0.06 | story |
| dragon_boat_festival | 端午节 | 🐲 | 0.02 | story |
| mid_autumn_festival | 中秋节 | 🥮 | 0.02 | story |
| chinese_new_year | 过年 | 🧨 | 0.02 | story |
| ahua_catch_mouse | 阿花抓老鼠 | 🐱 | 0.08 | story |
| dahuang_chase_rabbit | 大黄撵兔子 | 🐶 | 0.08 | story |
| cat_dog_fight | 猫狗打架 | 😾 | 0.018 | story |
| meet_suxiao | 村小的老师 | 👩‍🏫 | 0.08 | story |
| suxiao_vegetables | 给苏老师送菜 | 🥬 | 0.12 | story |
| suxiao_repair_desk | 帮苏老师修桌椅 | 🔨 | 0.12 | story |
| catch_cicada | 摸知了猴 | 🦗 | 0.04 | story |
... 共 128 个

## 四、概率结局检查
**没有发现概率结局。** 所有事件选项都是确定性效果（选择后效果固定，无随机分支）。
- 当前系统中没有 outcomes 或概率分支结构
- 每个选项对应唯一确定的 effect 和 result

## 五、Emoji 兼容性检查
- 共使用 **111** 个不同 emoji
- ZWJ 组合 emoji（需较新系统支持）: 👩‍⚕️, 👨‍👩‍👧, 👩‍🏫, 👨‍🌾, 🐈‍⬛, 👨‍💼, 🐕‍⬛
- 所有 emoji 均为 Unicode 标准常用字符，在现代浏览器（Chrome 90+/Firefox 88+/Safari 14+）中均可正常显示。

## 六、文案通顺性检查
发现 **167** 处潜在问题:
- `[result] borrow_hoe`: 结果句末缺标点: 你说自己下午还要用，没借给他，王大叔有点失望的走了。声望-2
- `[result] pick_mushroom`: 结果句末缺标点: 你去后山转了一下午，捡了半筐鲜蘑菇，卖了30块钱，还留了点晚
- `[result] hen_egg`: 结果句末缺标点: 你把鸡蛋煮了吃，香的很，吃完感觉浑身都有力气。健康+2，体力
- `[result] hen_egg`: 结果句末缺标点: 你把鸡蛋攒起来，等攒多了一起卖，卖了3块钱。钱+3
- `[result] snake_in_field`: 结果句末缺标点: 你拿棍子把蛇挑到后山去了，没伤着它，就是吓了一跳。体力-10
- `[result] snake_in_field`: 结果句末缺标点: 你喊来李老农，他说这是菜花蛇没毒，抓去卖了15块钱，分了你一
- `[result] wild_rabbit`: 结果句末缺标点: 你追了二里地居然把兔子逮住了，卖了40块钱，给你乐坏了。体力
- `[result] village_doctor`: 结果句末缺标点: 王大夫给你量了血压，说你身体挺好，给了两包感冒药预防。健康+
- `[result] vegetables_stolen`: 结果句末缺标点: 你站地头骂了两句出出气，也不知道是谁偷的，自认倒霉。心情-3
- `[result] vegetables_stolen`: 结果句末缺标点: 你去找村长说了，村长在大喇叭上喊了两句，以后再也没人偷你菜了
- `[result] package_arrived`: 结果句末缺标点: 你骑车去小卖部把快递取了，买的东西还不错，挺开心的。体力-1
- `[result] rain_collect_clothes`: 结果句末缺标点: 你跑回家刚把衣服收完，大雨就下来了，一点没淋湿。体力-10
- `[result] rain_collect_clothes`: 结果句末缺标点: 你懒得跑，衣服被雨淋透了，还得重新洗。心情-3，损失5块钱洗
- `[result] pick_wild_fruits`: 结果句末缺标点: 你上山摘了半兜野果，酸甜酸甜的，还是小时候的味道。体力-15
- `[result] lost_puppy`: 结果句末缺标点: 你把它赶走了，小狗夹着尾巴走了，你心里有点不是滋味。心情-2
- `[result] watermelon`: 结果句末缺标点: 你切了半个西瓜，用勺子挖着吃，冰甜冰甜的，暑气全消了。钱-8
- `[result] watermelon`: 结果句末缺标点: 你把西瓜放井里冰着，明天再吃。钱-8
- `[result] chop_wood`: 结果句末缺标点: 你上山砍了一担柴，自己烧够了，多的卖了25块钱。体力-30，
- `[result] chop_wood`: 结果句末缺标点: 你懒得砍柴，花20块钱买了煤球烧，省事。钱-20
- `[result] beggar`: 结果句末缺标点: 你给了他两个馒头，他千恩万谢走了，村里人看见都夸你心善。钱-
- `[result] beggar`: 结果句末缺标点: 你把他赶走了，他摇摇头走了，你心里有点不舒服。声望-2
- `[result] snowing`: 结果句末缺标点: 你把家门口和路上的雪都扫了，村里人路过都夸你勤快。体力-15
- `[result] snowing`: 结果句末缺标点: 你窝在家里烤火，看着外面下雪，舒服的很。体力+10，心情+5
- `[result] roast_sweet_potato`: 结果句末缺标点: 红薯烤的流蜜，甜的很，吃了浑身都暖了。体力+15，心情+8
- `[result] dig_bamboo_shoots`: 结果句末缺标点: 你挖了半筐春笋，嫩的很，卖了40块钱，还留了点炒肉吃。体力-
- `[result] swallow_nest`: 结果句末缺标点: 老话说燕子不进愁家门，你让它们在这搭窝，以后虫子都少了。心情
- `[result] swallow_nest`: 结果句末缺标点: 你把燕子窝捅了，燕子飞走了，村里人说你不懂事。心情-3，声望
- `[result] pick_chestnuts`: 结果句末缺标点: 你打了半袋板栗，炒着吃甜糯的很，卖了35块钱。体力-25，钱
- `[result] dry_grain`: 结果句末缺标点: 你把谷子摊在晒场上晒了一天，干的透透的，多卖了20块钱。体力
- `[result] dry_grain`: 结果句末缺标点: 你没晒，谷子有点发霉，少卖了15块钱。钱-15
... 还有 137 处

## 七、选项数值模式分析
### 统计
- 双选项事件: **90** 个
- 符合一好一坏（或一好一中性/一坏一中性）模式: **9** 个
- 不符合: **81** 个

### 不符合一好一坏的典型事件
| 事件 | 选项1 | 方向1 | 选项2 | 方向2 | 说明 |
|---|---|---|---|---|---|
| drought | 挑水抗旱（-30体力） | mixed | 听天由命 | mixed | 同向结果 |
| rainstorm | 挖沟排水（-25体力） | mixed | 等水自己退 | mixed | 同向结果 |
| continuousRain | 开沟沥水（-20体力） | mixed | 等天晴 | mixed | 同向结果 |
| hail | 抢盖薄膜（-25体力） | mixed | 躲屋里 | mixed | 同向结果 |
| hen_egg | 煮了吃补身体 | good | 攒着卖钱 | good | 同向结果 |
| rain_collect_clothes | 赶紧跑回去收 | bad | 淋就淋吧 | bad | 同向结果 |
| mid_autumn_festival | 买月饼赏月 | mixed | 给家里打个电话 | mixed | 同向结果 |
| chinese_new_year | 买鞭炮贴春联 | mixed | 简单过个年 | mixed | 同向结果 |
| sunbathe | 一起晒会太阳 | good | 回家躺着 | good | 同向结果 |
| warm_fire | 烤火嗑瓜子 | good | 早点睡 | good | 同向结果 |
| village_rooster | 起来干活 | mixed | 蒙头继续睡 | mixed | 同向结果 |
| broken_well_bucket | 找根绳子捞上来 | bad | 不要了 | bad | 同向结果 |
| lost_chicken | 满村追着抓 | bad | 等晚上自己回来 | bad | 同向结果 |
| rain_leak_roof | 爬起来拿盆接 | bad | 换间房睡 | bad | 同向结果 |
| autumn_harvest_smell | 去帮忙收稻 | mixed | 在家晒自己的粮 | mixed | 同向结果 |
| village_tv_news | 看到最后 | good | 换个台看电视剧 | good | 同向结果 |
| village_mahjong | 凑上去看两把 | mixed | 小玩两把 | mixed | 同向结果 |
| village_wedding_invite | 去随礼吃席 | mixed | 去帮忙 | mixed | 同向结果 |
| morning_dew_watering | 趁露水没干浇水 | bad | 等露水干了再说 | bad | 同向结果 |
| field_sparrows | 扎个稻草人 | bad | 拿竹竿赶 | bad | 同向结果 |
| winter_hot_water_bottle | 早点睡 | good | 再熬一会 | good | 同向结果 |
| midnight_crying | 起来看看 | bad | 蒙头睡觉 | bad | 同向结果 |
| old_house_shadow | 推门进去看看 | bad | 赶紧走 | bad | 同向结果 |
| well_ghost_hand | 拿绳子把桶捞上来 | bad | 不要了 | bad | 同向结果 |
| ghost_wall | 吐口唾沫 | bad | 坐下来等天亮 | bad | 同向结果 |
| wall_handprint | 烧纸拜一拜 | bad | 用白灰把墙刷一遍 | bad | 同向结果 |
| blood_moon | 关门睡觉 | bad | 点着灯坐一宿 | bad | 同向结果 |
| owl_laugh | 拿石头扔它 | bad | 假装没听见 | bad | 同向结果 |
| coffin_sound | 烧纸钱 | bad | 躲进屋 | bad | 同向结果 |
| scarecrow_turn | 烧掉它 | bad | 绕路回家 | bad | 同向结果 |
| empty_chair | 把椅子搬到院子里晒 | bad | 拿斧头劈了 | bad | 同向结果 |
| mirror_face | 用布盖住镜子 | bad | 回头看 | bad | 同向结果 |
| midnight_knock | 大声骂 | bad | 不理它 | bad | 同向结果 |
| will_o_wisp | 吐口唾沫跟着走 | bad | 坐下等它们消失 | bad | 同向结果 |
| dog_silent | 出去看看 | bad | 把大黄抱进屋 | bad | 同向结果 |
| sing_on_grave | 烧纸 | bad | 跑 | bad | 同向结果 |
| paper_money_burning | 把灰烬扫了 | bad | 再烧一叠 | bad | 同向结果 |
| black_dog_barking | 换条路走 | bad | 赶它走 | bad | 同向结果 |

### 常见模式分类
- 纯正面/纯正面（good/good）: **5** 个
- 纯负面/纯负面（bad/bad）: **23** 个 — 恐怖事件几乎都是此模式
- 混合/混合（mixed/mixed）: **10** 个 — 付出代价换取收益

## 八、关键发现
1. **当前系统完全没有概率结局** — 每个选项效果都是确定的，没有选A有50%好/50%坏的设计。
2. **EVENTS 解析存在数据重叠问题** — 部分事件（如 heatwave）的选项被解析出了其他事件的选项，说明原始代码中事件分隔不够清晰。
3. **STORY_EVENTS 的恐怖事件选项几乎全是负面/负面** — 无论怎么选都会损失属性，符合恐怖氛围设计。
4. **大量事件不是一好一坏模式** — 约 90% 的双选项事件不符合简单的一好一坏结构。
