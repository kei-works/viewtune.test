let pdfDoc = null;
let currentPage = 1;
let scale = 1.0;

const canvas = document.getElementById("pdf-canvas");
const ctx = canvas.getContext("2d");

const fileInput = document.getElementById("pdf-file");
const pageNumLabel = document.getElementById("page-num");
const zoomSlider = document.getElementById("zoom-slider");
const zoomLabel = document.getElementById("zoom-label");

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
  pdfDoc = await loadingTask.promise;

  currentPage = 1;
  renderPage();
});

async function renderPage() {
  const page = await pdfDoc.getPage(currentPage);

  const viewport = page.getViewport({ scale: scale });
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const renderContext = {
    canvasContext: ctx,
    viewport: viewport
  };

  await page.render(renderContext).promise;

  pageNumLabel.textContent = ${currentPage} / ${pdfDoc.numPages};
}

document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage <= 1) return;
  currentPage--;
  renderPage();
});

document.getElementById("next-page").addEventListener("click", () => {
  if (currentPage >= pdfDoc.numPages) return;
  currentPage++;
  renderPage();
});

zoomSlider.addEventListener("input", () => {
  scale = zoomSlider.value / 100;
  zoomLabel.textContent = 拡大率: ${zoomSlider.value}%;
  if (pdfDoc) renderPage();
});
