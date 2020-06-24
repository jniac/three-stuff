import autoOpacity from './autoOpacity.js'
import hierarchy from './hierarchy.js'
import positionScaleRotation from './positionScaleRotation.js'
import assign from './assign.js'
import materialChecker from './materialChecker.js'

let THREE = null

export default THREE_value => {

    if (!THREE) {

        THREE = THREE_value

        autoOpacity(THREE)
        hierarchy(THREE)
        positionScaleRotation(THREE)
        assign(THREE)
        materialChecker(THREE)
    }
}
