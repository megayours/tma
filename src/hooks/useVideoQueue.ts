import { useEffect, useRef, useCallback, useState } from 'react';

interface QueueItem {
  id: string;
  videoElement: HTMLVideoElement;
  priority: number;
}

class VideoDownloadQueue {
  private queue: QueueItem[] = [];
  private activeDownloads = new Set<string>();
  private maxConcurrent: number;
  private listeners = new Set<() => void>();

  constructor(maxConcurrent: number = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  enqueue(id: string, videoElement: HTMLVideoElement, priority: number = 0) {
    // Check if already in queue or downloading
    if (
      this.queue.some(item => item.id === id) ||
      this.activeDownloads.has(id)
    ) {
      return;
    }

    this.queue.push({ id, videoElement, priority });
    // Sort by priority (higher priority first)
    this.queue.sort((a, b) => b.priority - a.priority);
    this.processQueue();
  }

  dequeue(id: string) {
    this.queue = this.queue.filter(item => item.id !== id);
    this.activeDownloads.delete(id);
    this.notify();
  }

  private async processQueue() {
    while (
      this.queue.length > 0 &&
      this.activeDownloads.size < this.maxConcurrent
    ) {
      const item = this.queue.shift();
      if (!item) break;

      this.activeDownloads.add(item.id);
      this.notify();

      try {
        // Load the video
        await this.loadVideo(item.videoElement);
      } catch (error) {
        console.error(`Failed to load video ${item.id}:`, error);
      } finally {
        this.activeDownloads.delete(item.id);
        this.notify();
        // Continue processing queue
        this.processQueue();
      }
    }
  }

  private loadVideo(video: HTMLVideoElement): Promise<void> {
    return new Promise((resolve, reject) => {
      if (video.readyState >= 3) {
        // HAVE_FUTURE_DATA or better
        resolve();
        return;
      }

      const handleCanPlay = () => {
        cleanup();
        resolve();
      };

      const handleError = () => {
        cleanup();
        reject(new Error('Video load failed'));
      };

      const cleanup = () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
      };

      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);

      // Trigger load
      video.load();

      // Timeout after 30 seconds
      setTimeout(() => {
        cleanup();
        reject(new Error('Video load timeout'));
      }, 30000);
    });
  }

  isDownloading(id: string): boolean {
    return this.activeDownloads.has(id);
  }

  getQueuePosition(id: string): number {
    return this.queue.findIndex(item => item.id === id);
  }
}

// Singleton instance
const globalVideoQueue = new VideoDownloadQueue(3);

export function useVideoQueue(videoId: string, priority: number = 0) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isQueued, setIsQueued] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      const downloading = globalVideoQueue.isDownloading(videoId);
      const queuePos = globalVideoQueue.getQueuePosition(videoId);
      setIsDownloading(downloading);
      setIsQueued(queuePos >= 0);
    };

    updateStatus();
    return globalVideoQueue.subscribe(updateStatus);
  }, [videoId]);

  const enqueueVideo = useCallback(
    (video: HTMLVideoElement) => {
      videoRef.current = video;
      globalVideoQueue.enqueue(videoId, video, priority);
    },
    [videoId, priority]
  );

  const dequeueVideo = useCallback(() => {
    globalVideoQueue.dequeue(videoId);
  }, [videoId]);

  return {
    enqueueVideo,
    dequeueVideo,
    isQueued,
    isDownloading,
  };
}
