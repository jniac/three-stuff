// ShaderForge is a tiny wrapper around ShaderUtils

import ShaderUtils from './ShaderUtils.js'

let current = null

const forge = {

    with(program) {

        current = program
        return forge
    },

    inject(name, tag, injected, options) {

        current[name] = ShaderUtils.inject(current[name], tag, injected, options)
        return forge
    },

    injectVert(tag, injected, options) {

        return forge.inject('vertexShader', tag, injected, options)
    },

    injectFrag(tag, injected, options) {

        return forge.inject('fragmentShader', tag, injected, options)
    },

    injectFragUniforms(uniforms) {

        uniforms = ShaderUtils.safeUniforms(uniforms)

        current.uniforms = {
            ...uniforms,
            ...current.uniforms,
        }

        current.fragmentShader = ShaderUtils.injectUniforms(current.fragmentShader, uniforms)
        return forge
    },

    done({ log = false } = {}) {

        const program = current
        current = null

        if (log)
            console.log(`// ShaderForge:\n${program}`)

        return program
    }
}

export default forge
