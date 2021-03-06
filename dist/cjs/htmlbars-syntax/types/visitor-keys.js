exports.__esModule = true;
exports.default = {
  Program: ['body'],

  MustacheStatement: ['path', 'params', 'hash'],
  BlockStatement: ['path', 'params', 'hash', 'program', 'inverse'],
  ElementModifierStatement: ['path', 'params', 'hash'],
  PartialStatement: ['name', 'params', 'hash'],
  CommentStatement: [],
  ElementNode: ['attributes', 'modifiers', 'children'],
  ComponentNode: ['attributes', 'program'],
  AttrNode: ['value'],
  TextNode: [],

  ConcatStatement: ['parts'],
  SubExpression: ['path', 'params', 'hash'],
  PathExpression: [],

  StringLiteral: [],
  BooleanLiteral: [],
  NumberLiteral: [],
  NullLiteral: [],
  UndefinedLiteral: [],

  Hash: ['pairs'],
  HashPair: ['value']
};
module.exports = exports.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWxiYXJzLXN5bnRheC90eXBlcy92aXNpdG9yLWtleXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtrQkFBZTtBQUNiLFNBQU8sRUFBbUIsQ0FBQyxNQUFNLENBQUM7O0FBRWxDLG1CQUFpQixFQUFTLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUM7QUFDcEQsZ0JBQWMsRUFBWSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUM7QUFDMUUsMEJBQXdCLEVBQUUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQztBQUNwRCxrQkFBZ0IsRUFBVSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDO0FBQ3BELGtCQUFnQixFQUFVLEVBQUU7QUFDNUIsYUFBVyxFQUFlLENBQUMsWUFBWSxFQUFFLFdBQVcsRUFBRSxVQUFVLENBQUM7QUFDakUsZUFBYSxFQUFhLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQztBQUNuRCxVQUFRLEVBQWtCLENBQUMsT0FBTyxDQUFDO0FBQ25DLFVBQVEsRUFBa0IsRUFBRTs7QUFFNUIsaUJBQWUsRUFBVyxDQUFDLE9BQU8sQ0FBQztBQUNuQyxlQUFhLEVBQWEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQztBQUNwRCxnQkFBYyxFQUFZLEVBQUU7O0FBRTVCLGVBQWEsRUFBYSxFQUFFO0FBQzVCLGdCQUFjLEVBQVksRUFBRTtBQUM1QixlQUFhLEVBQWEsRUFBRTtBQUM1QixhQUFXLEVBQWUsRUFBRTtBQUM1QixrQkFBZ0IsRUFBVSxFQUFFOztBQUU1QixNQUFJLEVBQXNCLENBQUMsT0FBTyxDQUFDO0FBQ25DLFVBQVEsRUFBa0IsQ0FBQyxPQUFPLENBQUM7Q0FDcEMiLCJmaWxlIjoiaHRtbGJhcnMtc3ludGF4L3R5cGVzL3Zpc2l0b3Ita2V5cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IHtcbiAgUHJvZ3JhbTogICAgICAgICAgICAgICAgICBbJ2JvZHknXSxcblxuICBNdXN0YWNoZVN0YXRlbWVudDogICAgICAgIFsncGF0aCcsICdwYXJhbXMnLCAnaGFzaCddLFxuICBCbG9ja1N0YXRlbWVudDogICAgICAgICAgIFsncGF0aCcsICdwYXJhbXMnLCAnaGFzaCcsICdwcm9ncmFtJywgJ2ludmVyc2UnXSxcbiAgRWxlbWVudE1vZGlmaWVyU3RhdGVtZW50OiBbJ3BhdGgnLCAncGFyYW1zJywgJ2hhc2gnXSxcbiAgUGFydGlhbFN0YXRlbWVudDogICAgICAgICBbJ25hbWUnLCAncGFyYW1zJywgJ2hhc2gnXSxcbiAgQ29tbWVudFN0YXRlbWVudDogICAgICAgICBbXSxcbiAgRWxlbWVudE5vZGU6ICAgICAgICAgICAgICBbJ2F0dHJpYnV0ZXMnLCAnbW9kaWZpZXJzJywgJ2NoaWxkcmVuJ10sXG4gIENvbXBvbmVudE5vZGU6ICAgICAgICAgICAgWydhdHRyaWJ1dGVzJywgJ3Byb2dyYW0nXSxcbiAgQXR0ck5vZGU6ICAgICAgICAgICAgICAgICBbJ3ZhbHVlJ10sXG4gIFRleHROb2RlOiAgICAgICAgICAgICAgICAgW10sXG5cbiAgQ29uY2F0U3RhdGVtZW50OiAgICAgICAgICBbJ3BhcnRzJ10sXG4gIFN1YkV4cHJlc3Npb246ICAgICAgICAgICAgWydwYXRoJywgJ3BhcmFtcycsICdoYXNoJ10sXG4gIFBhdGhFeHByZXNzaW9uOiAgICAgICAgICAgW10sXG5cbiAgU3RyaW5nTGl0ZXJhbDogICAgICAgICAgICBbXSxcbiAgQm9vbGVhbkxpdGVyYWw6ICAgICAgICAgICBbXSxcbiAgTnVtYmVyTGl0ZXJhbDogICAgICAgICAgICBbXSxcbiAgTnVsbExpdGVyYWw6ICAgICAgICAgICAgICBbXSxcbiAgVW5kZWZpbmVkTGl0ZXJhbDogICAgICAgICBbXSxcblxuICBIYXNoOiAgICAgICAgICAgICAgICAgICAgIFsncGFpcnMnXSxcbiAgSGFzaFBhaXI6ICAgICAgICAgICAgICAgICBbJ3ZhbHVlJ11cbn07XG4iXX0=