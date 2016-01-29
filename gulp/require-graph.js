import R from 'ramda'
import Module from 'module'
import path from 'path'
import minimatch from 'minimatch'

const requireOriginal = Module.prototype.require

// @from: https://github.com/nodejs/node/blob/v4.0.0-rc.5/lib/module.js#L387-L389
const resolve = function(request,self) {
  return Module._resolveFilename(request, self)
}

// {A} is file which is required
// {B} is file which required file {A}
// dependencies[A][B] = TRUE
const dependencies = {}

const isFromNodeModules = function(relativePath){
  return relativePath.split(path.sep).indexOf("node_modules") >= 0
}

Module.prototype.require = function(request){
  const filePath = resolve(request,this)
  const relativePath = path.relative(process.cwd(), filePath);
  
  if(!isFromNodeModules(this.id) && !isFromNodeModules(relativePath)){
    dependencies[filePath] = dependencies[filePath] || {}
    dependencies[filePath][this.id] = true
  }

  return requireOriginal.apply(this,arguments)
}


const fileChanged = function(filePath){
    Object.keys(dependencies).forEach((key) => {
      delete dependencies[key][filePath]
  })
}
  
const decache = function(filePath){
  delete Module._cache[filePath]
}

const decacheWithGlob = function(glob){
  Object.keys(dependencies).forEach((filePath) => {
    if(minimatch(path.relative(process.cwd(),filePath),glob)){
      decache(filePath)
    }
  })
}

export default {fileChanged, dependencies, decache, decacheWithGlob}