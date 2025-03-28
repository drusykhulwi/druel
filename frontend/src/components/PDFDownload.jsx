import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const PDFDownload = () => {
  const pdfRef = useRef(); // Reference to the component

  const downloadPDF = () => {
    const input = pdfRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("document.pdf");
    });
  };

  return (
    <div>
      <button onClick={downloadPDF}>Download PDF</button>
    </div>
  );
};

export default PDFDownload;
