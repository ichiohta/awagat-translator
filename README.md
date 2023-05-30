# @awagat/translator

## Overview

This NPM packages is supposed to provide an unified interface to various machine translation APIs. Currently, it only supports DeepL API.

## Usage

```
import { ITranslator, newTranslator } from '@awagat/translator';

const translator = newTranslator({
  provider: 'DeepL',
  secret: 'your-api-secret'
});
```

## Interface

```
type TTranslationResult = {
  success: boolean;
  text: string;
  detectedLocaleId: string;
};

type TTranslationResponse = {
  success: boolean;
  results: TTranslationResult[];
  error?: {
    status?: number,
    message?: string,
  },
};

interface ITranslator {
  translate(content: string[], targetLocaleId: string): Promise<TTranslationResponse>;
}
```
