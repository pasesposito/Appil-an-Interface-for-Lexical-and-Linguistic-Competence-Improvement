
const englishTitles = [
  "potential therapeutic",
  "overall survival",
  "cancer patients",
  "differentially expressed",
  "t cells",
  "poor prognosis",
  "stem cells",
  "oxidative stress",
  "vitro vivo",
  "therapeutic targets",
  "western blot",
  "molecular mechanisms",
  "study aimed",
  "tumor growth",
  "therapeutic strategies",
  "dna damage",
  "drug resistance",
  "ovarian cancer",
  "therapeutic target",
  "wound healing",
  "cell viability",
  "analysis revealed",
  "immune cells",
  "immune cell",
  "cell carcinoma",
  "clinical trials",
  "cancer therapy",
  "side effects",
  "crucial role",
  "gastric cancer",
  "enrichment analysis",
  "soft tissue",
  "oxygen species",
  "immune infiltration",
  "drug delivery",
  "reactive oxygen",
  "simple summary",
  "reactive oxygen species",
  "cancer progression",
  "flow cytometry",
  "tumor progression",
  "present study",
  "t cell",
  "protein expression",
  "cervical cancer",
  "cell migration",
  "non-coding rnas",
  "cell line",
  "transcription factor",
  "solid tumors",
  "squamous cell",
  "recent years",
  "immune microenvironment",
  "immune response",
  "prognostic model",
  "pancreatic cancer",
  "immune checkpoint",
  "western blotting",
  "migration invasion",
  "cancer types",
  "tumor cell",
  "osteosarcoma cells",
  "expressed genes",
  "colorectal cancer",
  "extracellular matrix"
];

// Dato un titolo inglese, estrae il titolo italiano dalla Wikipedia API
async function extractItalianTitleFromJson() {
	
	
  // Codifica il titolo per URL
  const encodedTitle = encodeURIComponent(englishTitle);
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodedTitle}&prop=langlinks&lllimit=500&format=json&origin=*`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const pages = data?.query?.pages;

    if (!pages) {
      console.warn("Nessuna pagina trovata nella risposta.");
      return null;
    }

    // Estrae il primo pageId
    const pageId = Object.keys(pages)[0];

    // Recupera i langlinks (traduzioni)
    const langlinks = pages[pageId]?.langlinks;
    if (!langlinks) return null;

    // Cerca la traduzione in italiano ("it")
    const italian = langlinks.find(link => link.lang === "it");
    return italian ? italian["*"] : null;
  } catch (error) {
    console.error("Errore nella richiesta API:", error);
    return null;
  }
}

// Esempio d'uso
const englishTitle = "Cancer";

extractItalianTitleFromJson(englishTitle).then(italianTitle => {
  if (italianTitle) {
    console.log(`Titolo in italiano: ${italianTitle}`);
  } else {
    console.log("Titolo italiano non trovato.");
  }
});
