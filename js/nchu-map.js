import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Loading 畫面元素
const loadingScreen = document.querySelector('.loading-screen');
const mainContent = document.querySelector('.main-content');
const progressBar = document.querySelector('#progress');
const loadingText = document.querySelector('#loading-text');

// Tooltip 元素
const tooltip = document.getElementById('tooltip');
let lastHoveredName = '';

// Info Card 元素
const infoCard = document.getElementById('info-card');
const infoTitle = document.getElementById('info-title');
const infoDescription = document.getElementById('info-description');

const buildingInfo = {
    "創新育成中心": "創新育成中心提供新創團隊輔導、資源連結與空間支持，為創新創業發展的重要基地。該中心於2008年11月3日揭牌啟用，是中興大學與中部科學園區合作的重要成果，旨在推動產學合作與研發創業。",
    "化學館": "國立中興大學化學系自成立以來，發展成為台灣地區一流的化學教育與研究重鎮。該系所致力於培養具備專業知識、實驗技能、問題解決能力與溝通表達能力的化學人才。",
    "土木環工大樓": "土木環工大樓是土木工程學系與環境工程學系的共同大樓，涵蓋結構、水利、大地、環境等領域的教學與實驗設施。該大樓於1991年竣工，為地上七層、地下一層的鋼筋混凝土建築。原供工學院院辦、土木系及環工系使用，後工學院院辦於2000年遷出。",
    "應經一館": "應經一館是應用經濟學系的教學與研究大樓，主要用於課程講授、研討會與學術研究。現存的應經一館於1970年落成，為鋼筋混凝土構造，含地下一層及地上三層，原主要供農學院、農經系及實驗林管理處使用，現已改為應用經濟學系使用。其前身為1949年完工的農業經濟系研究室，是臺灣光復後第一棟系館建物。",
    "機械二館": "機械二館是機械工程學系的教學與實驗空間，設有機械設計、製造、熱流等相關實驗室。中興大學機械工程學系創立於1964年。機械二館的興建與系所發展及空間需求增加有關，具體興建年代資訊較少。",
    "機械工廠": "機械工廠提供機械實作、加工與製造的實習場域，是學生動手操作與技能學習的重要場所。作為機械工程學系的重要實作場域，其功能隨著系所發展不斷演進。2013年與程泰集團合作，促成智慧機械技術大樓的興建，該大樓已於2023年7月19日落成啟用，預計將取代部分原有工廠功能。",
    "機械系館": "機械系館是機械工程學系的主要系館，包含教師研究室、教室、會議室等，是系所行政與學術活動的中心。中興大學機械工程學系創立於1964年，機械系館是系所成立後逐步發展並完善的行政與學術中心。",
    "混凝土中心": "混凝土中心專注於混凝土材料研究與試驗，提供相關測試與技術服務。作為專門進行混凝土材料研究與試驗的中心，其設置應與土木工程學系的發展需求密切相關，具體興建歷史資訊較少。",
    "理學大樓": "理學大樓是理學院多個學系的共同大樓，包含物理、數學等基礎科學領域的教學與研究空間。該大樓於1995年5月完工，總樓層含地下一層、地上十層。1999年與資訊科學大樓、化學館間增設天橋，形成連接。",
    "生機大樓": "生機大樓是生物產業機電工程學系的系館，專注於生物科技與機械電子整合領域的教學與研究。其前身為農機館，於1993年4月13日落成，為地下1層、地上7層鋼筋混凝土建築。2002年，農業機械工程學系更名為「生物產業機電工程學系」後，農機館也隨之易名為生機大樓。",
    "舊遺傳中心": "舊遺傳中心原為遺傳學相關研究單位，目前可能已轉為其他用途或提供多功能空間。遺傳工程中心於1984年成立時，原暫居於理工大樓。1985年8月遷入重新整修後的舊畜牧館，並於1986年1月正式啟用。1997年4月，遺傳中心遷入新建的生命科學大樓，原址便成為「舊遺傳中心」。",
    "資訊科學大樓": "資訊科學大樓是資訊科學與工程學系的教學與研究中心，設有電腦教室、研究室及伺服器機房等設施。該大樓於1989年6月建造完成，總樓層含地下一層、地上七層。地下一樓供計算機中心使用，二樓到七樓屬應用數學系館。地下一樓設有「致平廳」，以紀念中興大學改制大學後首任校長林致平院士。"
}


