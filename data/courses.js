const COURSES = [
  { title: '第1课：自我概念 - 你是谁就会吸引什么', summary: '显化的核心不是改变外面，而是改变你对自己的看法。',
    content: `
      <h4 class="font-title text-base mb-3" style="color:var(--theme-text)">什么是自我概念？</h4>
      <p class="text-sm mb-3" style="color:var(--theme-text); opacity:0.8">自我概念就是你对自己的定义和信念。你觉得自己是个什么样的人？你值得被爱吗？你能赚到钱吗？</p>
      <h4 class="font-title text-sm mb-2" style="color:var(--theme-text)">为什么自我概念是显化的核心？</h4>
      <p class="text-sm mb-3" style="color:var(--theme-text); opacity:0.8">因为你永远无法得到超出你"自我概念"的东西。如果你内心觉得"我不配"，就算好东西来了，你也会潜意识地把它推开。</p>
      <h4 class="font-title text-sm mb-2" style="color:var(--theme-text)">怎么做？</h4>
      <ol class="text-sm space-y-2 list-decimal list-inside mb-3" style="color:var(--theme-text); opacity:0.8">
        <li>觉察：你对自己有哪些负面信念？写下来</li>
        <li>替换：把每一个负面信念，改成正面肯定语</li>
        <li>重复：每天念、每天听，直到你相信为止</li>
        <li>验证：从小事开始找证据，证明新的自我概念是真的</li>
      </ol>
      <div class="p-3 rounded-xl" style="background:rgba(240,213,224,0.15)">
        <div class="text-xs font-medium mb-1" style="color:#B8859C">💡 本课小练习</div>
        <p class="text-xs" style="color:var(--theme-text); opacity:0.75">写下10条"我是..."的正面肯定语，每天早晚各念一遍。</p>
      </div>
    ` },
  { title: '第2课：活在终点 - 感觉就是秘密', summary: '活在愿望已经实现的状态里。',
    content: `
      <h4 class="font-title text-base mb-3" style="color:var(--theme-text)">什么是"活在终点"？</h4>
      <p class="text-sm mb-3" style="color:var(--theme-text); opacity:0.8">不是"我想要"，而是"我已经有了"。不是"等我得到了就会开心"，而是"现在就以已经得到的状态去生活"。</p>
      <h4 class="font-title text-sm mb-2" style="color:var(--theme-text)">为什么感觉这么重要？</h4>
      <p class="text-sm mb-3" style="color:var(--theme-text); opacity:0.8">潜意识听不懂语言，只听得懂感觉。你有什么样的感觉，就会吸引什么样的现实。</p>
      <h4 class="font-title text-sm mb-2" style="color:var(--theme-text)">怎么做？</h4>
      <ol class="text-sm space-y-2 list-decimal list-inside mb-3" style="color:var(--theme-text); opacity:0.8">
        <li>清晰化：你的愿望实现后，具体是什么样子？</li>
        <li>多感官：看到什么？听到什么？摸到什么？心里什么感觉？</li>
        <li>找一个"终点小动作"：愿望实现后你会做的一个小动作</li>
        <li>每天睡前/醒后，视觉化这个场景，感受那种感觉</li>
      </ol>
    ` },
  { title: '第3课：精神节食 - 小心你的每一个念头', summary: '你的注意力在哪里，能量就流向哪里。',
    content: `
      <h4 class="font-title text-base mb-3" style="color:var(--theme-text)">什么是精神节食？</h4>
      <p class="text-sm mb-3" style="color:var(--theme-text); opacity:0.8">就像身体需要健康的食物一样，你的精神也需要健康的"念头食物"。</p>
      <h4 class="font-title text-sm mb-2" style="color:var(--theme-text)">怎么做精神节食？</h4>
      <ol class="text-sm space-y-2 list-decimal list-inside mb-3" style="color:var(--theme-text); opacity:0.8">
        <li>觉察：注意到自己在想负面的事情</li>
        <li>叫停：对自己说"停，我不继续想这个了"</li>
        <li>替换：立刻换成一个正面的想法或画面</li>
        <li>坚持：21天养成新的思维习惯</li>
      </ol>
    ` },
  { title: '第4课：SATS - 睡眠状态下的显化', summary: '睡前半梦半醒时，是进入潜意识的黄金窗口。',
    content: `
      <h4 class="font-title text-base mb-3" style="color:var(--theme-text)">什么是SATS？</h4>
      <p class="text-sm mb-3" style="color:var(--theme-text); opacity:0.8">SATS = State Akin To Sleep，类似睡眠的状态。</p>
      <h4 class="font-title text-sm mb-2" style="color:var(--theme-text)">怎么做SATS？</h4>
      <ol class="text-sm space-y-2 list-decimal list-inside mb-3" style="color:var(--theme-text); opacity:0.8">
        <li>躺下来，让身体完全放松</li>
        <li>从脚趾到头顶，逐部位放松身体</li>
        <li>当你感觉快要睡着时，开始视觉化你的愿望</li>
        <li>重复一个简短的场景或动作，直到你睡着</li>
      </ol>
    ` },
  { title: '第5课：修正法 - 改写过去的记忆', summary: '过去不决定未来，你对过去的看法才影响现在。',
    content: `
      <h4 class="font-title text-base mb-3" style="color:var(--theme-text)">什么是修正法？</h4>
      <p class="text-sm mb-3" style="color:var(--theme-text); opacity:0.8">在想象中改写一件让你受伤的往事，给它一个美好的结局。</p>
      <h4 class="font-title text-sm mb-2" style="color:var(--theme-text)">怎么做修正法？</h4>
      <ol class="text-sm space-y-2 list-decimal list-inside mb-3" style="color:var(--theme-text); opacity:0.8">
        <li>选一件让你受伤/遗憾的往事</li>
        <li>在冥想中回到那个场景</li>
        <li>把结局改成你想要的样子，越细节越好</li>
        <li>感受那个美好结局带来的轻松和释然</li>
      </ol>
    ` },
  { title: '第6课：行动 - 灵感行动不是硬逼自己', summary: '行动不是努力，是状态对齐后的自然流动。',
    content: `
      <h4 class="font-title text-base mb-3" style="color:var(--theme-text)">显化需要行动吗？</h4>
      <p class="text-sm mb-3" style="color:var(--theme-text); opacity:0.8">需要，但不是"我必须努力才能得到"的那种行动。而是当你状态对齐后，灵感自然来敲门，你顺着灵感去做的行动。</p>
      <h4 class="font-title text-sm mb-2" style="color:var(--theme-text)">怎么跟随灵感行动？</h4>
      <ol class="text-sm space-y-2 list-decimal list-inside mb-3" style="color:var(--theme-text); opacity:0.8">
        <li>先调频：把自己调整到愿望已经实现的感觉</li>
        <li>等灵感：注意那些"突然想做"的冲动</li>
        <li>立刻做：灵感来了就立刻行动，不要等</li>
        <li>享受做：享受做的过程，不执着结果</li>
      </ol>
    ` },
  { title: '第7课：复盘 - 显化是可以练习的技能', summary: '每一次显化都是在积累"我能行"的证据。',
    content: `
      <h4 class="font-title text-base mb-3" style="color:var(--theme-text)">为什么要复盘？</h4>
      <p class="text-sm mb-3" style="color:var(--theme-text); opacity:0.8">很多人说"显化不准"，是因为他们只记得没成的，忘了成的。复盘能帮你积累"我总能星愿成真"的信念。</p>
      <h4 class="font-title text-sm mb-2" style="color:var(--theme-text)">复盘什么？</h4>
      <ol class="text-sm space-y-2 list-decimal list-inside mb-3" style="color:var(--theme-text); opacity:0.8">
        <li>大小显化都记录：哪怕是"想喝奶茶就有人请"这种小事</li>
        <li>记录你当时的状态：你是怎么想的？什么感觉？</li>
        <li>总结规律：什么样的状态下，你显化得最快？</li>
        <li>调整方法：找到最适合你的星愿节奏</li>
      </ol>
    ` },
];
