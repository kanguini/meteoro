'use client';

import { MediaPicker } from './MediaPicker';

/**
 * Selector só de imagem. Mantido para os formulários de serviços e obras, que
 * não fazem sentido com vídeo.
 */
export function ImagePicker(props: {
  name: string;
  label: string;
  defaultValue?: string | null;
  library: { url: string; filename: string }[];
  hint?: string;
}) {
  return <MediaPicker {...props} allowVideo={false} />;
}
