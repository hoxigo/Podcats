export {};

declare global {
  interface Window {
    electronAPI?: {
      platform?: NodeJS.Platform;
      savePodcasts?: (data: unknown) => Promise<any>;
      loadPodcasts?: () => Promise<any>;
    };
  }
}