// loading進度條跟loading Manager
const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progress = Math.round((itemsLoaded / itemsTotal) * 100);
    progressBar.style.width = `${progress}%`;
    loadingText.textContent = `Loading... ${progress}%`;
};
loadingManager.onLoad = () => {
    loadingText.textContent = 'Loading Complete!';
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            mainContent.style.display = 'block';
        }, 600);
    }, 1000);
};

let scene, camera, renderer, controls;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let INTERSECTED_BUILDING = null;
let clickLock = false;

const modelGroupSet = new Set();
const allInteractiveMeshes = [];

let initialCameraPosition;
let initialTarget;

function init() {
    // 建立場景與背景色
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e2c4d);

    // 建立相機（視角45度，近平面0.1，遠平面1000）
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 20);

    // 建立渲染器並加入DOM
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.querySelector('.main').appendChild(renderer.domElement);

    // 控制器：滑鼠旋轉、縮放場景
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 5, 0);            // 旋轉中心設定於Y=5的高度
    controls.enableDamping = true;           // 啟用阻尼效果
    controls.dampingFactor = 0.05;
    controls.update();

    // **在此初始化初始相機位置與控制器目標**
    initialCameraPosition = camera.position.clone();
    initialTarget = controls.target.clone();

    // 環境光與方向光，讓模型可見且有陰影感
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // 載入GLTF模型，並用 LoadingManager 監控進度
    const loader = new GLTFLoader(loadingManager);
    loader.load('./models/NCHU-C.glb', (gltf) => {
        const root = gltf.scene;
        root.position.set(0, 4, 0);  // 模型位置調整（抬高）
        root.scale.set(2, 2, 2);     // 模型放大兩倍

        // 遍歷模型內所有子物件，找出符合「建築」命名的 Mesh 或 Group
        root.traverse((child) => {
            if (child.isMesh) {
                const meshName = child.name;
                const parentName = child.parent?.name ?? '';
                // 判斷是否為建築物：名稱含「館、大樓、中心、工廠」但不含「學院」
                const isBuilding = (name) => /館|大樓|中心|工廠/.test(name) && !/學院/.test(name);

                if (isBuilding(meshName) || isBuilding(parentName)) {
                    // 將整個Group(父物件)或Mesh加入互動集合，方便後續管理
                    if (isBuilding(parentName) && !modelGroupSet.has(child.parent)) {
                        modelGroupSet.add(child.parent);
                    } else if (isBuilding(meshName)) {
                        modelGroupSet.add(child);
                    }

                    // 加入射線偵測陣列
                    allInteractiveMeshes.push(child);

                    // 儲存原始材質顏色，方便還原
                    if (!child.material.originalColor) {
                        child.material.originalColor = child.material.color.clone();
                    }
                }
            }
        });

        console.log(`共找到 ${modelGroupSet.size} 個符合條件的互動建築`);
        scene.add(root);
    }, undefined, (error) => {
        console.error('模型載入失敗', error);
    });

    // 視窗尺寸改變時更新相機及渲染器設定
    window.addEventListener('resize', onWindowResize);

    // 監聽滑鼠移動，更新 pointer 位置與 tooltip 位置
    window.addEventListener('pointermove', onPointerMove);

    // 監聽滑鼠點擊，處理建築點擊聚焦與資訊顯示
    window.addEventListener('click', onMouseClick);
}

// 更新 pointer 滑鼠位置並同步 tooltip 位置
function onPointerMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // 加入邊界判斷
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    const padding = 10;

    let left = event.clientX + padding;
    let top = event.clientY + padding;

    // 避免超出右邊與下邊界
    if (left + tooltipWidth > window.innerWidth) {
        left = event.clientX - tooltipWidth - padding;
    }
    if (top + tooltipHeight > window.innerHeight) {
        top = event.clientY - tooltipHeight - padding;
    }

    // tooltip 跟著滑鼠微偏移顯示
    tooltip.style.left = event.clientX + 10 + 'px';
    tooltip.style.top = event.clientY + 10 + 'px';
}

