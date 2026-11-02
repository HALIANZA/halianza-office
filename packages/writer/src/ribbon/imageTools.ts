const MAX_SIDE = 1600;
const MAX_DATA_URL_LENGTH = 1200000;
const MAX_FILE_BYTES = 25 * 1024 * 1024;

export type PreparedImage = { src: string; alt: string; note?: string };

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(blob);
  });
}

// Reduz e recodifica a imagem para caber no armazenamento local do documento.
export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) {
    throw new Error("Formato não suportado. Use PNG, JPEG, WebP ou GIF.");
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new Error("A imagem é muito grande (limite de 25 MB).");
  }

  const alt = file.name.replace(/\.[^.]+$/, "");

  if (file.type === "image/gif") {
    const src = await readAsDataUrl(file);

    if (src.length > MAX_DATA_URL_LENGTH) {
      throw new Error(
        "O GIF é grande demais para ser guardado no documento. Use um arquivo menor.",
      );
    }

    return { src, alt };
  }

  const bitmap = await createImageBitmap(file);
  const keepPng = file.type === "image/png";
  let scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  let quality = 0.85;

  try {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Não foi possível processar a imagem.");
      }

      canvas.width = width;
      canvas.height = height;

      // Na primeira tentativa, PNG mantém a transparência.
      const asPng = keepPng && attempt === 0;

      if (!asPng) {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
      }

      context.drawImage(bitmap, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, asPng ? "image/png" : "image/jpeg", quality),
      );

      if (!blob) {
        throw new Error("Não foi possível processar a imagem.");
      }

      const src = await readAsDataUrl(blob);

      if (src.length <= MAX_DATA_URL_LENGTH) {
        return {
          src,
          alt,
          note:
            keepPng && !asPng
              ? "A transparência foi removida para reduzir o tamanho."
              : undefined,
        };
      }

      quality = Math.max(0.6, quality - 0.1);
      scale *= 0.8;
    }
  } finally {
    bitmap.close();
  }

  throw new Error(
    "A imagem continua grande demais depois de reduzida. Use uma menor.",
  );
}
