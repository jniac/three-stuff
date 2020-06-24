#!/usr/bin/env node

const chokidar = require('chokidar')
const rollup = require('rollup')
const chalk = require('chalk')
const now = require('performance-now')
const path = require('path')
const fs = require('fs').promises
const prompts = require('prompts')
const filesize = require('filesize')

const config = require('./config.js')
const server = require('./server.js')

const dateToString = (date = new Date) => `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${date.toTimeString().slice(0, 8)}`

// https://rollupjs.org/guide/en/#rolluprollup
async function build() {

    config.rollup.output.banner =
        `// Three Stuff\n` +
        `// ES2020 - Build with rollup - ${dateToString()}\n`

    let rollupTime = -now()
    const bundle = await rollup.rollup(config.rollup)
    await bundle.write(config.rollup)
    rollupTime += now()

    const stats = await fs.stat(config.rollup.output.file)
    const [size, sizeUnit] = filesize(stats.size, { output:'array' })

    process.stdout.write(chalk`rollup({blue build {bold ${rollupTime.toFixed(2)}ms}, {bold ${size}${sizeUnit.toLowerCase()}}})`)
}

async function asyncTryAndCatch(taskName, callback) {

    try {
        await callback()
    } catch (e) {
        process.stdout.write('\n')
        console.log(chalk`{red ${taskName} ERROR:}`)
        console.error(chalk`{red ${e.stack}}`)
        throw e
    }
}

async function run() {

    try {

        await asyncTryAndCatch('BUILD (ROLLUP)', build)

        if (params.doCopy)
            await asyncTryAndCatch('COPY', copy)

        process.stdout.write('\n')

    } catch (e) {

        console.log(chalk`still watching...`)
    }
}

async function start() {

    run()

    chokidar.watch('./src').on('change', path => run())

    server()
}

start()
