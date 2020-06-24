
/**
 * append new lines in an existing shader program (vertex/fragment)
 * @param  {String} program  the current program
 * @param  {String} tag      tag: eg. "common", "aomap_fragment"
 * @param  {String} injected the code to inject
 * @return {String}          the modified program
 */
const inject = (program, tag, injected, { injectBefore = false } = {}) => {

    const pattern = `\s*#include <${tag}>\s*\n?`
    const re = new RegExp(pattern)
    const match = program.match(re)

    if (!match) {

        console.log(`Could not match ${re}, program kept unchanged.`)
        return program
    }

    const index = match.index + (injectBefore ? 0 : match[0].length)

    return (
        program.slice(0, index) +
        `// ShaderUtils @ "<${tag}>":\n` +
        injected + '\n' +
        program.slice(index)
    )
}

const getGLType = value => {

    if (value === null || value === undefined)
        return null

    if (typeof value === 'number')
        return 'float'

    if (value.isVector2)
        return 'vec2'

    if (value.isVector3)
        return 'vec3'

    if (value.isColor)
        return 'vec3'

    if (value.isVector4)
        return 'vec4'
}

const safeUniforms = uniforms => {

    const output = {}

    for (const [key, uniform] of Object.entries(uniforms)) {

        output[key] = uniform && typeof uniform === 'object' && 'value' in uniform ?
            uniform : { value:uniform }
    }

    return output
}

const injectUniforms = (program, uniforms) => {

    const lines = []

    for (const [key, uniform] of Object.entries(uniforms)) {

        const type = getGLType(uniform.value)

        if (!type)
            throw new Error(`injectUniforms() cannot handle uniform "${key}"(${uniform.value?.constructor.name})`)

        lines.push(`uniform ${type} ${key};`)
    }

    return inject(program, 'common', lines.join('\n'), { injectBefore:true })
}

export default {
    inject,
    safeUniforms,
    injectUniforms,
    getGLType,
}
