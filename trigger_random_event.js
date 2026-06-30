function triggerRandomEvent() {
    // 确保游戏已正式开始（不在模式选择或故事界面）
    const selectContainer = document.getElementById('select-container');
    const storyContainer = document.getElementById('story-container');
    if ((selectContainer && selectContainer.style.display !== 'none') ||
        (storyContainer && storyContainer.style.display !== 'none')) {
        return;
    }
    
    // 1. 先尝试触发故事事件
    const availableStoryEvents = STORY_EVENTS.filter(e => {
        // 天数检查
        if (e.minDay !== undefined && e.minDay !== null && game.day <= e.minDay) return false;
        if (e.maxDay !== undefined && e.maxDay !== null && game.day >= e.maxDay) return false;
        
        // 季节检查
        if (e.seasons && e.seasons.length > 0 && !e.seasons.includes(game.season)) return false;
        
        // NPC好感检查
        if (e.requiresNpc) {
            if (!game.npcs[e.requiresNpc.id] || game.npcs[e.requiresNpc.id].favor < e.requiresNpc.minFavor) return false;
        }
        
        // 相遇标记检查
        if (e.requiresMet && !game[e.requiresMet]) return false;
        if (e.requiresNotMet && game[e.requiresNotMet]) return false;
        
        // 作物检查
        if (e.requiresCrop && !hasGrowingCrops()) return false;
        
        // 宠物检查
        if (e.requiresPet) {
            if (e.requiresPet === 'both') {
                if (!game.pets || !game.pets.ahua || !game.pets.ahua.have || !game.pets.dahuang || !game.pets.dahuang.have) return false;
            } else if (!game.pets || !game.pets[e.requiresPet] || !game.pets[e.requiresPet].have) {
                return false;
            }
        }
        
        return true;
    });
    
    if (availableStoryEvents.length > 0) {
        // 按概率加权选择
        let totalWeight = 0;
        availableStoryEvents.forEach(e => {
            totalWeight += e.probability || 0;
        });
        
        if (totalWeight > 0 && Math.random() < totalWeight) {
            let random = Math.random() * totalWeight;
            for (const event of availableStoryEvents) {
                random -= event.probability || 0;
                if (random <= 0) {
                    showEventPopup(event);
                    return;
                }
            }
            // Fallback to last event
            showEventPopup(availableStoryEvents[availableStoryEvents.length - 1]);
            return;
        }
    }
    
    // 2. 如果没有故事事件触发，再尝试 EVENTS 对象中的系统事件（自然灾害等）
    if (!game || !gameLoopInterval) return;
    
    const hasCrops = hasGrowingCrops();
    
    // 需要作物才能触发的事件ID
    const cropRequiredEvents = [
        'drought', 'rainstorm', 'pest', 'heatwave', 'coldDew', 
        'continuousRain', 'hail', 'lateSpringCold',
        'timelyRain', 'morningDew',
        'theft', 'kidTrample'
    ];
    
    // 筛选当前季节可用、且满足前置条件的事件
    const availableEvents = Object.values(EVENTS).filter(e => {
        // 季节检查
        if (!e.seasons.includes(game.season)) return false;
        
        // 作物前置条件检查
        if (cropRequiredEvents.includes(e.id) && !hasCrops) return false;
        
        // 燕子归来：需要至少过了一年
        if (e.id === 'swallow' && game.day <= 240) return false;
        
        return true;
    });
    
    if (availableEvents.length === 0) return;
    
    // 按概率加权选择
    let totalWeight = 0;
    const petTheftReduction = getPetEffect('theftReduction');
    
    availableEvents.forEach(e => {
        let weight = e.probability;
        if (e.id === 'theft' && petTheftReduction > 0) {
            weight *= (1 - petTheftReduction);
        }
        totalWeight += weight;
    });
    
    let random = Math.random() * totalWeight;
    let selectedEvent = null;
    
    for (const event of availableEvents) {
        let weight = event.probability;
        if (event.id === 'theft' && petTheftReduction > 0) {
            weight *= (1 - petTheftReduction);
        }
        random -= weight;
        if (random <= 0) {
            selectedEvent = event;
            break;
        }
    }
    
    if (!selectedEvent) return;
    
    // 新手期保护
    if (game.day <= 3) {
        return;
    }
    if (game.day <= 5 && selectedEvent.type === 'human') {
        return;
    }
    if (game.day <= 10 && selectedEvent.type === 'disaster' && Math.random() > 0.3) {
        return;
    }
    
    // 触发事件
    game.currentEvent = selectedEvent.id;
    showEventModal(selectedEvent);
}
