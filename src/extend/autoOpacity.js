export default THREE => {



    function getAutoOpacity() {

    	const { __opacity:value } = this
    	return value === undefined ? 1 : value
    }

    function setAutoOpacity(value) {

    	if (value === this.__opacity)
    		return

    	this.__opacity = value
    	this.visible = value > 0

    	this.traverse(scope => {

    		const { material } = scope

    		if (material) {

    			let opacity = scope.autoOpacity

    			while (scope = scope.parent)
    				opacity *= scope.autoOpacity

    			material.opacity = opacity
    		}
    	})

    	return this
    }



    Object.assign(THREE.Object3D.prototype, {

    	getAutoOpacity,
    	setAutoOpacity,
    })

    Object.defineProperties(THREE.Object3D.prototype, {

    	autoOpacity: {

    		get: getAutoOpacity,
    		set: setAutoOpacity,
    	},
    })
}
