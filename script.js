let pdf;
let currentPage = 1;

function updatePageInfo() {
  const pageInfo = document.getElementById("pageInfo");
  pageInfo.innerText = `Page ${currentPage} of ${pdf.numPages}`;
  pageInfo.classList.remove("d-none");
}

async function updatePdfView() {
  document.getElementById("previousButton").disabled = currentPage <= 1;
  document.getElementById("nextButton").disabled = currentPage >= pdf.numPages;

  updatePageInfo();

  const page = await pdf.getPage(currentPage);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const viewport = page.getViewport({ scale: 1.5 });
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({ canvasContext: context, viewport: viewport });

  const pdfPreview = document.getElementById("pdfPreview");
  pdfPreview.innerHTML = "";
  pdfPreview.appendChild(canvas);
}

document.getElementById("resumeForm").addEventListener("submit", (event) => {
  event.preventDefault();
  analyzeResume();
});

document.getElementById("analyzeTextButton").addEventListener("click", () => {
  analyzeResume();
});

document.getElementById("downloadAnalysisButton").addEventListener("click", () => {
  const analysisContent = document.getElementById("analysisContent").innerText;
  if (!analysisContent.trim()) {
    alert("No analysis available to download.");
    return;
  }

  const blob = new Blob([analysisContent], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "AnalysisResults.txt";
  link.click();
});

async function analyzeResume() {
  const resumeText = document.getElementById("resume").value.trim();
  if (!resumeText) {
    alert("No resume text provided. Please upload a valid PDF.");
    return;
  }

  document.getElementById("spinner").classList.remove("d-none");

  const prompt = `Analyze this resume combining all pages and provide insights: ${resumeText}`;
  const output = document.getElementById("analysisContent");
  output.innerText = "";

  const ws = new WebSocket("wss://backend.buildpicoapps.com/ask_ai_streaming_v2");

  ws.addEventListener("open", () => {
    ws.send(JSON.stringify({ appId: "include-heart", prompt }));
  });

  ws.addEventListener("message", (event) => {
    output.innerText += event.data;
  });

  ws.addEventListener("close", () => {
    document.getElementById("spinner").classList.add("d-none");
    document.getElementById("downloadAnalysisButton").classList.remove("d-none");
  });

  ws.addEventListener("error", () => {
    alert("Error analyzing the resume. Try again.");
  });

  document.getElementById("output").classList.remove("d-none");
}

document.getElementById("uploadResume").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function () {
    const arrayBuffer = reader.result;
    pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let extractedText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      extractedText += textContent.items.map(item => item.str).join(" ") + "\n";
    }

    document.getElementById("resume").value = extractedText.trim();
    document.getElementById("resumeTextContainer").classList.remove("d-none");
    document.getElementById("analyzeTextButton").classList.remove("d-none");

    currentPage = 1;
    updatePdfView();
  };

  reader.readAsArrayBuffer(file);
});

document.getElementById("previousButton").addEventListener("click", () => {
  currentPage--;
  updatePdfView();
});

document.getElementById("nextButton").addEventListener("click", () => {
  currentPage++;
  updatePdfView();
});
function getRandomPrompt(resumeText) {
    const templates = [
      `Summarize the following resume and provide key details such as GPA, years of experience, candidate strengths, and any notable projects. Text: ${resumeText}`,
      `Analyze this resume and extract the following: a candidate overview (1-2 sentences), GPA, years of professional experience, and top recommendations for screening. Resume: ${resumeText}`,
      `Given the resume text below, provide the following information: key strengths of the candidate, education GPA, years of experience, and suggested interview questions. Resume Details: ${resumeText}`,
      `Review this resume and create a detailed analysis including the candidate's summary, GPA, years of experience, achievements, and initial screening questions. Resume: ${resumeText}`,
      `Perform a thorough analysis of the resume below. Include a summary, GPA, experience in years, major accomplishments, and any insights for the hiring team. Resume: ${resumeText}`,
    ];
  
    // Randomly select a prompt template
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }
  
  async function analyzeResume() {
    const resumeText = document.getElementById("resume").value.trim();
    if (!resumeText) {
      alert("No resume text provided. Please upload a valid PDF.");
      return;
    }
  
    document.getElementById("spinner").classList.remove("d-none");
  
    const prompt = getRandomPrompt(resumeText);
    const output = document.getElementById("analysisContent");
    output.innerText = "";
  
    const ws = new WebSocket("wss://backend.buildpicoapps.com/ask_ai_streaming_v2");
  
    ws.addEventListener("open", () => {
      ws.send(JSON.stringify({ appId: "include-heart", prompt }));
    });
  
    ws.addEventListener("message", (event) => {
      output.innerText += event.data;
    });
  
    ws.addEventListener("close", () => {
      document.getElementById("spinner").classList.add("d-none");
      document.getElementById("downloadAnalysisButton").classList.remove("d-none");
    });
  
    ws.addEventListener("error", () => {
      alert("Error analyzing the resume. Try again.");
    });
  
    document.getElementById("output").classList.remove("d-none");
  }
  
