import Tokenizer from './tokenizer';
import EntityParser from './entity-parser';
import namedCodepoints from './char-refs/full';

export default function tokenize(input) {
  var tokenizer = new Tokenizer(new EntityParser(namedCodepoints));
  return tokenizer.tokenize(input);
}
