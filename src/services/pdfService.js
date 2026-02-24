import * as pdfjs from 'pdfjs-dist';

// Remplace la ligne du workerSrc par celle-ci, plus stable :
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
