import { ITranslator, TTranslationResponse } from './translator.interface';

export type TParallelTranslatorOptions = {
  partitionSize: number;
};

export class ParallelTranslator implements ITranslator {
  private readonly partitionSize: number;

  constructor(private translator: ITranslator, { partitionSize }: TParallelTranslatorOptions) {
    this.partitionSize = partitionSize;
  }

  private *partition(content: string[]) {
    let remaining = Array.from(content);

    while (remaining.length > 0) {
      const batch = remaining.slice(0, this.partitionSize);
      remaining = remaining.slice(this.partitionSize);
      yield batch;
    }
  }

  async translate(content: string[], targetLocaleId: string): Promise<TTranslationResponse> {
    const tasks: Promise<TTranslationResponse>[] = [];

    for (const batch of this.partition(content)) {
      tasks.push(this.translator.translate(batch, targetLocaleId));
    }

    const responses = await Promise.all(tasks);

    return responses.reduce(
      (acc, { success, results }) => {
        acc.success = acc.success || success;
        acc.results.push(...results);
        return acc;
      },
      { success: false, results: [] } as TTranslationResponse,
    );
  }
}
