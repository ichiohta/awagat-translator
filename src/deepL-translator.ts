import { Axios } from 'axios';
import { ITranslator, TTranslationResponse, TTranslationResult } from './translator.interface';

type TDeepLResponse = {
  translations: {
    detected_source_language: string;
    text: string;
  }[];
};

const newFailureResult = (count: number): TTranslationResult[] =>
  Array.from(new Array(count).keys()).map((_) => ({
    success: false,
    text: '',
    detectedLocaleId: '',
  }));

export class DeepLTranslator implements ITranslator {
  constructor(private deepLAuthKey: string, private axios: Axios) {}

  public async translate(content: string[], targetLocaleId: string): Promise<TTranslationResponse> {
    try {
      const response = await this.axios.post(
        '/v2/translate',
        {
          text: content,
          target_lang: targetLocaleId,
        },
        {
          headers: {
            Authorization: `DeepL-Auth-Key ${this.deepLAuthKey}`,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
          },
        },
      );

      const success = response.status == 200;
      const { translations } = (response.data as TDeepLResponse) || {};

      const error = success
        ? undefined
        : {
            status: response.status,
            message: response.statusText,
          };

      return {
        success,
        results: success
          ? translations.map(({ detected_source_language: detectedLocaleId, text }) => ({
              success,
              detectedLocaleId,
              text,
            }))
          : newFailureResult(content.length),
        error,
      };
    } catch (e) {
      return {
        success: false,
        results: newFailureResult(content.length),
        error: {
          status: e.response?.status,
          message: e.response?.statusText ?? e.message ?? 'An exception was thrown',
        },
      };
    }
  }
}
