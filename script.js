window.addEventListener('load', () => {
    const pdfjsLib = window.pdfjsLib;
    let pdfDoc = null;
    let currentPage = 1;
    let scale = 1.0;
    let isRendering = false; // 描画中かどうか

    const canvas = document.getElementById("pdf-canvas");
    const ctx = canvas.getContext("2d");

    const fileInput = document.getElementById("pdf-file");
    const pageNumLabel = document.getElementById("page-num");
    const zoomSlider = document.getElementById("zoom-slider");
    const zoomLabel = document.getElementById("zoom-label");

    // PDF読み込み
    fileInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        pdfDoc = await loadingTask.promise;
        currentPage = 1;
        renderPage();
    });

    // 描画処理（ロック機能付き）
    async function renderPage() {
        if (isRendering || !pdfDoc) return;
        isRendering = true;

        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale: scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        
        isRendering = false;
        pageNumLabel.textContent = `${currentPage} / ${pdfDoc.numPages}`;
    }

    // ページ送りボタン
    document.getElementById("prev-page").addEventListener("click", () => {
        if (pdfDoc && currentPage > 1 && !isRendering) {
            currentPage--;
            renderPage();
        }
    });

    document.getElementById("next-page").addEventListener("click", () => {
        if (pdfDoc && currentPage < pdfDoc.numPages && !isRendering) {
            currentPage++;
            renderPage();
        }
    });

    zoomSlider.addEventListener("input", () => {
        scale = zoomSlider.value / 100;
        zoomLabel.textContent = `拡大率: ${zoomSlider.value}%`;
        renderPage();
    });

    // --- 音楽プレイヤー ---
    const audioFile = document.getElementById("audio-file");
    const playBtn = document.getElementById("play-btn");
    const trackTitle = document.getElementById("track-title");
    const seekBar = document.getElementById("seek-bar");
    const trackTime = document.getElementById("track-time");
    let audio = new Audio();

    trackTitle.addEventListener("click", () => audioFile.click());
    audioFile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        audio.src = URL.createObjectURL(file);
        trackTitle.textContent = file.name;
        audio.play();
        playBtn.textContent = "||";
    });

    playBtn.addEventListener("click", () => {
        if (!audio.src) { audioFile.click(); return; }
        audio.paused ? (audio.play(), playBtn.textContent = "||") : (audio.pause(), playBtn.textContent = "▶");
    });

    audio.addEventListener("timeupdate", () => {
        if (!audio.duration) return;
        seekBar.value = (audio.currentTime / audio.duration) * 100;
        const fmt = t => Math.floor(t/60) + ":" + Math.floor(t%60).toString().padStart(2,'0');
        trackTime.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
    });

    seekBar.addEventListener("input", () => {
        if (audio.duration) audio.currentTime = (seekBar.value / 100) * audio.duration;
    });

    // 時計
    setInterval(() => {
        const d = new Date();
        document.getElementById("clock").textContent = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    }, 1000);
});
