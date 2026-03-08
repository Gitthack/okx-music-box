const puppeteer = require('puppeteer');

(async () => {
    console.log('🎵 启动 DeFi Music Box 音频测试...\n');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // 监听控制台日志
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('🎵') || text.includes('✅') || text.includes('❌') || text.includes('🔊')) {
            console.log('页面日志:', text);
        }
    });
    
    // 导航到页面
    await page.goto('http://localhost:8080/public/index.html', { waitUntil: 'networkidle2' });
    console.log('✅ 页面加载完成\n');
    
    // 等待 Tone.js 加载
    await page.waitForFunction(() => typeof Tone !== 'undefined', { timeout: 10000 });
    console.log('✅ Tone.js 已加载\n');
    
    // 点击播放按钮
    console.log('🎵 点击播放按钮...');
    await page.click('#playBtn');
    
    // 等待音频初始化
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 检查音频状态
    const audioStatus = await page.$eval('#audioStatus', el => el.textContent);
    const nowPlaying = await page.$eval('#nowPlaying', el => el.textContent);
    
    console.log('\n📊 测试结果:');
    console.log('音频状态:', audioStatus);
    console.log('播放状态:', nowPlaying);
    
    // 获取 Tone.js 上下文状态
    const contextState = await page.evaluate(() => {
        return Tone.context ? Tone.context.state : 'unavailable';
    });
    console.log('音频上下文状态:', contextState);
    
    // 检查 synth 是否创建
    const synthCreated = await page.evaluate(() => {
        return typeof synth !== 'undefined' && synth !== null;
    });
    console.log('Synth 已创建:', synthCreated ? '✅ 是' : '❌ 否');
    
    // 等待一段时间让音乐播放
    console.log('\n🎵 等待音乐播放 3 秒...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 点击停止
    await page.click('#stopBtn');
    console.log('⏹ 已停止播放\n');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 最终状态
    const finalStatus = await page.$eval('#nowPlaying', el => el.textContent);
    console.log('最终状态:', finalStatus);
    
    await browser.close();
    
    console.log('\n✅ 测试完成！');
    if (audioStatus.includes('就绪') || audioStatus.includes('🔊')) {
        console.log('🎉 音频初始化成功！');
        process.exit(0);
    } else {
        console.log('⚠️ 音频可能未正确初始化');
        process.exit(1);
    }
})().catch(err => {
    console.error('❌ 测试失败:', err);
    process.exit(1);
});
