export const MAX_FILES = 3;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 10 * 1024 * 1024;
export const ACCEPT_FILES = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp';
const types = {
  pdf:'application/pdf', doc:'application/msword',
  docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', webp:'image/webp',
};
const extension = name => name.toLowerCase().split('.').pop();
export function checkFiles(files) {
  if (files.length > MAX_FILES) throw new Error('Puedes adjuntar hasta 3 archivos.');
  let total = 0;
  for (const file of files) {
    if (!file.name || file.name.length > 160 || !types[extension(file.name)]) throw new Error('Usa archivos PDF, Word (.doc o .docx) o imágenes JPG, PNG y WebP.');
    if (!Number.isInteger(file.size) || file.size < 1 || file.size > MAX_FILE_BYTES) throw new Error('Cada archivo debe ocupar entre 1 byte y 5 MB.');
    total += file.size;
  }
  if (total > MAX_TOTAL_BYTES) throw new Error('Los archivos no pueden superar 10 MB en total.');
}

function isWordZip(bytes) {
  // Inspect the directory without inflating user-controlled ZIP entries.
  if (bytes.length < 22) return false;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = bytes.length - 22;
  for (; end >= Math.max(0, bytes.length - 65557); end--) {
    if (view.getUint32(end,true) === 0x06054b50 && end + 22 + view.getUint16(end + 20,true) === bytes.length) break;
  }
  if (end < 0 || end < bytes.length - 65557 || view.getUint16(end + 4,true) || view.getUint16(end + 6,true)) return false;
  const entries = view.getUint16(end + 10,true), length = view.getUint32(end + 12,true);
  let position = view.getUint32(end + 16,true);
  if (!entries || entries > 2048 || position + length !== end) return false;
  const names = new Set();
  for (let i = 0; i < entries; i++) {
    if (position + 46 > end || view.getUint32(position,true) !== 0x02014b50 || (view.getUint16(position + 8,true) & 1)) return false;
    const nameLength = view.getUint16(position + 28,true);
    const next = position + 46 + nameLength + view.getUint16(position + 30,true) + view.getUint16(position + 32,true);
    if (next > end) return false;
    const name = new TextDecoder().decode(bytes.subarray(position + 46,position + 46 + nameLength));
    if (/vbaProject\.bin$/i.test(name)) return false;
    names.add(name); position = next;
  }
  return position === end && names.has('[Content_Types].xml') && names.has('word/document.xml');
}

export function validateAttachments(input = []) {
  if (!Array.isArray(input) || input.length > MAX_FILES) throw new Error('Puedes adjuntar hasta 3 archivos.');
  const files = input.map(file => {
    if (!file || typeof file !== 'object' || typeof file.name !== 'string' || typeof file.content !== 'string' || file.content.length > Math.ceil(MAX_FILE_BYTES / 3) * 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(file.content) || file.content.length % 4) throw new Error('El contenido de un adjunto no es válido.');
    const padding = file.content.endsWith('==') ? 2 : file.content.endsWith('=') ? 1 : 0;
    return { name:file.name, content:file.content, size:file.content.length / 4 * 3 - padding };
  });
  checkFiles(files);
  return files.map(file => {
    // Inspect only the header for ordinary documents/images. Word ZIPs need their directory.
    const ext = extension(file.name);
    const binary = atob(ext === 'docx' ? file.content : file.content.slice(0,48));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const starts = (...signature) => signature.every((byte,index) => bytes[index] === byte);
    const valid = ext === 'pdf' ? starts(37,80,68,70,45)
      : ext === 'doc' ? starts(208,207,17,224,161,177,26,225)
      : ext === 'docx' ? starts(80,75,3,4) && isWordZip(bytes)
      : ext === 'png' ? starts(137,80,78,71,13,10,26,10)
      : ext === 'webp' ? starts(82,73,70,70) && new TextDecoder().decode(bytes.subarray(8,12)) === 'WEBP'
      : starts(255,216,255);
    if (!valid) throw new Error('El contenido de un archivo no coincide con su formato.');
    const filename = file.name.normalize('NFC').replace(/[\x00-\x1f\x7f/\\<>:"|?*]/g,'_');
    return { filename, content:file.content, contentType:types[ext] };
  });
}
