import React from 'react'
export default({className, children, navigation}) => {
  return (
    <div className={`Page ${className? className: ''}`} id="top">
      {navigation &&
        <div className="Page-navigation">
          {navigation}
        </div>}
      {children}
    </div>
  )
}
