const fs = require('fs');
const pdfParse = require('pdf-parse');

/**
 * Extracts plain text from a PDF file on disk.
 * Returns an empty string (rather than throwing) on a corrupt/empty
 * PDF so upload doesn't hard-fail — the note is still saved, just
 * without extracted text, and the user is informed via the controller.
 */
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return (data.text || '').trim();
  } catch (error) {
    console.error('PDF extraction error:', error.message);
    return '';
  }
};

module.exports = { extractTextFromPDF };
