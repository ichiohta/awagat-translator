import { Axios } from 'axios';
import { DeepLTranslator } from './deepL-translator';

describe('DeepLTranslator', () => {
  const testAuthKey = 'test-auth-key';

  const mockTranslator = (success?: boolean, translation?: { text: string; detected_source_language: string }) => {
    const axios = {
      post: jest.fn(),
    } as Partial<Axios> as Axios;

    if (success === undefined) {
      (axios.post as jest.Mock).mockRejectedValue('failure');
    } else {
      (axios.post as jest.Mock).mockResolvedValue({
        status: success ? 200 : 403,
        data: success
          ? {
              translations: [translation],
            }
          : undefined,
      });
    }

    return new DeepLTranslator(testAuthKey, axios);
  };

  describe('translate', () => {
    it('should translate a string', async () => {
      expect.assertions(1);
      const translator = mockTranslator(true, { text: 'translation', detected_source_language: 'en' });
      const actual = await translator.translate(['source string'], 'ja');
      expect(actual).toEqual({
        success: true,
        results: [
          {
            success: true,
            text: 'translation',
            detectedLocaleId: 'en',
          },
        ],
      });
    });

    it('should return failure code if status code was not 200', async () => {
      expect.assertions(1);
      const translator = mockTranslator(false);
      const actual = await translator.translate(['source string'], 'ja');
      expect(actual).toEqual({
        success: false,
        error: {
          message: undefined,
          status: 403,
        },
        results: [
          {
            detectedLocaleId: '',
            success: false,
            text: '',
          },
        ],
      });
    });

    it('should return failure code if HTTP call failed', async () => {
      expect.assertions(1);
      const translator = mockTranslator(undefined);
      const actual = await translator.translate(['source string'], 'ja');
      expect(actual).toEqual({
        success: false,
        error: {
          message: expect.anything(),
          status: undefined,
        },
        results: [
          {
            success: false,
            detectedLocaleId: '',
            text: '',
          },
        ],
      });
    });
  });
});
