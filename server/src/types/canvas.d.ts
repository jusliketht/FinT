declare module 'canvas' {
  export class Canvas {
    constructor(width: number, height: number);
    getContext(contextId: '2d'): CanvasRenderingContext2D;
    toBuffer(): Buffer;
    toDataURL(): string;
  }

  export function createCanvas(width: number, height: number): Canvas;

  export class Image {
    src: string | Buffer;
    onload: () => void;
    onerror: (err: Error) => void;
    width: number;
    height: number;
  }

  export function loadImage(src: string | Buffer): Promise<Image>;
}
