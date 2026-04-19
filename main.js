window.onload = () => {
    if (typeof fflate !== 'undefined') window.fflate = fflate;

    // ============================================================
    //  🏷️  部屋データ定義
    //  ここを編集するだけで部屋の情報・座標・画像を変更
    //
    //  各フィールドの説明:
    //   name   : 表示名（常に3D空間上に表示されるラベル）
    //   floor  : 階数（1〜4）
    //   x,y,z  : Blenderの座標 × 1000 した値（下の SCALE で自動変換）
    //   color  : マーカーとラベルの色（CSS カラーコード）
    //   icon   : 絵文字アイコン
    //   image  : 詳細パネルの画像パス（例: './images/linkshall.jpg'）
    //            ← 画像を用意したらパスを差し替えて
    //   title  : 詳細パネルのタイトル（nameと別にしたい場合）
    //   detail : 詳細パネルの説明文
    //   tags   : タグ（配列）← 空でもOK
    // ============================================================
    const ROOMS = [
        // ── 1階 ──────────────────────────────────────────────
        {
            name:   'リンクスホール',
            floor:  1,
            x: -0.05,     y: 0.12,     z: 0.30,
            color:  '#f472b6',
            icon:   '🎪',
            image:  '',   // ← './images/linkshall.jpg' に差し替え
            title:  'リンクスホール',
            detail: '学校祭のメイン会場です。ステージ発表やライブパフォーマンスが行われます。',
            tags:   ['ステージ', 'ライブ', 'メイン会場'],
        },
        {
            name:   '保健室',
            floor:  1,
            x: -0.451787, y: 0.12,     z: 0.35,
            color:  '#fb923c',
            icon:   '💊',
            image:  '',   // ← './images/hokenshitsu.jpg'
            title:  '保健室',
            detail: '体調不良の方はこちらへ。常駐スタッフがいます。',
            tags:   ['医療', 'スタッフ常駐'],
        },
        {
            name:   '1階トイレ',
            floor:  1,
            x: -0.181432, y: 0.118646, z: 0.003709,
            color:  '#38bdf8',
            icon:   '🚻',
            image:  '',
            title:  '1階トイレ',
            detail: 'トイレです。多目的トイレも完備しています。',
            tags:   ['設備'],
        },
        {
            name:   '階段①',
            floor:  1,
            x:  0.033703, y: 0.03625,  z: 0.012916,
            color:  '#a78bfa',
            icon:   '🪜',
            image:  '',
            title:  '階段①（東側）',
            detail: '東側の階段です。2〜4階へアクセスできます。',
            tags:   ['移動'],
        },
        {
            name:   '階段②',
            floor:  1,
            x: -0.134629, y: 0.03625,  z: 0.102916,
            color:  '#a78bfa',
            icon:   '🪜',
            image:  '',
            title:  '階段②（西側）',
            detail: '西側の階段です。2〜4階へアクセスできます。',
            tags:   ['移動'],
        },

        // ── 2階 ──────────────────────────────────────────────
        {
            name:   '物理実験室',
            floor:  2,
            x: -0.05, y: 0.35, z: 0.20,
            color:  '#34d399',
            icon:   '⚗️',
            image:  '',   // ← './images/physics.jpg'
            title:  '物理実験室（2F）',
            detail: '。',
            tags:   ['展示', '体験', '理科'],
        },
        {
            name:   '2階トイレ',
            floor:  2,
            x: -0.18, y: 0.35, z: 0.00,
            color:  '#38bdf8',
            icon:   '🚻',
            image:  '',
            title:  '2階トイレ',
            detail: '2階のトイレです。',
            tags:   ['設備'],
        },

        // ── 3階 ──────────────────────────────────────────────
        {
            name:   '生物実験室',
            floor:  3,
            x:  0.05, y: 0.58, z: 0.20,
            color:  '#34d399',
            icon:   '🔬',
            image:  '',
            title:  '生物実験室（3F）',
            detail: '。',
            tags:   ['展示', '体験', '理科'],
        },
        {
            name:   '3階トイレ',
            floor:  3,
            x: -0.18, y: 0.58, z: 0.00,
            color:  '#38bdf8',
            icon:   '🚻',
            image:  '',
            title:  '3階トイレ',
            detail: '3階のトイレです。',
            tags:   ['設備'],
        },

        // ── 4階 ──────────────────────────────────────────────
        {
            name:   '科学実験室',
            floor:  4,
            x:  0.05, y: 0.81, z: 0.20,
            color:  '#34d399',
            icon:   '🧪',
            image:  '',
            title:  '科学実験室（4F）',
            detail: '化',
            tags:   ['展示', '体験', '理科'],
        },
        {
            name:   '4階トイレ',
            floor:  4,
            x: -0.18, y: 0.81, z: 0.00,
            color:  '#38bdf8',
            icon:   '🚻',
            image:  '',
            title:  '4階トイレ',
            detail: '4階のトイレです。',
            tags:   ['設備'],
        },
    ];

    // 座標を1000倍スケール変換
    const SCALE = 1000;
    const rooms = ROOMS.map(r => ({ ...r, x: r.x * SCALE, y: r.y * SCALE, z: r.z * SCALE }));

    // ============================================================
    // Three.js セットアップ
    // ============================================================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd6e4f7);
    scene.fog = new THREE.FogExp2(0xd6e4f7, 0.00016);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(1000, 1000, 1000);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    document.getElementById("three").appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 100;
    controls.maxDistance = 5000;
    controls.maxPolarAngle = Math.PI / 2.1;

    window._mapCamera   = camera;
    window._mapControls = controls;

    // ライト
    const sun = new THREE.DirectionalLight(0xfff8f0, 2.2);
    sun.position.set(500, 1000, 300);
    sun.castShadow = true;
    sun.shadow.mapSize.width  = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 5000;
    sun.shadow.camera.left = sun.shadow.camera.bottom = -1500;
    sun.shadow.camera.right = sun.shadow.camera.top   =  1500;
    sun.shadow.bias = -0.0003;
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xc8d8f0, 1.4));
    const fill = new THREE.DirectionalLight(0xfdecc8, 0.5);
    fill.position.set(-300, -100, 200);
    scene.add(fill);

    // グリッド
    const grid = new THREE.GridHelper(4000, 80, 0x94a8c8, 0xbdd0e8);
    grid.material.opacity = 0.3;
    grid.material.transparent = true;
    scene.add(grid);

    // ============================================================
    // マーカー＆ラベル作成
    // ============================================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const markers = [];
    const labelEls = []; // HTML ラベル要素
    let activeMarkerIdx = null;

    // スマホでも押しやすいよう当たり判定用の透明大球を追加
    const isMobile = window.innerWidth <= 600;

    rooms.forEach((room, idx) => {
        const group = new THREE.Group();
        const col = new THREE.Color(room.color);

        // ── 外グロー（大きめ・やわらかく） ──
        const glowMat = new THREE.MeshStandardMaterial({
            color: col, transparent: true, opacity: 0.15, depthWrite: false,
            emissive: col, emissiveIntensity: 0.5,
        });
        group.add(new THREE.Mesh(new THREE.SphereGeometry(28, 32, 32), glowMat));

        // ── メイン球（大きめに） ──
        const sphereMat = new THREE.MeshStandardMaterial({
            color: col, emissive: col, emissiveIntensity: 0.45,
            metalness: 0.05, roughness: 0.15,
        });
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(18, 32, 32), sphereMat);
        // クリック検出はこの球で行う
        sphere.userData = { roomIndex: idx };
        group.add(sphere);

        // ── アイコン表示用の白い小円盤（上面） ──
        const discMat = new THREE.MeshStandardMaterial({
            color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.3,
            transparent: true, opacity: 0.9,
        });
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 3, 32), discMat);
        disc.position.y = 16;
        group.add(disc);

        // ── ピン棒（太め） ──
        const pinMat = new THREE.MeshStandardMaterial({
            color: col, emissive: col, emissiveIntensity: 0.3,
            transparent: true, opacity: 0.75,
        });
        const pin = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 60, 12), pinMat);
        pin.position.y = -38;
        group.add(pin);

        // ── 先端コーン（太め） ──
        const tipMat = new THREE.MeshStandardMaterial({
            color: col, emissive: col, emissiveIntensity: 0.3,
        });
        const tip = new THREE.Mesh(new THREE.ConeGeometry(6, 12, 12), tipMat);
        tip.position.y = -72; tip.rotation.x = Math.PI;
        group.add(tip);

        // ── 透明な当たり判定球（スマホで押しやすくするため大きく） ──
        const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
        const hitSphere = new THREE.Mesh(new THREE.SphereGeometry(36, 16, 16), hitMat);
        hitSphere.userData = { roomIndex: idx };
        group.add(hitSphere);

        group.position.set(room.x, room.y + 90, room.z);
        group.userData = { roomIndex: idx, baseY: room.y + 90 };
        scene.add(group);
        markers.push(group);

        // ── 常時表示ラベル（HTML要素） ──
        const label = document.createElement('div');
        label.className = 'room-label';
        label.innerHTML = `<span class="room-label-icon">${room.icon}</span><span class="room-label-name">${room.name}</span>`;
        label.style.setProperty('--color', room.color);
        document.getElementById('labels-container').appendChild(label);
        labelEls.push({ el: label, worldPos: group.position });
    });

    // ============================================================
    // モデル読み込み
    // ============================================================
    const modelDefs = [
        { floor: 1, path: './First.glb' },
        // { floor: 2, path: './model/Second.glb' },
        // { floor: 3, path: './model/Third.glb' },
        // { floor: 4, path: './model/Fourth.glb' },
    ];

    window._floorGroups  = {};
    window._allMeshes    = [];
    window._currentFloor = null;
    let loadedCount = 0;

    modelDefs.forEach(def => {
        const ext = def.path.split('.').pop().toLowerCase();
        const loader = (ext === 'fbx') ? new THREE.FBXLoader() : new THREE.GLTFLoader();

        loader.load(def.path, (result) => {
            const object = (ext === 'fbx') ? result : result.scene;
            object.scale.set(1000, 1000, 1000);

            const box = new THREE.Box3().setFromObject(object);
            const center = new THREE.Vector3();
            box.getCenter(center);
            object.position.x -= center.x;
            object.position.z -= center.z;
            object.position.y -= box.min.y;
            object.position.y += (def.floor - 1) * 350;

            object.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true; child.receiveShadow = true;
                    if (Array.isArray(child.material)) {
                        child.material = child.material.map(m => { const nm = m.clone(); nm.transparent = true; return nm; });
                    } else {
                        child.material = child.material.clone();
                        child.material.transparent = true;
                    }
                    window._allMeshes.push(child);
                }
            });

            window._floorGroups[def.floor] = object;
            scene.add(object);
            loadedCount++;
            if (loadedCount === modelDefs.length) onAllLoaded();

        }, (xhr) => {
            if (xhr.total > 0) {
                const pct = Math.min(Math.floor(((loadedCount + xhr.loaded/xhr.total) / modelDefs.length) * 100), 99);
                const f = document.getElementById("loading-bar-fill");
                const p = document.getElementById("loading-percent");
                if (f) f.style.width = pct + "%";
                if (p) p.textContent = pct + "%";
            }
        }, (error) => {
            console.error(`モデル(${def.floor}F)の読み込みに失敗:`, error);
            loadedCount++;
            if (loadedCount === modelDefs.length) onAllLoaded();
        });
    });

    function onAllLoaded() {
        const f = document.getElementById("loading-bar-fill");
        if (f) f.style.width = "100%";
        setTimeout(() => {
            const l = document.getElementById("loading");
            if (l) { l.style.opacity = '0'; setTimeout(() => l.style.display = 'none', 700); }
        }, 300);
        document.getElementById("controls-panel").classList.add("visible");
        document.getElementById("info-panel").classList.add("visible");
        document.getElementById("floor-selector").classList.add("visible");
    }

    // ============================================================
    // 階層フィルター
    // ============================================================
    window.applyFloorFilter = (floor) => {
        window._currentFloor = floor;

        if (Object.keys(window._floorGroups).length > 0) {
            Object.keys(window._floorGroups).forEach(f => {
                const t = (floor === null || parseInt(f) === floor) ? 1.0 : 0.06;
                window._floorGroups[f].traverse(c => { if (c.isMesh) fadeMeshTo(c, t); });
            });
        } else {
            const h = window._modelHeight || 1000, fh = h / 4;
            window._allMeshes.forEach(mesh => {
                const mb = new THREE.Box3().setFromObject(mesh);
                const cy = (mb.min.y + mb.max.y) / 2;
                if (floor === null) { fadeMeshTo(mesh, 1.0); return; }
                fadeMeshTo(mesh, (cy >= (floor-1)*fh - fh*0.1 && cy <= floor*fh + fh*0.1) ? 1.0 : 0.06);
            });
        }

        markers.forEach((group, i) => {
            fadeMarker(group, (floor === null || rooms[i].floor === floor) ? 1.0 : 0.0);
        });
    };

    function fadeMeshTo(mesh, target) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach(mat => {
            if (mat._ft) cancelAnimationFrame(mat._ft);
            const s = mat.opacity ?? 1.0, t0 = performance.now();
            function tick(now) {
                const t = Math.min((now-t0)/400,1), e = t<.5?2*t*t:-1+(4-2*t)*t;
                mat.opacity = s+(target-s)*e;
                if (t<1) mat._ft = requestAnimationFrame(tick);
                else { mat.opacity = target; mat._ft = null; }
            }
            mat._ft = requestAnimationFrame(tick);
        });
    }

    function fadeMarker(group, target) {
        group.traverse(c => {
            if (!c.isMesh || !c.material) return;
            const mat = c.material;
            if (!mat.transparent) mat.transparent = true;
            if (mat._ft) cancelAnimationFrame(mat._ft);
            const s = mat.opacity ?? 1.0, t0 = performance.now();
            function tick(now) {
                const t = Math.min((now-t0)/300,1), e = t<.5?2*t*t:-1+(4-2*t)*t;
                mat.opacity = s+(target-s)*e;
                if (t<1) mat._ft = requestAnimationFrame(tick);
                else { mat.opacity = target; mat._ft = null; }
            }
            mat._ft = requestAnimationFrame(tick);
        });
    }

    // ============================================================
    // クリック / タップ
    // ============================================================
    function getClickable() {
        const objs = [];
        markers.forEach(g => g.traverse(c => { if (c.isMesh && c.userData.roomIndex !== undefined) objs.push(c); }));
        return objs;
    }

    function onPointerUp(e) {
        // 詳細パネル上のクリックは無視
        if (e.target.closest('#detail-panel')) return;

        const cx = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const cy = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
        mouse.x = (cx / window.innerWidth)  * 2 - 1;
        mouse.y = -(cy / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(getClickable());
        if (hits.length > 0) {
            const idx = hits[0].object.userData.roomIndex;
            if (activeMarkerIdx === idx) { closeDetail(); activeMarkerIdx = null; }
            else { activeMarkerIdx = idx; openDetail(rooms[idx]); }
        } else {
            closeDetail(); activeMarkerIdx = null;
        }
    }
    window.addEventListener('click', onPointerUp);
    window.addEventListener('touchend', onPointerUp, { passive: true });

    // ============================================================
    // 詳細パネル
    // ============================================================
    function openDetail(room) {
        const panel = document.getElementById('detail-panel');

        // 画像エリア：画像があれば表示、なければカラーブロック
        const imgHTML = room.image
            ? `<img src="${room.image}" alt="${room.title}" class="detail-img">`
            : `<div class="detail-img-placeholder" style="background:linear-gradient(135deg,${room.color}33,${room.color}66)">
                 <span class="detail-img-icon">${room.icon}</span>
               </div>`;

        // タグ
        const tagsHTML = room.tags.length
            ? room.tags.map(tag => `<span class="detail-tag">${tag}</span>`).join('')
            : '';

        panel.innerHTML = `
            ${imgHTML}
            <div class="detail-body">
                <div class="detail-header">
                    <span class="detail-icon">${room.icon}</span>
                    <div>
                        <div class="detail-floor">${room.floor}F</div>
                        <div class="detail-title">${room.title}</div>
                    </div>
                </div>
                ${tagsHTML ? `<div class="detail-tags">${tagsHTML}</div>` : ''}
                <p class="detail-desc">${room.detail}</p>
                <button class="detail-close" onclick="closeDetail()">✕ 閉じる</button>
            </div>
        `;
        panel.classList.add('open');
    }

    window.closeDetail = function() {
        document.getElementById('detail-panel').classList.remove('open');
        activeMarkerIdx = null;
    };

    // ============================================================
    // ラベル位置更新（毎フレーム）
    // ============================================================
    function updateLabels() {
        labelEls.forEach(({ el, worldPos }, i) => {
            const vec = worldPos.clone();
            vec.y += 50; // ラベルをマーカーより少し上に（マーカー大きくした分上に）
            vec.project(camera);

            // 画面外は非表示
            if (vec.z > 1) { el.style.display = 'none'; return; }

            const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
            const y = (vec.y * -0.5 + 0.5) * window.innerHeight;
            el.style.display = 'flex';
            el.style.left = x + 'px';
            el.style.top  = (y - 70) + 'px';

            // 階層フィルターで非表示になっているマーカーはラベルも消す
            const floor = window._currentFloor;
            const visible = (floor === null || rooms[i].floor === floor);
            el.style.opacity = visible ? '1' : '0';
        });
    }

    // ============================================================
    // アニメーションループ
    // ============================================================
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);

        const t = performance.now() * 0.001;
        markers.forEach((group, i) => {
            group.position.y = group.userData.baseY + Math.sin(t * 1.7 + i * 1.2) * 7;
            const ts = activeMarkerIdx === i ? 1.3 : 1.0;
            group.scale.lerp(new THREE.Vector3(ts, ts, ts), 0.12);
        });

        updateLabels();
    }
    animate();

    window.onresize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
};