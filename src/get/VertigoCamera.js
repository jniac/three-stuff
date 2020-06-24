let VertigoCamera

const init = THREE => {

	const {

		Camera,
		PerspectiveCamera,
		OrthographicCamera,

		Matrix4,
		Vector3,
		Quaternion,
		Euler,

	} = THREE

	const ORTHOGRAPHIC_THRESHOLD = .0001
	const TO_RAD = Math.PI / 180

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

			super()

			// allow a much more natural manipulation
			this.rotation.order = 'YXZ'

			let width = height * aspect
			let fovRef = 45
			let fov = fovRef

			const originPosition = new Vector3()
			const originRotation = new Euler(0, 0, 0)
			const originQuaternion = new Quaternion(0, 0, 0)
			const originScale = new Vector3(1, 1, 1)
			originRotation._onChangeCallback = () => originQuaternion.setFromEuler(originRotation)

			const perspectiveCamera = new PerspectiveCamera(fov, aspect)
			const orthographicCamera = new OrthographicCamera(-width / 2, width / 2, -height / 2, height / 2)

			let isOrthographic = fov < 1e-4

			const compute = () => {

				let height = width / aspect

				if (isOrthographic = fov < ORTHOGRAPHIC_THRESHOLD) {

					let w = width / 2
					let h = height / 2
					orthographicCamera.left = -w
					orthographicCamera.right = w
					orthographicCamera.bottom = -h
					orthographicCamera.top = h
					perspectiveCamera.near = near
					perspectiveCamera.far = far + width
					orthographicCamera.updateProjectionMatrix()

					originPosition.set(0, 0, width)

					this.projectionMatrix.copy(orthographicCamera.projectionMatrix)
					this.projectionMatrixInverse.copy(orthographicCamera.projectionMatrixInverse)

				} else {

					let d = (height / 2) / Math.tan(fov * TO_RAD / 2)
					perspectiveCamera.fov = fov
					perspectiveCamera.aspect = aspect
					perspectiveCamera.near = near
					perspectiveCamera.far = far + d
					perspectiveCamera.updateProjectionMatrix()

					originPosition.set(0, 0, d)

					this.projectionMatrix.copy(perspectiveCamera.projectionMatrix)
					this.projectionMatrixInverse.copy(perspectiveCamera.projectionMatrixInverse)
				}

				this.isPerspectiveCamera = !isOrthographic
				this.isOrthographicCamera = isOrthographic
			}

			const setPerspective = (value) => {

				perspective = value
				fov = fovRef * perspective

				compute()
			}

			const setViewOffset = (fullWidth, fullHeight, x, y, width, height) => {

				perspectiveCamera.setViewOffset(fullWidth, fullHeight, x, y, width, height)
				orthographicCamera.setViewOffset(fullWidth, fullHeight, x, y, width, height)

				compute()
			}

			setPerspective(perspective)

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
			})

			Object.defineProperties(this, {

				perspective: {
					enumerable: true,
					get: () => perspective,
					set: setPerspective,
				},

				width: {
					get: () => width,
					set: value => {
						width = value
						compute()
					}
				},

				height: {
					get: () => width / aspect,
					set: value => {
						width = value * aspect
						compute()
					}
				},

				aspect: {
					get: () => aspect,
					set: value => {
						aspect = value
						compute()
					}
				},

				near: {
					get: () => near,
					set: value => {
						near = value
						compute()
					}
				},

				far: {
					get: () => far,
					set: value => {
						far = value
						compute()
					}
				},

				isOrthographic: {
					get:() => isOrthographic,
				},
			})

			this.m1 = new Matrix4()
			this.m2 = new Matrix4()
		}

		updateMatrix() {

			const {
				m1, m2, camera, matrix,
				position, quaternion, scale,
				originPosition, originQuaternion, originScale,
			} = this

			m1.compose(position, quaternion, scale)
			m2.compose(originPosition, originQuaternion, originScale)
			matrix.multiplyMatrices(m1, m2)

			this.matrixWorldNeedsUpdate = true
		}
	}
}

export default (THREE) => VertigoCamera ?? init(THREE)