// 旋轉控制及返回視角面板
let isAutoRotating = false;
let focusedBuilding = null;
let focusCenter = null;


// 取得按鈕元素
const toggleRotationBtn = document.getElementById('toggle-rotation');
const resetViewBtn = document.getElementById('reset-view');
const homeBtn = document.getElementById('homeBtn'); // 新增的 Home 按鈕

// 控制旋轉邏輯（已有）
toggleRotationBtn.addEventListener('click', () => {
    isAutoRotating = !isAutoRotating;
    controls.autoRotate = isAutoRotating;
    toggleRotationBtn.textContent = isAutoRotating ? '停止旋轉' : '啟動旋轉';
});

// 返回視角與重置狀態邏輯（已有）
function resetView() {
    isAutoRotating = false;
    controls.autoRotate = false;
    toggleRotationBtn.textContent = '啟動旋轉';

    camera.position.copy(initialCameraPosition);
    controls.target.copy(initialTarget);
    controls.update();

    modelGroupSet.forEach(obj => {
        obj.traverse(child => {
            if (child.isMesh && child.material) {
                child.material.opacity = 1;
            }
        });
    });

    infoCard.style.display = 'none';
    focusedBuilding = null;
    focusCenter = null;
}

// 綁定 reset-view 按鈕
resetViewBtn.addEventListener('click', resetView);

// 新增：home 按鈕也觸發相同功能
homeBtn.addEventListener('click', resetView);

// 滑鼠點擊事件，聚焦該建築並顯示資訊卡
function onMouseClick() {
    if (clickLock || !INTERSECTED_BUILDING) return;   // 防止重複點擊或沒有選擇物件

    clickLock = true;  // 鎖定點擊狀態，避免連點

    const parentObj = INTERSECTED_BUILDING;

    // 計算該物件包圍盒中心與尺寸
    const box = new THREE.Box3().setFromObject(parentObj);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // 根據最大尺寸計算相機距離，避免距離太近或太遠
    const maxDim = Math.max(size.x, size.y, size.z);
    const offset = maxDim * 1.5;

    // 記錄旋轉中心
    focusCenter = center.clone();

    // 調整相機位置並將控制器目標對準建築中心
    camera.position.set(center.x + offset, center.y + offset, center.z + offset);
    controls.target.copy(center);
    controls.update();

    // 啟用自動旋轉
    isAutoRotating = true;
    controls.autoRotate = true;
    toggleRotationBtn.textContent = '停止旋轉';

    // 其他建築半透明，聚焦建築保持不透明
    modelGroupSet.forEach(obj => {
        obj.traverse(child => {
            if (child.isMesh && child.material) {
                child.material.transparent = true;
                child.material.opacity = (obj === parentObj) ? 1 : 0.2;
            }
        });
    });

    // 更新資訊卡內容並顯示
    const name = parentObj.name;
    infoTitle.textContent = name || '未知建築';
    infoDescription.textContent = buildingInfo[name] || '沒有相關資訊';
    infoCard.style.display = 'block';

    // 延遲解除點擊鎖定，避免快速重複點擊
    setTimeout(() => { clickLock = false; }, 500);
}

// 根據一個Mesh尋找其所屬的互動父物件（Group或Mesh）
function findInteractiveParent(mesh) {
    for (const obj of modelGroupSet) {
        if (obj.isMesh && obj === mesh) return obj;          // 直接是Mesh本身
        if (!obj.isMesh && obj.getObjectById(mesh.id)) return obj;  // 父Group中包含此Mesh
    }
    return null;
}

