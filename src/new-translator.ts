import { Axios } from 'axios';

import { DeepLTranslator } from './deepL-translator';
import { ParallelTranslator, TParallelTranslatorOptions } from './parallel-translator';
import { ITranslator } from './translator.interface';

export type TTranslationProvider = 'DeepL';

export type TTranslatorOptions = {
  provider: TTranslationProvider,
  secret: string,
  parallelize: false
} | {
  provider: TTranslationProvider,
  secret: string,
  parallelize: true,
  parallelOptions: TParallelTranslatorOptions
}

export const newTranslator = (options: TTranslatorOptions, axios: Axios): ITranslator => {
  const { secret, parallelize } = options;
  const translator = new DeepLTranslator(secret, axios);
  if (parallelize) {
    const { parallelOptions } = options;
    return new ParallelTranslator(translator, parallelOptions);
  } else {
    return translator;
  }
}
