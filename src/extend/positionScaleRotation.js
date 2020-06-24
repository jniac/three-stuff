const rad = x => x * Math.PI / 180
const deg = x => x * 180 / Math.PI

export default THREE => {



    function setPosition(x, y, z) {

        if (x.isVector3) {
			z = x.z
			y = x.y
			x = x.x
		}

		this.position.set(x, y, z)

		return this
	}

	function setScale(s) {

		this.scale.set(s, s, s)

		return this
	}

	function setRotation(x, y, z, order = undefined) {

		if (x.isEuler || x.isVector3) {
			z = x.z
			y = x.y
			x = x.x
		}

		this.rotation.set(rad(x), rad(y), rad(z), order)

		return this
	}



    Object.assign(THREE.Object3D.prototype, {

    	setPosition,
		setScale,
    	setRotation,
    })

	Object.defineProperties(THREE.Object3D.prototype, {

		px: {
			get() { return this.position.x },
			set(value) { this.position.x = value },
		},

		py: {
			get() { return this.position.y },
			set(value) { this.position.y = value },
		},

		pz: {
			get() { return this.position.z },
			set(value) { this.position.z = value },
		},

		sxyz: {
			get() { return this.scale.x },
			set(value) { this.scale.set(value, value, value) },
		},

		rx: {
			get() { return deg(this.rotation.x) },
			set(value) { this.rotation.x = rad(value) },
		},

		ry: {
			get() { return deg(this.rotation.y) },
			set(value) { this.rotation.y = rad(value) },
		},

		rz: {
			get() { return deg(this.rotation.z) },
			set(value) { this.rotation.z = rad(value) },
		},
	})}