// 射線偵測與滑鼠hover建築高亮及tooltip顯示
function highlightIntersected() {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(allInteractiveMeshes, false);

    if (intersects.length > 0) {
        const mesh = intersects[0].object;
        const parentObj = findInteractiveParent(mesh);

        // 當滑鼠移入不同建築，還原前一個的材質光澤，並設定新的高亮
        if (INTERSECTED_BUILDING !== parentObj) {
            if (INTERSECTED_BUILDING) {
                INTERSECTED_BUILDING.traverse(child => {
                    if (child.isMesh && child.material && child.material.originalEmissive !== undefined) {
                        // 還原發光顏色與強度
                        child.material.emissive.copy(child.material.originalEmissive);
                        child.material.emissiveIntensity = child.material.originalEmissiveIntensity ?? 0;
                    }
                });
            }

            if (parentObj) {
                parentObj.traverse(child => {
                    if (child.isMesh && child.material) {
                        // 儲存原始發光色與強度
                        if (!child.material.originalEmissive) {
                            child.material.originalEmissive = child.material.emissive.clone();
                            child.material.originalEmissiveIntensity = child.material.emissiveIntensity;
                        }
                        // 設置白色發光高亮
                        child.material.emissive = new THREE.Color(0xffffff);
                        child.material.emissiveIntensity = 0.5;
                    }
                });
            }

            INTERSECTED_BUILDING = parentObj;
        }

        // 更新tooltip文字
        const buildingName = parentObj?.name || mesh.name || '';
        if (buildingName !== lastHoveredName) {
            tooltip.textContent = buildingName;
            tooltip.style.display = 'block';
            lastHoveredName = buildingName;
        }
    } else {
        // 沒有交集，還原高亮並隱藏tooltip
        if (INTERSECTED_BUILDING) {
            INTERSECTED_BUILDING.traverse(child => {
                if (child.isMesh && child.material && child.material.originalEmissive !== undefined) {
                    child.material.emissive.copy(child.material.originalEmissive);
                    child.material.emissiveIntensity = child.material.originalEmissiveIntensity ?? 0;
                }
            });
            INTERSECTED_BUILDING = null;
        }

        tooltip.style.display = 'none';
        lastHoveredName = '';
    }
}

// 視窗大小改變時，更新相機投影矩陣與渲染器大小
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 每幀動畫循環：更新滑鼠射線偵測、控制器與渲染畫面
function animate() {
    requestAnimationFrame(animate);
    // 若開啟旋轉且有聚焦目標
    if (isAutoRotating && focusCenter) {
        controls.target.copy(focusCenter);
    }
    highlightIntersected();
    controls.update();
    renderer.render(scene, camera);
}


// =============================================================

const buildingNameMap = {
    'btn-chemistry': '化學館',
    'btn-info-science': '資訊科學大樓',
    'btn-science': '理學大樓',
    'btn-old-genetics': '舊遺傳中心',
    'btn-mechanical-factory': '機械工廠',
    'btn-innovation-incubator': '創新育成中心',
    'btn-mechanical-building': '機械系館',
    'btn-bio-mechanical-building': '生機大樓',
    'btn-mechanical-2nd-building': '機械二館',
    'btn-concrete-center': '混凝土中心',
    'btn-applied-economics-1': '應經一館',
    'btn-civil-environmental-building': '土木環工大樓'
};

function focusBuildingByName(name) {
    const building = [...modelGroupSet].find(obj => obj.name === name);

    if (!building) {
        console.warn('找不到建築物：', name);
        return;
    }

    const box = new THREE.Box3().setFromObject(building);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const offset = maxDim * 1.5;

    focusCenter = center.clone();

    camera.position.set(center.x + offset, center.y + offset, center.z + offset);
    controls.target.copy(center);
    controls.update();

    modelGroupSet.forEach(obj => {
        obj.traverse(child => {
            if (child.isMesh && child.material) {
                child.material.transparent = true;
                child.material.opacity = (obj === building) ? 1 : 0.2;
            }
        });
    });

    infoTitle.textContent = name || '未知建築';
    infoDescription.textContent = buildingInfo[name] || '沒有相關資訊';
    infoCard.style.display = 'block';

    isAutoRotating = true;
    controls.autoRotate = true;
    toggleRotationBtn.textContent = '停止旋轉';
}

Object.keys(buildingNameMap).forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.addEventListener('click', () => {
            const buildingName = buildingNameMap[btnId];
            focusBuildingByName(buildingName);
        });
    }
});



// =============================================================

init();
animate();