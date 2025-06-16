// Script to analyze the CSS tokens usage in the project
// run npm run build:css
// then node style/scripts/tokens-validator.js
const fs = require('fs')
const path = require('path')

/**
 * Extract CSS tokens and check for undefined ones
 * @param {string} cssFilePath - Path to the CSS file
 * @returns {Object} Object containing token analysis results
 */
function extractCSSTokens(cssFilePath) {
    // Check if file exists
    if (!fs.existsSync(cssFilePath)) {
        console.error(`File not found: ${cssFilePath}`)
        return null
    }

    try {
        // Read file content
        const content = fs.readFileSync(cssFilePath, 'utf8')

        // Remove comments from CSS
        const contentWithoutComments = content.replace(/\/\*[\s\S]*?\*\//g, '')

        // Find all defined custom properties (--token: value;) including those with interpolation
        const definedTokens = []

        // Standard token definition pattern
        const standardRegex = /--([a-zA-Z0-9_-]+)\s*:/g
        let match

        while ((match = standardRegex.exec(contentWithoutComments)) !== null) {
            definedTokens.push(match[1])
        }

        // Interpolated token definition pattern like --#{$prefix}-token
        const interpolatedRegex = /--#{\$[a-zA-Z0-9_-]+}-([a-zA-Z0-9_-]+)\s*:/g

        while ((match = interpolatedRegex.exec(contentWithoutComments)) !== null) {
            definedTokens.push(match[1])
        }

        // Find all used custom properties in var() functions
        const usedTokens = []

        // Standard var(--token) pattern
        const varRegex = /var\(--([a-zA-Z0-9_-]+)[,)]/g

        while ((match = varRegex.exec(contentWithoutComments)) !== null) {
            usedTokens.push(match[1])
        }

        // get-var(token) pattern (without -- prefix)
        const getVarRegex = /get-var\(([a-zA-Z0-9_-]+)[,)]/g

        while ((match = getVarRegex.exec(contentWithoutComments)) !== null) {
            usedTokens.push(match[1])
        }

        // Find tokens used but not defined
        const undefinedTokens = [
            ...new Set(usedTokens.filter((token) => !definedTokens.includes(token)))
        ].sort()

        // Find tokens defined but not used
        const unusedTokens = [
            ...new Set(definedTokens.filter((token) => !usedTokens.includes(token)))
        ].sort()

        // Find tokens that are both defined and used (properly used tokens)
        const properlyUsedTokens = [
            ...new Set(definedTokens.filter((token) => usedTokens.includes(token)))
        ].sort()

        // Return results
        return {
            definedTokens: [...new Set(definedTokens)].sort(),
            usedTokens: [...new Set(usedTokens)].sort(),
            undefinedTokens,
            unusedTokens,
            properlyUsedTokens
        }
    } catch (error) {
        console.error(`Error processing CSS file: ${error.message}`)
        return null
    }
}

// Path to your CSS file
const cssFile = path.resolve(__dirname, '../../styles.css')
// Output file path
const outputFile = path.resolve(__dirname, '../../css-token-analysis.txt')

// Get tokens and display them
try {
    const results = extractCSSTokens(cssFile)

    if (!results) {
        process.exit(1)
    }

    // Create an array to store output lines
    const outputLines = []
    outputLines.push('===== CSS TOKEN ANALYSIS =====')

    outputLines.push('')
    outputLines.push('UNDEFINED TOKENS:')
    outputLines.push('The following tokens are used but have no definition:')

    if (results.undefinedTokens.length > 0) {
        results.undefinedTokens.forEach((token) => {
            outputLines.push(`  --${token}`)
        })
        outputLines.push('')
        outputLines.push(`Total undefined tokens: ${results.undefinedTokens.length}`)
    } else {
        outputLines.push('  No undefined tokens found - all tokens are properly defined.')
    }

    outputLines.push('')
    outputLines.push('UNUSED TOKENS:')
    outputLines.push('The following tokens are defined but never used:')

    if (results.unusedTokens.length > 0) {
        results.unusedTokens.forEach((token) => {
            outputLines.push(`  --${token}`)
        })
        outputLines.push('')
        outputLines.push(`Total unused tokens: ${results.unusedTokens.length}`)
    } else {
        outputLines.push('  No unused tokens found - all defined tokens are being used.')
    }

    outputLines.push('')
    outputLines.push('PROPERLY USED TOKENS:')
    outputLines.push('The following tokens are correctly defined and used in the CSS file:')

    if (results.properlyUsedTokens.length > 0) {
        results.properlyUsedTokens.forEach((token) => {
            outputLines.push(`  --${token}`)
        })
        outputLines.push('')
        outputLines.push(`Total properly used tokens: ${results.properlyUsedTokens.length}`)
    } else {
        outputLines.push('  No properly defined tokens are being used.')
    }

    outputLines.push('')
    outputLines.push('TOKEN STATISTICS:')
    outputLines.push(`  Defined tokens: ${results.definedTokens.length}`)
    outputLines.push(
        `  Properly used tokens (defined + used): ${results.properlyUsedTokens.length}`
    )
    outputLines.push(`  Undefined tokens: ${results.undefinedTokens.length}`)
    outputLines.push(`  Unused tokens: ${results.unusedTokens.length}`)

    // Write output to both console and file
    const outputText = outputLines.join('\n')
    console.log(outputText)
    fs.writeFileSync(outputFile, outputText, 'utf8')

    console.log(`\nAnalysis results saved to: ${outputFile}`)
} catch (error) {
    console.error(`Error executing script: ${error.message}`)
}
