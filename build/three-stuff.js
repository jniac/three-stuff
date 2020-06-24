// Three Stuff
// ES2020 - Build with rollup - 2020/06/24 18:21:37

var autoOpacity = THREE => {



    function getAutoOpacity() {

    	const { __opacity:value } = this;
    	return value === undefined ? 1 : value
    }

    function setAutoOpacity(value) {

    	if (value === this.__opacity)
    		return

    	this.__opacity = value;
    	this.visible = value > 0;

    	this.traverse(scope => {

    		const { material } = scope;

    		if (material) {

    			let opacity = scope.autoOpacity;

    			while (scope = scope.parent)
    				opacity *= scope.autoOpacity;

    			material.opacity = opacity;
    		}
    	});

    	return this
    }



    Object.assign(THREE.Object3D.prototype, {

    	getAutoOpacity,
    	setAutoOpacity,
    });

    Object.defineProperties(THREE.Object3D.prototype, {

    	autoOpacity: {

    		get: getAutoOpacity,
    		set: setAutoOpacity,
    	},
    });
};

var hierarchy = THREE => {



    function addTo(parent) {

        parent.add(this);

        return this
    }

    function removeFromParent() {

        this.parent?.remove(this);

        return this
    }

    function traverseVisible(callback) {

        if (!this.visible)
            return this

        callback(this);

        for (const child of this.children)
            child.traverseVisible(callback);

        return this
    }

    function isParentOf(child, { includeSelf = true } = {}) {

        if (includeSelf && child === this)
            return true

        while (child = child.parent) {

            if (child === this)
                return true
        }

        return false
    }

    function isChildOf(parent, { includeSelf = true } = {}) {

        return !!parent?.isParentOf(this, { includeSelf })
    }

    

    Object.assign(THREE.Object3D.prototype, {

    	addTo,
		removeFromParent,
    	traverseVisible,
        isParentOf,
        isChildOf,
    });
};

const rad = x => x * Math.PI / 180;
const deg = x => x * 180 / Math.PI;

var positionScaleRotation = THREE => {



    function setPosition(x, y, z) {

        if (x.isVector3) {
			z = x.z;
			y = x.y;
			x = x.x;
		}

		this.position.set(x, y, z);

		return this
	}

	function setScale(s) {

		this.scale.set(s, s, s);

		return this
	}

	function setRotation(x, y, z, order = undefined) {

		if (x.isEuler || x.isVector3) {
			z = x.z;
			y = x.y;
			x = x.x;
		}

		this.rotation.set(rad(x), rad(y), rad(z), order);

		return this
	}



    Object.assign(THREE.Object3D.prototype, {

    	setPosition,
		setScale,
    	setRotation,
    });

	Object.defineProperties(THREE.Object3D.prototype, {

		px: {
			get() { return this.position.x },
			set(value) { this.position.x = value; },
		},

		py: {
			get() { return this.position.y },
			set(value) { this.position.y = value; },
		},

		pz: {
			get() { return this.position.z },
			set(value) { this.position.z = value; },
		},

		sxyz: {
			get() { return this.scale.x },
			set(value) { this.scale.set(value, value, value); },
		},

		rx: {
			get() { return deg(this.rotation.x) },
			set(value) { this.rotation.x = rad(value); },
		},

		ry: {
			get() { return deg(this.rotation.y) },
			set(value) { this.rotation.y = rad(value); },
		},

		rz: {
			get() { return deg(this.rotation.z) },
			set(value) { this.rotation.z = rad(value); },
		},
	});};

var assign = THREE => {



    function assign(props) {

        Object.assign(this, props);

        return this
    }



    Object.assign(THREE.Object3D.prototype, {

    	assign,
    });
};

/**
 * append new lines in an existing shader program (vertex/fragment)
 * @param  {String} program  the current program
 * @param  {String} tag      tag: eg. "common", "aomap_fragment"
 * @param  {String} injected the code to inject
 * @return {String}          the modified program
 */
const inject = (program, tag, injected, { injectBefore = false } = {}) => {

    const pattern = `\s*#include <${tag}>\s*\n?`;
    const re = new RegExp(pattern);
    const match = program.match(re);

    if (!match) {

        console.log(`Could not match ${re}, program kept unchanged.`);
        return program
    }

    const index = match.index + (injectBefore ? 0 : match[0].length);

    return (
        program.slice(0, index) +
        `// ShaderUtils @ "<${tag}>":\n` +
        injected + '\n' +
        program.slice(index)
    )
};

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
};

const safeUniforms = uniforms => {

    const output = {};

    for (const [key, uniform] of Object.entries(uniforms)) {

        output[key] = uniform && typeof uniform === 'object' && 'value' in uniform ?
            uniform : { value:uniform };
    }

    return output
};

