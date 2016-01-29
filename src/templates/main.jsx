import Handlebars from 'handlebars'
import React from 'react'
import ReactDOMServer from 'react-dom/server';
import {styles} from '../ui/style'

var template = Handlebars.compile(`<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <title>{{title}}</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <!--<link rel="stylesheet" href="{{root}}/libs/somefile.css">-->
        ${styles.map(name => `<link rel="stylesheet" href="{{root}}/styles/${name}.css">`).join('\n')}
        <!--<script src="{{root}}/libs/somescript.js"></script>-->
        <script src="{{root}}/main.js"></script>
    </head>
    <body>
        {{{body}}}
    </body>
</html>`);

export default (Component) => {
  return ({title, data, root}) => {
    var body = ReactDOMServer.renderToStaticMarkup(<Component {...data} config={{root}}/>)
    if(global.isWatching){
      body += `<style>#__bs_notify__{ opacity: 0.3;pointer-events:none }</style>`
    }
    return template({title, body, root})
  }
}
