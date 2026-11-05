export interface ErrorHttpBackend {
  statusCode: number;
  message: string | string[];
  error?: string;
}