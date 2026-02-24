window.addEventListener('load', () => {
    // --- 1. 初期設定 ---
    const pdfjsLib = window.pdfjsLib;
    let pdfDoc = null;
    let currentPage = 1;
    let scale = 1.0;

    const canvas = document.getElementById("pdf-canvas");
    const ctx = canvas.getContext("2d");

    // PDF操作用要素
    const fileInput = document.getElementById("pdf-file");
    const pageNumLabel = document.getElementById("page-num");
    const zoomSlider = document.getElementById("zoom-slider");
    const zoomLabel = document.getElementById("zoom-label");

    // 音楽プレイヤー用要素
    const audioFile = document.getElementById("audio-file");
    const playBtn = document.getElementById("play-btn");
    const trackTitle = document.getElementById("track-title");
    const seekBar = document.getElementById("seek-bar");
    const trackTime = document.getElementById("track-time");
    let audio = new Audio();

    // --- 2. PDF表示機能 ---
    fileInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file || file.type !== "application/pdf") return;

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        pdfDoc = await loadingTask.promise;

        currentPage = 1;
        renderPage();
    });

    async function renderPage() {
        if (!pdfDoc) return;
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale: scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        await page.render(renderContext).promise;

        // ページ番号表示（バッククォートを使用）
        pageNumLabel.textContent = `${currentPage} / ${pdfDoc.numPages}`;
    }

    // PDFボタン操作
    document.getElementById("prev-page").addEventListener("click", () => {
        if (!pdfDoc || currentPage <= 1) return;
        currentPage--;
        renderPage();
    });

    document.getElementById("next-page").addEventListener("click", () => {
        if (!pdfDoc || currentPage >= pdfDoc.numPages) return;
        currentPage++;
        renderPage();
    });

    zoomSlider.addEventListener("input", () => {
        scale = zoomSlider.value / 100;
        zoomLabel.textContent = `拡大率: ${zoomSlider.value}%`;
        if (pdfDoc) renderPage();
    });

    // --- 3. 音楽プレイヤー機能 ---

    // 曲名部分をクリックしたらファイル選択画面を出す
    trackTitle.addEventListener("click", () => {
        audioFile.click();
    });

    audioFile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 前の曲のメモリを解放して新しい曲をセット
        const url = URL.createObjectURL(file);
        audio.src = url;
        trackTitle.textContent = file.name;
        audio.play();
        playBtn.textContent = "||"; // 一時停止マーク
    });

    // 再生・一時停止ボタン
    playBtn.addEventListener("click", () => {
        if (!audio.src) {
            audioFile.click(); // 曲がなければ選択画面へ
            return;
        }
        if (audio.paused) {
            audio.play();
            playBtn.textContent = "||";
        } else {
            audio.pause();
            playBtn.textContent = "▶";
        }
    });

    // 再生時間とシークバーの更新
    audio.addEventListener("timeupdate", () => {
        if (!audio.duration) return;
        const current = audio.currentTime;
        const duration = audio.duration;
        
        // シークバーの位置を更新
        seekBar.value = (current / duration) * 100;
        
        // 時間の表示を 0:00 形式に変換
        const formatTime = (time) => {
            const m = Math.floor(time / 60);
            const s = Math.floor(time % 60);
            return `${m}:${s.toString().padStart(2, '0')}`;
        };
        trackTime.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
    });

    // シークバーを手動で動かした時
    seekBar.addEventListener("input", () => {
        if (!audio.src) return;
        const targetTime = (seekBar.value / 100) * audio.duration;
        audio.currentTime = targetTime;
    });

    // --- 4. 時計機能 ---
    function updateClock() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        document.getElementById("clock").textContent = `${h}:${m}`;
    }
    setInterval(updateClock, 1000);
    updateClock(); // 最初の一回を実行
});
