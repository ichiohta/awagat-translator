export type TTranslationResult = {
  success: boolean;
  text: string;
  detectedLocaleId: string;
};

export type TTranslationResponse = {
  success: boolean;
  results: TTranslationResult[];
  error?: {
    status?: number,
    message?: string,
  },
};

export interface ITranslator {
  translate(content: string[], targetLocaleId: string): Promise<TTranslationResponse>;
}
