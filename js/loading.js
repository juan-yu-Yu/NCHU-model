
const grid = document.getElementById('grid');

// 建立圓點
for (let i = 0; i < 13 * 13; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    grid.appendChild(dot);
}

// 漣漪動畫持續執行
anime({
    targets: '.dot',
    keyframes: [
        { scale: 1.0 },
        { scale: 2.0 },
        { scale: 1.0 },
    ],
    easing: 'easeInOutQuad',
    delay: anime.stagger(100, { grid: [13, 13], from: 'center' }),
    duration: 1200,
    loop: true,
});

// 旋轉動畫持續執行
let angle = 0;
function startRotateGrid() {
    angle += 90;
    anime({
        targets: '#grid',
        rotate: angle,
        easing: 'easeInOutQuad',
        duration: 800,
        complete: function () {
            setTimeout(startRotateGrid, 500);
        }
    });
}
startRotateGrid();

// 模擬 loading 進度條
// let progress = 0;
// const progressEl = document.getElementById('progress');
// const loadingText = document.getElementById('loading-text');
// const loadingScreen = document.querySelector('.loading-screen');
// const mainContent = document.querySelector('.main-content');

// const loadingInterval = setInterval(() => {
//     progress += 2;
//     if (progress > 100) progress = 100;
//     progressEl.style.width = progress + '%';
//     loadingText.textContent = `Loading... ${progress}%`;

//     if (progress >= 100) {
//         clearInterval(loadingInterval);

//         // 顯示完成訊息
//         loadingText.textContent = 'Loading Complete!';

//         // 1 秒後觸發淡出
//         setTimeout(() => {
//             loadingScreen.classList.add('hidden');

//             // 等淡出動畫結束後（對應 transition 600ms）再隱藏並顯示主內容
//             setTimeout(() => {
//                 loadingScreen.style.display = 'none';
//                 mainContent.style.display = 'block';
//             }, 600); // 對應 CSS transition: 0.6s
//         }, 1000); // 顯示 Loading Complete! 的停留時間
//     }
// }, 100);

