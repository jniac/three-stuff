
import ShaderUtils from '../shaders/ShaderUtils.js'
import ShaderForge from '../shaders/ShaderForge.js'

export default THREE => {



    function makeChecker({

        checkerColor1 = '#222',
        checkerColor2 = '#ddd',
        checkerSize = 8,

    }) {

        this.defines = {
            USE_MAP: '',
            ...this.defines
        }

        this.onBeforeCompile = shader => {

            ShaderForge
            .with(shader)
            .injectFragUniforms({
                checkerColor1: new THREE.Color(checkerColor1),
                checkerColor2: new THREE.Color(checkerColor2),
                checkerSize: checkerSize,
            })
            .injectFrag('color_fragment', /* glsl */`
                vec2 p = mod(floor(vUv * checkerSize), 2.0);
                diffuseColor.rgb = (p.x + p.y == 1.0 ? checkerColor1 : checkerColor2);
                diffuseColor.a = 1.0;
            `)
        }

        return this
    }

    Object.assign(THREE.Material.prototype, {
        makeChecker,
    })
}
