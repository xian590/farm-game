import requests, json, time, sys

BASE = "http://127.0.0.1:10086/command"

def call(action, args=None, session="farm-game"):
    payload = {"action": action, "args": args or {}, "session": session}
    try:
        r = requests.post(BASE, json=payload, timeout=15)
        return r.json()
    except Exception as e:
        return {"_error": str(e)}

# 1. Navigate
print("[1] Navigating...")
nav = call("navigate", {"url": "http://localhost:8082/farm_game.html", "newTab": True, "group_title": "农场游戏测试"})
print(json.dumps(nav, ensure_ascii=False))

# 2. Wait a bit for page load
time.sleep(3)

# 3. Simple heartbeat
print("[2] Heartbeat...")
hb = call("evaluate", {"code": "document.title"})
print(json.dumps(hb, ensure_ascii=False))

# 4. Read localStorage save
print("[3] Reading save...")
code = """
(() => {
    const s = localStorage.getItem('farm_game_save_v1');
    if (!s) return {error: 'no_save'};
    try {
        const d = JSON.parse(s);
        return {
            day: d.day,
            season: d.season,
            time: d.time,
            money: d.money,
            stamina: d.stamina,
            health: d.health,
            fieldsCount: (d.farmPlots || []).length,
            eventsToday: d.eventsToday || 0,
            eventHistoryCount: (d.eventHistory || []).length,
            dailyActions: d.dailyActions || {},
            npcs: d.npcFavor || {},
            skills: d.skills || {},
            seeds: d.seeds || {},
            buildings: d.buildings || {},
            house: d.house,
            weather: d.weather,
            reputation: d.reputation,
            mood: d.mood,
            researchPoints: d.researchPoints,
            daysPlayed: d.daysPlayed || 0,
            stats: d.stats || {},
            speed: d.speed,
            autoPlay: d.autoPlay,
            mode: d.mode,
            disasterRate: d.disasterRate,
            lastSave: d.lastSaveTimestamp
        };
    } catch (e) {
        return {error: e.message};
    }
})()
"""
result = call("evaluate", {"code": code})
print(json.dumps(result, ensure_ascii=False))

# 5. Try to read UI state via snapshot
print("[4] Snapshot...")
snap = call("snapshot")
print(json.dumps(snap, ensure_ascii=False)[:2000])

