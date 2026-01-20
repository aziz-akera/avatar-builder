declare module "dom-to-image" {
  export interface DomToImageOptions {
    quality?: number;
    width?: number;
    height?: number;
    style?: Record<string, string | number>;
    filter?: (node: Node) => boolean;
    bgcolor?: string;
  }

  export function toBlob(node: Node, options?: DomToImageOptions): Promise<Blob>;
  export function toPng(node: Node, options?: DomToImageOptions): Promise<string>;
  export function toJpeg(node: Node, options?: DomToImageOptions): Promise<string>;
  export function toSvg(node: Node, options?: DomToImageOptions): Promise<string>;
}

