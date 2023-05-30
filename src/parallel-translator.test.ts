import { ParallelTranslator } from './parallel-translator';

describe('parallel-translator', () => {
  const newRequests = (count: number) => Array.from(Array(count).keys()).map((i) => `text${i}`);

  const newMockTranslator = (numberOfFailures: number): jest.Mock => {
    let count = 0;
    return jest.fn((content: string[], _: string) => {
      const failed = count++ < numberOfFailures;
      const success = !failed;
      return Promise.resolve({
        success,
        results: content.map((_) => ({
          success,
          detectedLocaleId: '',
          text: content,
        })),
      });
    });
  };

  it('should partition requests', async () => {
    expect.assertions(5);

    const numRequests = 13;
    const partitionSize = 5;
    const requests = newRequests(numRequests);

    const translate = newMockTranslator(0 /* numberOfFailures */);
    const translator = new ParallelTranslator({ translate }, { partitionSize });
    const { success, results } = await translator.translate(requests, 'ja');

    expect(success).toBe(true);
    expect(results.length).toBe(numRequests);
    expect(translate).toHaveBeenCalledWith(requests.slice(0, 5), 'ja');
    expect(translate).toHaveBeenCalledWith(requests.slice(5, 10), 'ja');
    expect(translate).toHaveBeenCalledWith(requests.slice(10, 13), 'ja');
  });

  it('should return true as long as there is one success', async () => {
    expect.assertions(4);

    const numRequests = 2;
    const partitionSize = 1;
    const requests = newRequests(numRequests);

    const translate = newMockTranslator(1 /* numberOfFailures */);
    const translator = new ParallelTranslator({ translate }, { partitionSize });
    const { success, results } = await translator.translate(requests, 'ja');

    expect(success).toBe(true);
    expect(results.length).toBe(numRequests);
    expect(results[0].success).toBe(false);
    expect(results[1].success).toBe(true);
  });

  it('should return false only when all requests failed', async () => {
    expect.assertions(4);

    const numRequests = 2;
    const partitionSize = 1;
    const requests = newRequests(numRequests);

    const translate = newMockTranslator(2 /* numberOfFailures */);
    const translator = new ParallelTranslator({ translate }, { partitionSize });
    const { success, results } = await translator.translate(requests, 'ja');

    expect(success).toBe(false);
    expect(results.length).toBe(numRequests);
    expect(results[0].success).toBe(false);
    expect(results[1].success).toBe(false);
  });
});
