/**
 * Guarda un archivo. En un navegador normal usa un enlace temporal; si la app
 * corre dentro de un visor que bloquea descargas directas (p. ej. una página
 * publicada en claude.ai) usa la API de descargas del visor.
 */
export async function saveFile(filename: string, data: Blob): Promise<void> {
  const claude = (window as any).claude;
  if (claude?.use) {
    const downloads = await claude.use('downloads');
    if (downloads) {
      await downloads.save({ filename, data });
      return;
    }
  }
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
