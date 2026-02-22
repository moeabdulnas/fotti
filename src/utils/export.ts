export async function exportToPng(
  svgElement: SVGSVGElement,
  filename = 'pitch.png',
  title?: string
): Promise<void> {
  // 1. Create a dynamic, off-screen Canvas API element and grab its 2D drawing context.
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // 2. Fetch the actual rendered pixel dimensions of the SVG Pitch from the DOM.
  // We use this to scale the output canvas relative to the visible screen size.
  const { width, height } = svgElement.getBoundingClientRect();

  // To keep the image crisp when saving it to PNG, we double the pixel density.
  // This essentially creates a "retina" image export, scaling everything x2.
  const scale = 2;

  // We calculate a vertical padding (15% of height) to ensure any overflowing markers
  // or labels at the top/bottom edges of the SVG don't get abruptly cut off.
  const paddingY = height * 0.15;

  // Add extra padding for title if present
  const titlePadding = title ? 60 : 0;

  // We set the physical pixel size of the canvas element itself to the scaled dimensions.
  canvas.width = width * scale;
  canvas.height = (height + paddingY * 2 + titlePadding) * scale;

  // 3. Serialize the live SVG DOM node into raw string XML data format.
  // This allows us to convert the vector graphics into something an Image can render.
  const svgData = new XMLSerializer().serializeToString(svgElement);

  // We wrap the raw XML string in a Blob of type image/svg+xml so the browser treats it
  // as an actual file, and generate an ephemeral ObjectURL pointing to it.
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  // 4. Create an ephemeral Image element to load the SVG blob.
  const img = new Image();
  img.onload = () => {
    // When the image finishes loading asynchronously, we scale the context.
    ctx.scale(scale, scale);

    // Fill the background of the image with the pitch's grass color.
    // Since SVG elements have transparent backgrounds by default, the Canvas would
    // otherwise render transparency as black when converting to JPG, or transparent in PNG.
    ctx.fillStyle = '#4a7c59';
    ctx.fillRect(0, 0, width, height + paddingY * 2 + titlePadding);

    // Draw title if provided
    if (title) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(title, width / 2, 35);
    }

    // Draw the rasterized Image of our SVG onto the Canvas surface.
    // The image starts at Y = paddingY to give us top/bottom padding space.
    ctx.drawImage(img, 0, paddingY + titlePadding, width, height);

    // Clean up the object URL to prevent memory leaks in the browser.
    URL.revokeObjectURL(url);

    // 5. Convert the final drawn canvas into a base64 Data URL specifically encoded as a PNG.
    const pngUrl = canvas.toDataURL('image/png');

    // Create a phantom <a> link, configure it for download, and simulate a click
    // to trigger the browser's download prompt.
    const link = document.createElement('a');
    link.download = filename;
    link.href = pngUrl;
    link.click();
  };
  // Setting the src kicks off the image download asynchronously.
  img.src = url;
}
