import React from 'react'
import R from 'ramda'
import Main from './main'
import {Grid,GridBlock} from '../ui/objects/Grid/Grid'
import GridDemo from '../ui/objects/Grid/Grid.demo'
import styleSettings from '../ui/settings/settings.js'

@Main
export default class StyleGuide extends React.Component {
  render() {
    return (
      <div>
        <SpacingDemo/>
        <ColorDemo/>
        <FontsDemo/>
        <GridDemo/>
      </div>
    )
  }
}

const FontsDemo = () => {
  const familyToKey = R.invertObj(styleSettings.font.family)
  const weightToKey = R.invertObj(styleSettings.font.weight)
  const demonstrateFace = ({family,weight,style}) => ([
    <h2 className="u-lineHeight-s">
      <div>
        {familyToKey[family]} => {family}, {style}, {weight}({weightToKey[weight]})
      </div>
    </h2>,
    <div 
      style={{
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        fontStyle: style,
      }} className={`u-lineHeight-s u-marginBottom-l u-textFamily-${familyToKey[family]} u-textWeight-${weightToKey[weight]}`}>
      <p 
        className="u-textSize-l u-marginBottom-s">
        abcdefghijklmnopqrstuvwxyz<br/>
        ABCDEFGHIJKLMNOPQRSTUVWXYZ<br/>
        {"0123456789.:,;()*!'?@#<>$%&^+-=~"}
      </p>
      <table>
      {
        R.pipe(
          R.toPairs,
          R.map(([key,value]) =>(
            <tr>
              <td 
                className="u-align-baseline u-color-grayLight u-textSize-xxs u-textWeight-normal u-textNormal"
                style={{fontFamily: 'Arial, sans-serif'}}><b>{key}</b>
              </td>
              <td 
                className="u-align-baseline u-color-grayLight u-textSize-xxs u-textWeight-normal u-textNormal"
                style={{fontFamily: 'Arial, sans-serif'}}>{value}
              </td>
              <td className={`u-align-baseline u-textSize-${key}`}>The quick brown fox jumps over the lazy dog.</td>
            </tr>
          ))
        )(styleSettings.font.size)
      }
      </table>
    </div>
  ])
  return (
    <div>
      <h1>
        Fonts
      </h1>
      {
        R.pipe(
          R.filter(({family})=>(familyToKey[family])),
          R.map(demonstrateFace)
        )(styleSettings.font.faces)
      }
    </div>
  )
}

const ColorDemo = () => {
  return (
    <div>
      <h1>
        Colors
      </h1>
      {
        R.map(([name,color]) => (
          <Grid>
            <GridBlock style={{textShadow:'0 1px 1px white'}} className={`u-size1/2 u-paddingRight-xs u-text-right u-background-${name}`}>{color}</GridBlock>
            <GridBlock style={{textShadow:'0 1px 1px black'}} className={`u-size1/2 u-paddingLeft-xs u-color-${name}`}>{name}</GridBlock>
          </Grid>
        ),R.toPairs(styleSettings.color))
      }
    </div>
  )
}


const SpacingDemo = () => {
  return (
    <div>
      <h1>
        Spacing
      </h1>
      {
        R.map(([name,spacing]) => (
          <div className={`u-paddingLeft-${name}`}>
            <div className="u-background-gray u-paddingLeft-xs">
              {name}:{spacing}
            </div>
          </div>
        ),R.toPairs(styleSettings.spacing))
      }
    </div>
  )
}

