const Path = require('path')
const fs = require('fs').promises

const safeStat = async path => {

    try {
        return await fs.stat(path)
    } catch (e) {
        return null
    }
}

module.exports = async (req, res, next) => {

    const path = Path.join(process.cwd(), req.url)
    const stats = await safeStat(path)

    if (stats?.isDirectory()) {

        const files = (await fs.readdir(path))
            .filter(name => name[0] !== '.')
            .map(file => /* html */`<div><a href="${file}">${file}</a></div>`)
            .join('\n')

        const html = /* html */`
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>req.url</title>
                    <style media="screen">
                        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100;0,300;0,400;0,500;0,700;1,100;1,300;1,400;1,500;1,700&display=swap');
                        body {
                            font-family: 'Roboto Mono', monospace;
                        }
                        div {
                            padding: 4px;
                        }
                    </style>
                </head>
                <body>
                    ${files}
                </body>
            </html>`

        return res.send(html)
    }

    next()
}