const injectUniforms = (program, uniforms) => {

    const lines = [];

    for (const [key, uniform] of Object.entries(uniforms)) {

        const type = getGLType(uniform.value);

        if (!type)
            throw new Error(`injectUniforms() cannot handle uniform "${key}"(${uniform.value?.constructor.name})`)

        lines.push(`uniform ${type} ${key};`);
    }

    return inject(program, 'common', lines.join('\n'), { injectBefore:true })
};

var ShaderUtils = {
    inject,
    safeUniforms,
    injectUniforms,
    getGLType,
};

// ShaderForge is a tiny wrapper around ShaderUtils

let current = null;

const forge = {

    with(program) {

        current = program;
        return forge
    },

    inject(name, tag, injected, options) {

        current[name] = ShaderUtils.inject(current[name], tag, injected, options);
        return forge
    },

    injectVert(tag, injected, options) {

        return forge.inject('vertexShader', tag, injected, options)
    },

    injectFrag(tag, injected, options) {

        return forge.inject('fragmentShader', tag, injected, options)
    },

    injectFragUniforms(uniforms) {

        uniforms = ShaderUtils.safeUniforms(uniforms);

        current.uniforms = {
            ...uniforms,
            ...current.uniforms,
        };

        current.fragmentShader = ShaderUtils.injectUniforms(current.fragmentShader, uniforms);
        return forge
    },

    done({ log = false } = {}) {

        const program = current;
        current = null;

        if (log)
            console.log(`// ShaderForge:\n${program}`);

        return program
    }
};

