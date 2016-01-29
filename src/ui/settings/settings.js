var R = require('ramda')
var brandColors = require('brand-colors-json')
var toType = (typeName) => (...value) => ({'$type':typeName, '$value': value})
var percentage = toType('percentage')
var hsl = toType('hsl')
var ms = toType('ms')
var s = toType('s')
var rem = toType('rem')
var em = toType('em')
var px = toType('px')
var ref = toType('ref')
var div = toType('div')

var isOfType = (type) => (val) => (val && val['$type'] == type)
var hasTypeValue = (val) => (val['$type'] != null && val['$value'] != null)
var valueFromType = (fn) => (val) => fn(val['$value'])


var resolve = (data) => {
  var mapper = R.cond([
    [isOfType('percentage'),  valueFromType(([v]) => `${mapper(v)*100}%`)],
    [isOfType('hsl'),         valueFromType(([h,s,l]) => `hsl(${mapper(h)},${mapper(s)}%,${mapper(l)}%)`)],
    [isOfType('ms'),          valueFromType(([v]) => `${mapper(v)}ms`)],
    [isOfType('px'),          valueFromType(([v]) => `${mapper(v)}px`)],
    [isOfType('s'),           valueFromType(([v]) => `${mapper(v)}s`)],
    [isOfType('div'),         valueFromType(([a,b]) => mapper(a)/mapper(b))],
    [isOfType('em'),          valueFromType(([v]) => `${mapper(v)/basisForEm}em`)],
    [isOfType('rem'),         valueFromType(([v]) => `${mapper(v)/basisForRem}rem`)],
    [isOfType('ref'),         valueFromType((ref) => mapper(R.path(ref,data)) )],
    [hasTypeValue,            valueFromType(R.identity)],
    [R.is(Array),             (arr) => R.map(mapper,arr)],
    [R.is(Object),            (obj) => R.mapObj(mapper,obj)],
    [R.T,                     R.identity]
  ])

  var basisForRem  = mapper(data['unitBasis']['rem'])
  var basisForEm = mapper(data['unitBasis']['em'])
  return R.mapObj(mapper,data)
}

var settings = {
  'unitBasis': {
    'em': ref('font', 'default', 'size'),
    'rem': ref('font', 'default', 'rootSize'),
  },
  'env':{
    'root': '"../"',
  },
  'base': {
    'rootFontSize': percentage(div(ref('font', 'default','rootSize'),16)),
    'lineHeight': ref('font', 'default', 'lineHeight'),
    'fontSize': rem(ref('font', 'default', 'size')),
    'fontFamily': ref('font', 'default', 'family'),
    'fontWeight': ref('font', 'default', 'weight'),
    'background': ref('color', 'whitish'),
    'color': ref('color', 'blackLighter'),
    'focus': ref('color', 'brand'),
  },
  'border': {
    'radius': {
      // 's': rem(2),
      'rounded': percentage(0.5),
    },
    'width': {
      's': rem(1),
    }
  },
  'color': R.merge({
      'blackish':      hsl( 0,  0,   0 ),
      'blackLight':    hsl( 0,  0,  10 ),
      'blackLighter':  hsl( 0,  0,  20 ),
      'grayDarker':    hsl( 0,  0,  30 ),
      'grayDark':      hsl( 0,  0,  40 ),
      'gray':          hsl( 0,  0,  50 ),
      'grayLight':     hsl( 0,  0,  60 ),
      'grayLighter':   hsl( 0,  0,  70 ),
      'whiteDarker':   hsl( 0,  0,  80 ),
      'whiteDark':     hsl( 0,  0,  90 ),
      'whitish':       hsl( 0,  0, 100 ),
      'brand':         hsl( 0, 40,  50 ),
      'brandInvert':   hsl( 0, 80,  50 ),
      
      //ui alert colors could be seperated
      'danger':        hsl(  0, 64,  58),
      'success':       hsl(120, 39,  54),
      'info':          hsl(194, 66,  61),
      'warning':       hsl( 35, 84,  62),
    },
    R.pick([
      'facebook',
      'twitter',
      'github'
    ], brandColors)
  ),
  'breakpoint': {
    'xs': em(480),
    's': em(720),
    'm': em(960),
    'l': em(1280),
  },
  'spacing': {
    'xxs': rem(5),
    'xs':  rem(10),
    's':   rem(20),
    'm':   rem(30),
    'l':   rem(40),
    'xl':  rem(50),
    'xxl': rem(100),
    '3xl': rem(150),
    '4xl': rem(200),
  },
  'transition': {
    'duration': {
      'm': ms(300),
    },
    'function': {
      'in': 'ease-in',
      'out': 'ease-out',
    }
  },
  'font': {
    'size': {
      'xs':  rem(12),
      's':   rem(14),
      'm':   rem(16),
      'l':   rem(18),
      'xl':  rem(36),
      'xxl': rem(44),
      '3xl': rem(72),
    },
    'lineHeight': {
      'uno': 1,
      // 'xs': 1.2,
      's':  1.4,
      'm':  1.5,
      'l':  1.6,
      'dos': 2,
    },
    'family': {
      'primary': '"Roboto"',
      'secondary': '"Alegreya"'
    },
    'weight': {
      'normal': 400,
      'bold': 700,
    },
    'faces': [
      {
        'family': '"Alegreya"',
        'file': 'Alegreya-bold',
        'weight': ref('font','weight','bold'),
        'style': 'normal'
      },
      {
        'family': '"Roboto"',
        'file': 'Roboto-normal',
        'weight': ref('font','weight','normal'),
        'style': 'normal'
      },
      {
        'family': '"Roboto"',
        'file': 'Roboto-bold',
        'weight': ref('font','weight','bold'),
        'style': 'normal'
      }
    ],
    'default': {
      'family': ref('font','family','primary'),
      'weight': ref('font','weight','normal'),
      'lineHeight': ref('font','lineHeight','m'),
      'size': 16,
      'rootSize': 10
    }
  },
  'grid': {
    'gutter': {
      'None': 0,
      'Narrow': ref('spacing','xs'),
      'Normal': ref('spacing','s'),
      'Wide': ref('spacing','m'),
    },
    'columns': '12',
    'sizeSeperator': '\\\/'
  },
  'z': {
    'negative': -1,
    'alpha': 0,
    'beta': 10,
    'gamma': 20,
    'delta': 30,
    'epsilon': 40,
    'zeta': 50,
    'eta': 60,
    'theta': 70,
    'iota': 80
  }
}

module.exports = resolve(settings)
