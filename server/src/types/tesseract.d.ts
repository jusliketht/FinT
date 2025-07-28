declare module 'tesseract.js' {
  export interface WorkerOptions {
    logger?: (arg: { status: string; progress: number }) => void;
    errorHandler?: (error: Error) => void;
    langPath?: string;
    cachePath?: string;
    dataPath?: string;
    corePath?: string;
    gzip?: boolean;
    logger?: (arg: { status: string; progress: number }) => void;
    errorHandler?: (error: Error) => void;
  }

  export interface RecognizeResult {
    data: {
      text: string;
      confidence: number;
      lines: Array<{
        text: string;
        confidence: number;
        bbox: { x0: number; y0: number; x1: number; y1: number };
        words: Array<{
          text: string;
          confidence: number;
          bbox: { x0: number; y0: number; x1: number; y1: number };
        }>;
      }>;
    };
  }

  export interface Worker {
    load(): Promise<void>;
    loadLanguage(lang: string): Promise<void>;
    initialize(lang: string): Promise<void>;
    setParameters(params: Record<string, any>): Promise<void>;
    recognize(image: ImageData | string | Buffer): Promise<RecognizeResult>;
    terminate(): Promise<void>;
  }

  export interface Scheduler {
    addWorker(worker: Worker): void;
    addJob(action: string, ...args: any[]): Promise<any>;
    terminate(): Promise<void>;
  }

  export function createWorker(options?: WorkerOptions): Promise<Worker>;
  export function createScheduler(): Scheduler;
}
