import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// For browser environment, we configure the PDF.js worker
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const extractTextFromImageOrPdf = async (file) => {
  if (file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    
    // Scale up for better OCR resolution
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas'); // requires DOM
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const context = canvas.getContext('2d');
    await page.render({ canvasContext: context, viewport }).promise;
    
    // Convert canvas to data URL for Tesseract
    const dataUrl = canvas.toDataURL('image/png');
    const result = await Tesseract.recognize(dataUrl, 'eng');
    return result.data.text;
  } else {
    // It's a regular image
    const result = await Tesseract.recognize(file, 'eng');
    return result.data.text;
  }
};

export const parseAadhaar = async (file) => {
  try {
    const text = await extractTextFromImageOrPdf(file);
    console.log("OCR Result:", text);
    
    const lines = text
      .split('\n')
      .map(l => l.replace(/\s+/g, ' ').trim())
      .filter(l => l.length > 1);
    const fullText = text.replace(/\s+/g, ' ').trim();
    
    let name = '';
    let address = '';
    let pin = '';
    let phone = '';

    const isNoiseLine = (line) => {
      const lower = line.toLowerCase();
      return (
        lower.includes('government of india') ||
        lower.includes('govt of india') ||
        lower.includes('unique identification') ||
        lower.includes('aadhaar') ||
        lower.includes('enrolment') ||
        lower.includes('vid') ||
        lower.includes('help') ||
        lower.includes('www.') ||
        /^\d{4}\s\d{4}\s\d{4}$/.test(line)
      );
    };

    // 1. Phone Number (10 digits starting with 6-9)
    const phoneMatch = fullText.match(/\b[6-9]\d{9}\b/);
    if (phoneMatch) phone = phoneMatch[0];

    // 2. Address heuristics (Back side): prefer explicit "Address" block first.
    const addrRegex = /(?:Address|Addres|Addr|Add)\s*[:,-]?\s*([\s\S]*?)(?:\b\d{6}\b|$)/i;
    const addrMatch = text.match(addrRegex);
    
    if (addrMatch) {
      address = addrMatch[1].replace(/\s+/g, ' ').replace(/^[,:\-\s]+/, '').trim();
    } else {
      // Fallback: stitch likely address lines around relation markers and postcode line.
      const addressLike = lines.filter((line) => {
        const lower = line.toLowerCase();
        return !isNoiseLine(line) && (
          /\b(c\/o|s\/o|d\/o|w\/o)\b/i.test(line) ||
          lower.includes('district') ||
          lower.includes('state') ||
          lower.includes('near') ||
          lower.includes('road') ||
          lower.includes('street') ||
          lower.includes('nagar') ||
          lower.includes('colony') ||
          /\b\d{6}\b/.test(line)
        );
      });
      address = addressLike.join(', ').replace(/\s+,/g, ',').trim();
    }

    // 3. PIN Code (6 digits): prioritize a code found inside address block.
    const pinMatchInAddress = address.match(/\b\d{6}\b/);
    if (pinMatchInAddress) {
      pin = pinMatchInAddress[0];
    } else {
      const pinLine = lines.find(l => /\b\d{6}\b/.test(l) && !/^\d{4}\s\d{4}\s\d{4}$/.test(l));
      if (pinLine) {
        const m = pinLine.match(/\b\d{6}\b/);
        if (m) pin = m[0];
      }
    }

    // Clean address and remove trailing pin duplication.
    address = address
      .replace(/\s+/g, ' ')
      .replace(/\b\d{6}\b\s*$/, '')
      .replace(/[,:\-\s]+$/, '')
      .trim();

    // 4. Name heuristics (Front side): prioritize line before DOB/YOB.
    const dobIndex = lines.findIndex(l => /\b(dob|yob|year of birth|birth)\b/i.test(l));
    if (dobIndex > 0 && !isNoiseLine(lines[dobIndex - 1])) {
      name = lines[dobIndex - 1];
    } else {
      for (let i = 0; i < Math.min(10, lines.length); i++) {
        const line = lines[i];
        if (
          !isNoiseLine(line) &&
          !/\d/.test(line) &&
          !/\b(male|female|dob|yob|year|address)\b/i.test(line) &&
          /^[A-Za-z][A-Za-z\s.-]{2,}$/.test(line)
        ) {
          name = line.replace(/^(name\s*[:\-]?\s*)/i, '').trim();
          break;
        }
      }
    }
    
    if (name) name = name.replace(/[^a-zA-Z\s.-]/g, '').trim();

    return {
      name: name || '',
      zip: pin || '',
      address: address || '',
      phone: phone || ''
    };

  } catch (e) {
    console.error("OCR Error: ", e);
    throw new Error(e.message || "Failed to parse document");
  }
};