var materialChecker = THREE => {



    function makeChecker({

        checkerColor1 = '#222',
        checkerColor2 = '#ddd',
        checkerSize = 8,

    }) {

        this.defines = {
            USE_MAP: '',
            ...this.defines
        };

        this.onBeforeCompile = shader => {

            forge
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
            `);
        };

        return this
    }

    Object.assign(THREE.Material.prototype, {
        makeChecker,
    });
};

let THREE = null;

var extend = THREE_value => {

    if (!THREE) {

        THREE = THREE_value;

        autoOpacity(THREE);
        hierarchy(THREE);
        positionScaleRotation(THREE);
        assign(THREE);
        materialChecker(THREE);
    }
};

let VertigoCamera;

const init = THREE => {

	const {

		Camera,
		PerspectiveCamera,
		OrthographicCamera,

		Matrix4,
		Vector3,
		Quaternion,
		Euler,

	} = THREE;

	const ORTHOGRAPHIC_THRESHOLD = .0001;
	const TO_RAD = Math.PI / 180;

	return VertigoCamera = class VertigoCamera extends Camera {

		constructor({

			name = '',
			perspective = 1,
			aspect = 1,
			height = 9,

			// default value in THREE
			near = .1,
			far = 2000,

		} = {}) {

			super();

			// allow a much more natural manipulation
			this.rotation.order = 'YXZ';

			let width = height * aspect;
			let fovRef = 45;
			let fov = fovRef;

			const originPosition = new Vector3();
			const originRotation = new Euler(0, 0, 0);
			const originQuaternion = new Quaternion(0, 0, 0);
			const originScale = new Vector3(1, 1, 1);
			originRotation._onChangeCallback = () => originQuaternion.setFromEuler(originRotation);

			const perspectiveCamera = new PerspectiveCamera(fov, aspect);
			const orthographicCamera = new OrthographicCamera(-width / 2, width / 2, -height / 2, height / 2);

			let isOrthographic = fov < 1e-4;

			const compute = () => {

				let height = width / aspect;

				if (isOrthographic = fov < ORTHOGRAPHIC_THRESHOLD) {

					let w = width / 2;
					let h = height / 2;
					orthographicCamera.left = -w;
					orthographicCamera.right = w;
					orthographicCamera.bottom = -h;
					orthographicCamera.top = h;
					perspectiveCamera.near = near;
					perspectiveCamera.far = far + width;
					orthographicCamera.updateProjectionMatrix();

					originPosition.set(0, 0, width);

					this.projectionMatrix.copy(orthographicCamera.projectionMatrix);
					this.projectionMatrixInverse.copy(orthographicCamera.projectionMatrixInverse);

				} else {

					let d = (height / 2) / Math.tan(fov * TO_RAD / 2);
					perspectiveCamera.fov = fov;
					perspectiveCamera.aspect = aspect;
					perspectiveCamera.near = near;
					perspectiveCamera.far = far + d;
					perspectiveCamera.updateProjectionMatrix();

					originPosition.set(0, 0, d);

					this.projectionMatrix.copy(perspectiveCamera.projectionMatrix);
					this.projectionMatrixInverse.copy(perspectiveCamera.projectionMatrixInverse);
				}

				this.isPerspectiveCamera = !isOrthographic;
				this.isOrthographicCamera = isOrthographic;
			};

			const setPerspective = (value) => {

				perspective = value;
				fov = fovRef * perspective;

				compute();
			};

			const setViewOffset = (fullWidth, fullHeight, x, y, width, height) => {

				perspectiveCamera.setViewOffset(fullWidth, fullHeight, x, y, width, height);
				orthographicCamera.setViewOffset(fullWidth, fullHeight, x, y, width, height);

				compute();
			};

			setPerspective(perspective);

			Object.assign(this, {
				name,
				isVertigoCamera: true,
				originPosition,
				originRotation,
				originQuaternion,
				originScale,
				orthographicCamera,
				perspectiveCamera,
				setViewOffset,
			});

			Object.defineProperties(this, {

				perspective: {
					enumerable: true,
					get: () => perspective,
					set: setPerspective,
				},

				width: {
					get: () => width,
					set: value => {
						width = value;
						compute();
					}
				},

				height: {
					get: () => width / aspect,
					set: value => {
						width = value * aspect;
						compute();
					}
				},

				aspect: {
					get: () => aspect,
					set: value => {
						aspect = value;
						compute();
					}
				},

				near: {
					get: () => near,
					set: value => {
						near = value;
						compute();
					}
				},

				far: {
					get: () => far,
					set: value => {
						far = value;
						compute();
					}
				},

				isOrthographic: {
					get:() => isOrthographic,
				},
			});

			this.m1 = new Matrix4();
			this.m2 = new Matrix4();
		}

		updateMatrix() {

			const {
				m1, m2, camera, matrix,
				position, quaternion, scale,
				originPosition, originQuaternion, originScale,
			} = this;

			m1.compose(position, quaternion, scale);
			m2.compose(originPosition, originQuaternion, originScale);
			matrix.multiplyMatrices(m1, m2);

			this.matrixWorldNeedsUpdate = true;
		}
	}
};

var getVertigoCamera = (THREE) => VertigoCamera ?? init(THREE);

let Stage = null;

const init$1 = THREE => {

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

            renderer = new THREE.WebGLRenderer({ alpha:true, canvas });
            renderer.autoClear = false;
            renderer.setClearColor(0x000000, 0);
            renderer.setPixelRatio(pixelRatio);
            renderer.setSize(width * pixelRatio, height * pixelRatio, false);
            renderer.toneMapping = THREE.LinearToneMapping;
            renderer.outputEncoding = THREE.sRGBEncoding;
        }

        if (!camera) {
            camera = new (getVertigoCamera(THREE))({ aspect, height:1.2, perspective:1 });
        }

        if (!scene) {
            scene = new THREE.Scene();
        }

        Object.defineProperties(this, {
            renderer: { value:renderer },
            camera: { value:camera },
            scene: { value:scene },
        });

        let time = 0;
        let frame = 0;
        let timeScale = 1;
        let deltaTime = -1;
        let autoPauseTime = 0;
        let paused = false;

        const onUpdate = new Set();

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
        });

        const resetAutoPause = () => autoPauseTime = 0;

        for (const name of [
            'mousemove',
            'mousedown',
            'mouseup',
            'touchstart',
            'touchmove',
        ]) {

            renderer.domElement.addEventListener(name, resetAutoPause);
        }

        const update = () => {

            requestAnimationFrame(update);

            if (paused)
                return

            deltaTime = 1 / 60 * timeScale;

            if (autoPauseTime > autoPauseDelay)
                return

            try {

                // update

                for (const callback of onUpdate)
                    callback(this);

                scene.traverse(child => child.onUpdate?.(this));

                renderer.render(scene, camera);

            } catch(e) {

                console.error(e);
                paused = true;
            }

            time += deltaTime;
            autoPauseTime += 1 / 60;
            frame++;
        };

        update();
    }
};

var Stage$1 = (THREE) => Stage ?? init$1(THREE);

var getBundle = /*#__PURE__*/Object.freeze({
    __proto__: null,
    VertigoCamera: getVertigoCamera,
    Stage: Stage$1
});

let THREE$1 = null;

const init$2 = THREE_value => {

    if (!THREE$1) {

        THREE$1 = THREE_value;
        extend(THREE$1);
    }
};

const module = {
    init: init$2,
};

for (const [key, value] of Object.entries(getBundle)) {

    Object.defineProperty(module, key, {

        get: () => {

            if (!THREE$1)
                throw new Error(`cannot get "${key}", please init with a THREE reference first!`)

            return value(THREE$1)
        }
    });
}

export default module;
