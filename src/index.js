
import extend from './extend/index.js'
import * as getBundle from './get/index.js'

let THREE = null

const init = THREE_value => {

    if (!THREE) {

        THREE = THREE_value
        extend(THREE)
    }
}

const module = {
    init,
}

for (const [key, value] of Object.entries(getBundle)) {

    Object.defineProperty(module, key, {

        get: () => {

            if (!THREE)
                throw new Error(`cannot get "${key}", please init with a THREE reference first!`)

            return value(THREE)
        }
    })
}

export default module
