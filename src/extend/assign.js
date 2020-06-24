export default THREE => {



    function assign(props) {

        Object.assign(this, props)

        return this
    }



    Object.assign(THREE.Object3D.prototype, {

    	assign,
    })
}
