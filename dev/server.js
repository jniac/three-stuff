const chalk = require('chalk')
const express = require('express')

const config = require('./config.js')

module.exports = () => {

    const app = express()
    app.use(express.static('.'))
    app.use(require('./serve-index.js'))

    const tryListen = port => {

        app.listen(port, () => {

            console.log(chalk`web demo on {blue http://localhost:${port}/test}`)

        }).on('error', e => {

            if (e.code === 'EADDRINUSE')
                return tryListen(++port)

            throw e
        })
    }

    tryListen(config.port)
}
