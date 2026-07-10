/**
 * 宠物医生模拟器 v0.3 — 工具函数
 * 可复用的纯函数，不依赖游戏状态
 */

const Utils = {
    // ==================== 随机数工具 ====================
    
    /** 范围随机整数 [min, max] */
    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /** 范围随机浮点数 [min, max) */
    randFloat(min, max) {
        return Math.random() * (max - min) + min;
    },

    /** 从数组中随机选一个 */
    pick(arr) {
        if (!arr || arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
    },

    /** 从数组中随机选n个（不重复） */
    pickMany(arr, n) {
        if (!arr || arr.length === 0) return [];
        const shuffled = [...arr].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(n, shuffled.length));
    },

    /** 按权重随机选择 */
    weightedPick(items) {
        // items: [{ item, weight }, ...]
        const total = items.reduce((sum, i) => sum + (i.weight || 1), 0);
        let r = Math.random() * total;
        for (const item of items) {
            r -= (item.weight || 1);
            if (r <= 0) return item;
        }
        return items[items.length - 1];
    },

    /** 打乱数组 */
    shuffle(arr) {
        const result = [...arr];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    },

    // ==================== 数学工具 ====================
    
    /** 限制值在 [min, max] 范围内 */
    clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    },

    /** 线性插值 */
    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    /** 两点距离 */
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },

    // ==================== 字符串工具 ====================
    
    /** 格式化金币显示 */
    formatGold(n) {
        if (n >= 10000) return (n / 10000).toFixed(1) + '万';
        return n.toString();
    },

    /** 格式化数字（补零） */
    pad(num, len = 2) {
        return num.toString().padStart(len, '0');
    },

    // ==================== 时间工具 ====================
    
    /** 格式化游戏时间 HH:MM */
    formatGameTime(hour, minute) {
        return `${this.pad(hour)}:${this.pad(minute)}`;
    },

    /** 防抖函数 */
    debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    /** 节流函数 */
    throttle(fn, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // ==================== 动画工具 ====================
    
    /** 简单的ease-out插值 */
    easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
    },

    /** 简单的ease-in-out插值 */
    easeInOut(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },

    // ==================== 数组工具 ====================
    
    /** 数组去重 */
    unique(arr, key) {
        if (key) {
            const seen = new Set();
            return arr.filter(item => {
                const val = item[key];
                if (seen.has(val)) return false;
                seen.add(val);
                return true;
            });
        }
        return [...new Set(arr)];
    },

    /** 按属性分组 */
    groupBy(arr, key) {
        return arr.reduce((groups, item) => {
            const val = item[key];
            groups[val] = groups[val] || [];
            groups[val].push(item);
            return groups;
        }, {});
    },
};
