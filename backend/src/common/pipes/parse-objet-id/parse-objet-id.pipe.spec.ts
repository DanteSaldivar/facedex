import { describe, expect, it } from '@jest/globals';
import { ParseObjectIdPipe } from './parse-objet-id.pipe.js';

describe('ParseObjetIdPipe', () => {
  it('should be defined', () => {
    expect(new ParseObjectIdPipe()).toBeDefined();
  });
});
