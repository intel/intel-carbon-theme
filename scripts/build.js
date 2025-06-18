const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')

// Create dist directory if it doesn't exist
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

// Copy style folder if it exists
if (fs.existsSync('style')) {
    console.log('Copying style folder...')
    fs.copySync('style', 'dist/style')
    console.log('Copied: style -> dist/style')
}

// Copy LICENSE.md file if it exists
if (fs.existsSync('LICENSE.md')) {
    console.log('Copying LICENSE.md file...')
    fs.copySync('LICENSE.md', 'dist/LICENSE.md')
    console.log('Copied: LICENSE.md -> dist/LICENSE.md')
}

// Copy README.md file if it exists
if (fs.existsSync('README.md')) {
    console.log('Copying README.md file...')
    fs.copySync('README.md', 'dist/README.md')
    console.log('Copied: README.md -> dist/README.md')
}

console.log('Build completed successfully!')
