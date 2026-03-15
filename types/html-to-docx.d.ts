declare module 'html-to-docx' {
  export interface HTMLtoDOCXOptions {
    table?: {
      row?: {
        cantSplit?: boolean;
      };
    };
    footer?: boolean;
    pageNumber?: boolean;
    [key: string]: any;
  }

  function HTMLtoDOCX(
    html: string,
    headerHTML?: string | null,
    options?: HTMLtoDOCXOptions,
    VFS?: any
  ): Promise<Buffer>;

  export default HTMLtoDOCX;
}
