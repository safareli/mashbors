import React from 'react'
import H from '../../tools/classNameHelper'

export default class Input extends React.Component {
  static propTypes = {
    required : H.flagModifier
  }

  render() {
    var {className, ...props} = this.props
    return (
      <textarea className={H.toElementClasses("Textarea", H.pickModifiers(this), [className])} {...props}>
        {this.props.children}
      </textarea>
    )
  }
}
