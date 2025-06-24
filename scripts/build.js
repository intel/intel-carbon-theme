const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')

//Delete and create the dist directory
if (fs.existsSync('dist')) {
    console.log('Removing existing dist directory...')
    fs.removeSync('dist')
}
console.log('Creating dist directory...')
fs.ensureDirSync('dist')

// Copy all CSS files
console.log('Copying CSS files...')
glob.sync('**/*.css').forEach((file) => {
    if (!file.includes('node_modules') && !file.startsWith('dist/')) {
        const destPath = path.join('dist', file)
        fs.ensureDirSync(path.dirname(destPath))
        fs.copySync(file, destPath)
        console.log(`Copied: ${file} -> ${destPath}`)
    }
})

// Copy all SCSS files
console.log('Copying SCSS files...')
glob.sync('**/*.scss').forEach((file) => {
    if (!file.includes('node_modules') && !file.startsWith('dist/')) {
        const destPath = path.join('dist', file)
        fs.ensureDirSync(path.dirname(destPath))
        fs.copySync(file, destPath)
        console.log(`Copied: ${file} -> ${destPath}`)
    }
})

const elementsToCopy = ['style', 'LICENSE.md', 'README.md', 'package.json', 'CHANGELOG.md']

elementsToCopy.forEach((element) => {
    if (fs.existsSync(element)) {
        console.log(`Copying ${element}...`)
        fs.copySync(element, path.join('dist', element))
        console.log(`Copied: ${element} -> dist/${element}`)
    } else {
        console.warn(`Warning: ${element} does not exist and will not be copied.`)
    }
})

console.log('Build completed successfully!')
