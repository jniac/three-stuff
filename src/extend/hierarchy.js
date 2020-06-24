export default THREE => {



    function addTo(parent) {

        parent.add(this)

        return this
    }

    function removeFromParent() {

        this.parent?.remove(this)

        return this
    }

    function traverseVisible(callback) {

        if (!this.visible)
            return this

        callback(this)

        for (const child of this.children)
            child.traverseVisible(callback)

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
    })
}
