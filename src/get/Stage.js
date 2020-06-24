import getVertigoCamera from './VertigoCamera.js'

let Stage = null

const init = THREE => {

    return Stage = function Stage({

        canvas,
        renderer,
        scene,
        camera,
        width = window.innerWidth,
        height = window.innerHeight,
        aspect = width / height,
        pixelRatio = window.devicePixelRatio,
        autoPauseDelay = 10,
        ...options

    } = {}) {

        if (!renderer) {

            renderer = new THREE.WebGLRenderer({ alpha:true, canvas })
            renderer.autoClear = false
            renderer.setClearColor(0x000000, 0)
            renderer.setPixelRatio(pixelRatio)
            renderer.setSize(width * pixelRatio, height * pixelRatio, false)
            renderer.toneMapping = THREE.LinearToneMapping
            renderer.outputEncoding = THREE.sRGBEncoding
        }

        if (!camera) {
            camera = new (getVertigoCamera(THREE))({ aspect, height:1.2, perspective:1 })
        }

        if (!scene) {
            scene = new THREE.Scene()
        }

        Object.defineProperties(this, {
            renderer: { value:renderer },
            camera: { value:camera },
            scene: { value:scene },
        })

        let time = 0
        let frame = 0
        let timeScale = 1
        let deltaTime = -1
        let autoPauseTime = 0
        let paused = false

        const onUpdate = new Set()

        Object.defineProperties(this, {

            time: { get:() => time },
            frame: { get:() => frame },
            deltaTime: { get:() => deltaTime },

            timeScale: {
                get: () => timeScale,
                set: value => timeScale = value,
            },

            autoPauseDelay: {
                get: () => autoPauseDelay,
                set: value => autoPauseDelay = value,
            },

            paused: {
                get: () => paused,
                set: value => paused = !!value,
            },

            onUpdate: { value:onUpdate },
        })

        const resetAutoPause = () => autoPauseTime = 0

        for (const name of [
            'mousemove',
            'mousedown',
            'mouseup',
            'touchstart',
            'touchmove',
        ]) {

            renderer.domElement.addEventListener(name, resetAutoPause)
        }

        const update = () => {

            requestAnimationFrame(update)

            if (paused)
                return

            deltaTime = 1 / 60 * timeScale

            if (autoPauseTime > autoPauseDelay)
                return

            try {

                // update

                for (const callback of onUpdate)
                    callback(this)

                scene.traverse(child => child.onUpdate?.(this))

                renderer.render(scene, camera)

            } catch(e) {

                console.error(e)
                paused = true
            }

            time += deltaTime
            autoPauseTime += 1 / 60
            frame++
        }

        update()
    }
}

export default (THREE) => Stage ?? init(THREE)
