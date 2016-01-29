import path from 'path'

export const header = [
  "tools/_map",
  "tools/_list",
  "tools/_unit",
  "tools/_font",
  "tools/_responsivizer",
  "tools/_size",
  "settings/_settings",
].map((p) => `@import "${path.join(__dirname,p)}";\n`).join('')


export const styles = [
  'general/fonts',
  'general/normalize',
  'general/reset',

  'basic/page',
  'basic/image',
  'basic/headings',
  'basic/anchor',
  // 'basic/form',


  'objects/Grid/Grid',
  'objects/Input/Input',
  'objects/Checkbox/Checkbox',
  'objects/Radio/Radio',
  'objects/Select/Select',
  'objects/Textarea/Textarea',
  'objects/FlexEmbed/FlexEmbed',
  // 'objects/**/*.scss',

  'components/Content/Content',
  // 'components/**/*.scss',



  'trumps/position',
  'trumps/border',
  'trumps/color',
  'trumps/margin',
  'trumps/padding',
  'trumps/text',
  'trumps/interaction',
  'trumps/layout',
  'trumps/display',
  'trumps/size',
  'trumps/z-index',

]
