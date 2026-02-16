export async function exportToPng(
  svgElement: SVGSVGElement,
  filename = 'pitch.png'
): Promise<void> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const { width, height } = svgElement.getBoundingClientRect();
  const scale = 2;
  canvas.width = width * scale;
  canvas.height = height * scale;

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    ctx.scale(scale, scale);
    ctx.fillStyle = '#4a7c59';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    URL.revokeObjectURL(url);

    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = pngUrl;
    link.click();
  };
  img.src = url;
}
