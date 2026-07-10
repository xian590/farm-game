/**
 * 宠物医生模拟器 v0.3 — 问题反馈与日志系统
 * 记录游戏事件、捕获错误、提供用户反馈渠道
 */

const FeedbackSystem = {
    // ==================== 事件日志 ====================
    
    /** 日志条目 */
    _logs: [],
    _maxLogs: 200,
    
    /** 记录事件 */
    log(event, data = null) {
        const entry = {
            time: new Date().toISOString(),
            day: Core.getState()?.day || 0,
            event: event,
            data: data,
        };
        this._logs.push(entry);
        if (this._logs.length > this._maxLogs) {
            this._logs.shift();
        }
        // 同时输出到控制台
        console.log(`[GameLog Day${entry.day}] ${event}`, data || '');
    },
    
    /** 获取最近日志 */
    getRecent(count = 50) {
        return this._logs.slice(-count);
    },
    
    /** 格式化日志为文本 */
    formatLogs(count = 30) {
        const logs = this.getRecent(count);
        if (logs.length === 0) return '📋 暂无日志记录';
        
        let text = '📋 最近游戏日志\n\n';
        logs.forEach(entry => {
            const time = entry.time.split('T')[1].split('.')[0];
            text += `[${time}] ${entry.event}\n`;
        });
        return text;
    },
    
    /** 清空日志 */
    clear() {
        this._logs = [];
    },
    
    // ==================== 错误捕获 ====================
    
    /** 初始化全局错误捕获 */
    initErrorHandler() {
        window.onerror = (msg, url, line, col, err) => {
            this.log('ERROR', { msg, url: url?.split('/').pop(), line, col, stack: err?.stack });
            this._showErrorToast(msg);
            return false;
        };
        
        window.addEventListener('unhandledrejection', (e) => {
            this.log('UNHANDLED_REJECTION', { reason: e.reason?.toString() });
            this._showErrorToast('发生了一个未处理的错误');
        });
    },
    
    /** 包装函数：安全执行 */
    safe(fn, context = '') {
        return (...args) => {
            try {
                return fn.apply(this, args);
            } catch (e) {
                this.log('EXCEPTION', { context, error: e.message, stack: e.stack });
                this._showErrorToast(`${context} 出错: ${e.message}`);
                console.error(`[${context}]`, e);
            }
        };
    },
    
    /** 显示错误提示（不阻断游戏） */
    _showErrorToast(msg) {
        const container = document.getElementById('game-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: absolute; bottom: 120px; left: 50%; transform: translateX(-50%);
            background: rgba(239, 68, 68, 0.9); color: #fff;
            padding: 10px 20px; border-radius: 12px; font-size: 13px;
            z-index: 50; pointer-events: none; max-width: 400px; text-align: center;
            animation: toastSlide 0.3s ease;
        `;
        toast.textContent = '⚠️ ' + msg;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },
    
    // ==================== 用户反馈 ====================
    
    /** 生成反馈报告 */
    generateReport() {
        const state = Core.getState();
        const logs = this.getRecent(50);
        
        return {
            version: CONSTANTS.VERSION_STRING,
            day: state.day,
            gold: state.gold,
            reputation: state.reputation,
            pressure: state.pressure,
            totalCured: state.totalCured,
            totalFailed: state.totalFailed,
            browser: navigator.userAgent,
            logs: logs,
            timestamp: new Date().toISOString(),
        };
    },
    
    /** 显示反馈面板 */
    showFeedbackPanel() {
        const report = this.generateReport();
        const logPreview = this.formatLogs(20);
        
        UI.updateDialogue({
            name: '🐛 问题反馈',
            mood: '帮助',
            avatar: 'item_clipboard.png',
            text: `遇到问题？请描述发生了什么，我们会帮你解决。\n\n当前：Day ${report.day} | ¥${report.gold} | ${report.reputation.toFixed(1)}⭐\n\n${logPreview}`,
            choices: [
                { text: '📋 复制诊断信息', action: () => this._copyDiagnostic(report) },
                { text: '🗑️ 清空日志', action: () => { this.clear(); UI.updateStatusBar(); } },
                { text: '🔍 继续游戏', action: () => Game.nextPatient() },
            ]
        });
    },
    
    /** 复制诊断信息到剪贴板 */
    _copyDiagnostic(report) {
        const text = JSON.stringify(report, null, 2);
        navigator.clipboard.writeText(text).then(() => {
            this._showSuccessToast('诊断信息已复制到剪贴板');
        }).catch(() => {
            console.log('[Feedback] 诊断信息:', report);
            this._showSuccessToast('诊断信息已输出到控制台(F12)');
        });
    },
    
    /** 显示成功提示 */
    _showSuccessToast(msg) {
        const container = document.getElementById('game-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: absolute; bottom: 120px; left: 50%; transform: translateX(-50%);
            background: rgba(34, 197, 94, 0.9); color: #fff;
            padding: 10px 20px; border-radius: 12px; font-size: 13px;
            z-index: 50; pointer-events: none;
            animation: toastSlide 0.3s ease;
        `;
        toast.textContent = '✅ ' + msg;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => toast.remove(), 500);
        }, 2000);
    },
    
    // ==================== 快捷日志方法 ====================
    
    logPatientArrived(patient) {
        this.log('病人到达', { name: patient.name, owner: patient.owner, diagnosis: patient.diagnosis });
    },
    
    logTreatment(success, fee, score) {
        this.log(success ? '治疗成功' : '治疗失败', { fee, score });
    },
    
    logDayEnd(day, cured, failed, profit) {
        this.log('一天结束', { day, cured, failed, profit });
    },
    
    logAchievement(ach) {
        this.log('成就解锁', { id: ach.id, name: ach.name });
    },
    
    logBuffGenerated(buffs) {
        const names = buffs.map(b => b.name).join(', ');
        this.log('今日Buff', { buffs: names });
    },
    
    logBondUpgrade(npcId, level) {
        this.log('羁绊升级', { npc: npcId, level });
    },
};

// Toast动画CSS
const toastStyle = document.createElement('style');
toastStyle.textContent = `
@keyframes toastSlide {
    from { transform: translateX(-50%) translateY(20px); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
}
`;
document.head.appendChild(toastStyle);
