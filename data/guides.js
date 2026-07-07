const GUIDES = [
  { title: 'SP恋爱显化', icon: '💖', color: 'pink',
    summary: '吸引特定的人，或者修复一段关系',
    content: `
      <h4 class="font-title text-base mb-3" style="color:var(--theme-text)">核心原理</h4>
      <p class="text-sm mb-3" style="color:var(--theme-text); opacity:0.8">你生命中的每一个人，都是你的投射。改变你对他/她的看法，他/她就会改变。</p>
      <h4 class="font-title text-sm mb-2" style="color:var(--theme-text)">具体步骤</h4>
      <ol class="text-sm space-y-2 list-decimal list-inside mb-3" style="color:var(--theme-text); opacity:0.8">
        <li><b>修正自我概念</b>：你觉得自己值得被爱吗？</li>
        <li><b>修正对他/她的看法</b>：把他/她定义成你想要的样子</li>
        <li><b>SATS视觉化</b>：每天睡前视觉化你们在一起的场景</li>
        <li><b>精神节食</b>：不要反复想"他为什么不找我"</li>
        <li><b>活在终点</b>：以"已经在一起"的状态生活</li>
      </ol>
    ` },
  { title: '财富事业显化', icon: '💰', color: 'amber',
    summary: '吸引更多金钱，提升事业运',
    content: `
      <h4 class="font-title text-base mb-3" style="color:var(--theme-text)">核心原理</h4>
      <p class="text-sm mb-3" style="color:var(--theme-text); opacity:0.8">金钱是能量，它会流向感觉自己值得拥有财富的人。</p>
      <h4 class="font-title text-sm mb-2" style="color:var(--theme-text)">具体步骤</h4>
      <ol class="text-sm space-y-2 list-decimal list-inside mb-3" style="color:var(--theme-text); opacity:0.8">
        <li><b>清理金钱卡点</b>：找出你对金钱的负面信念</li>
        <li><b>建立新的金钱观</b>：钱是好的，钱是轻松的，钱爱我</li>
        <li><b>感恩练习</b>：对每一笔花出去和进来的钱说谢谢</li>
        <li><b>活在终点</b>：想象你已经财富自由的生活</li>
        <li><b>跟随灵感行动</b>：赚钱的灵感来了就去做</li>
      </ol>
    ` },
  { title: '美貌自信显化', icon: '✨', color: 'rose',
    summary: '变美、提升自信、改善自我形象',
    content: `
      <h4 class="font-title text-base mb-3" style="color:var(--theme-text)">核心原理</h4>
      <p class="text-sm mb-3" style="color:var(--theme-text); opacity:0.8">你的身体是你意识的投射。你怎么看待自己，你的长相和气质就会怎么变化。</p>
      <h4 class="font-title text-sm mb-2" style="color:var(--theme-text)">具体步骤</h4>
      <ol class="text-sm space-y-2 list-decimal list-inside mb-3" style="color:var(--theme-text); opacity:0.8">
        <li><b>停止自我攻击</b>：再也不许说自己丑</li>
        <li><b>镜子练习</b>：每天对着镜子说"我爱你，你真美"</li>
        <li><b>视觉化</b>：想象你最美的样子</li>
        <li><b>肯定语</b>：每天听美貌相关的肯定语</li>
        <li><b>爱自己的行动</b>：认真护肤、好好吃饭、运动</li>
      </ol>
    ` },
  { title: '原生家庭疗愈', icon: '🏠', color: 'purple',
    summary: '疗愈童年创伤，和父母和解',
    content: `
      <h4 class="font-title text-base mb-3" style="color:var(--theme-text)">核心原理</h4>
      <p class="text-sm mb-3" style="color:var(--theme-text); opacity:0.8">原生家庭的模式会无意识地重复在你现在的生活里。看见它、疗愈它，你才能真正自由。</p>
      <h4 class="font-title text-sm mb-2" style="color:var(--theme-text)">具体方法</h4>
      <ol class="text-sm space-y-2 list-decimal list-inside mb-3" style="color:var(--theme-text); opacity:0.8">
        <li><b>看见模式</b>：你从父母身上继承了哪些模式？</li>
        <li><b>修正法</b>：在想象中改写童年的负面记忆</li>
        <li><b>内在小孩疗愈</b>：回去抱抱小时候的自己</li>
        <li><b>与父母和解</b>：不是原谅他们，是放过自己</li>
        <li><b>重新养育自己</b>：做自己的好父母</li>
      </ol>
    ` },
  { title: '考试学习显化', icon: '📚', color: 'blue',
    summary: '考试上岸、提升学习效率',
    content: `
      <h4 class="font-title text-base mb-3" style="color:var(--theme-text)">核心原理</h4>
      <p class="text-sm mb-3" style="color:var(--theme-text); opacity:0.8">你的大脑比你想象的强大得多。相信自己能考上，你的大脑就会帮你找到方法。</p>
      <h4 class="font-title text-sm mb-2" style="color:var(--theme-text)">具体步骤</h4>
      <ol class="text-sm space-y-2 list-decimal list-inside mb-3" style="color:var(--theme-text); opacity:0.8">
        <li><b>明确目标</b>：具体的学校/分数</li>
        <li><b>视觉化</b>：看到自己拿到录取通知书的场景</li>
        <li><b>信念建设</b>：我很聪明，我学什么都很快</li>
        <li><b>灵感学习</b>：想学的时候高效学，不想学的时候好好休息</li>
        <li><b>相信直觉</b>：考试时相信第一感觉</li>
      </ol>
    ` },
  { title: '人际和谐显化', icon: '👭', color: 'green',
    summary: '改善人际关系、吸引同频朋友',
    content: `
      <h4 class="font-title text-base mb-3" style="color:var(--theme-text)">核心原理</h4>
      <p class="text-sm mb-3" style="color:var(--theme-text); opacity:0.8">你身边的人都是你的镜子。你改变了，你身边的人自然会改变。</p>
      <h4 class="font-title text-sm mb-2" style="color:var(--theme-text)">具体方法</h4>
      <ol class="text-sm space-y-2 list-decimal list-inside mb-3" style="color:var(--theme-text); opacity:0.8">
        <li><b>修正自我概念</b>：我值得被好好对待</li>
        <li><b>修正对他人的看法</b>：把每个人都定义成友善的</li>
        <li><b>边界感</b>：温柔而坚定地设立边界</li>
        <li><b>筛选圈子</b>：不滋养你的关系，慢慢淡出</li>
        <li><b>做自己</b>：你越真实，同频的人越容易找到你</li>
      </ol>
    ` },
];
