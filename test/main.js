import * as THREE from './three.module.js'
import ThreeStuff from '../build/three-stuff.js'

ThreeStuff.init(THREE)

const canvas = document.querySelector('canvas')

const stage = new ThreeStuff.Stage({

    canvas,
    autoPauseDelay: 10,
})

// stage.onUpdate.add(({ frame }) => console.log({ frame }))

class Dot extends THREE.Object3D {

    constructor(props) {

        super()

        this.assign(props)

        new THREE.Mesh(
            new THREE.IcosahedronBufferGeometry(.1, 3),
            new THREE.MeshBasicMaterial({
            // new THREE.MeshPhysicalMaterial({
                color:'red',
                // wireframe: true,
            })
            .makeChecker({ checkerColor2:'blue' }),
        )
        .addTo(this)
    }
}

new Dot({

    onUpdate({ deltaTime, time }) {

        this.ry += deltaTime * 180
        this.px = Math.sin(time * 1) * .3
    },
})
.setPosition(0, .1, 0)
.addTo(stage.scene)

Object.assign(window, {
    stage,
    THREE,
})
