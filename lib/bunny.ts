// Monta as URLs de HLS (streaming adaptativo) e thumbnail a partir do ID do vídeo no Bunny Stream.
// Estrutura padrão do Bunny CDN: https://<pull-zone>.b-cdn.net/<videoId>/playlist.m3u8
export function bunnyUrls(bunnyVideoId: string | null) {
  const host = process.env.BUNNY_CDN_HOSTNAME;
  if (!host || !bunnyVideoId) {
    return { hlsUrl: null as string | null, thumbnailUrl: null as string | null };
  }
  return {
    hlsUrl: `https://${host}/${bunnyVideoId}/playlist.m3u8`,
    thumbnailUrl: `https://${host}/${bunnyVideoId}/thumbnail.jpg`,
  };
}
