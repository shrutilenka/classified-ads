// DEFINED ALIASES FOR SOME COMMON LONG NAMED FUNCTIONS
export const LIS = {
  id: function (id) {
    return document.getElementById(id)
  },
  remove: function (id) {
    document.getElementById(id).parentNode.removeChild(document.getElementById(id))
  },
  classExists: function(classNames) {
    return classNames.every((className) => {
      return document.getElementsByClassName(className).length > 0
    })
  }
}
