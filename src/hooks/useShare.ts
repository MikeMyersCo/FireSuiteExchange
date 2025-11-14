'use client';

interface ShareData {
  title: string;
  text: string;
  url: string;
}

export function useShare() {
  const canShare = typeof navigator !== 'undefined' && navigator.share !== undefined;

  const share = async (data: ShareData): Promise<boolean> => {
    if (!canShare) {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(data.url);
        return false; // Indicates fallback was used
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        return false;
      }
    }

    try {
      await navigator.share(data);
      return true;
    } catch (err) {
      // User cancelled or error occurred
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
      return false;
    }
  };

  return { share, canShare };
}
