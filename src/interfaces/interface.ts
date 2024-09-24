export interface Painter { id: number, name: string }
export interface Note { id: number, note: string }
export interface PaintColor { id: number; color: string; line: string; brand: string; type: string; finish: string; orderForm: string }
export interface Images { url: string }

export interface Job {
  id?: string;
  name?: string;
  number?: number;
  creator?: string;
  date?: string;
  painters?: Painter[];
  notes?: Note[];
  paintColors?: PaintColor[]
  images?: Images[];
}