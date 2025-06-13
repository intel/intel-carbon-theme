const fs = require('fs')
require('dotenv').config()

// IN ORDER TO RUN THIS SCRIPT, FIRST YOU HAVE TO HAVE .env FILE IN THIS DIRECTORY WITH FIGMA_ACCESS_TOKEN VARIABLE
// NOTE: IT DOESN'T WORK UNDER INTEL'S VPN
// HOW TO RUN: OPEN COMMAND LINE, GO TO THIS DIRECTORY AND RUN COMMAND: node global-tokens.cjs

const accessToken = process.env.FIGMA_ACCESS_TOKEN
const fileKey = 'ufLFqcp3lcboSQA2BLvIJ6' // figma file key

const getUrl = (nodeIds, depth) => {
    return `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeIds}&depth=${depth}`
}

const mainNode = '169-0'
const mainNodeDepth = 1

const headers = {
    'X-Figma-Token': accessToken
}
const nodeToThemeMap = new Map()

fetch(getUrl(mainNode, mainNodeDepth), { headers }).then(async (mainFileResponse) => {
    const mainFileData = await mainFileResponse.json()
    const mainNodesData = mainFileData.nodes[mainNode.replace('-', ':')].document.children

    nodeToThemeMap.set(mainNodesData[0].id, 'white')
    nodeToThemeMap.set(mainNodesData[1].id, 'g-10')
    nodeToThemeMap.set(mainNodesData[2].id, 'g-90')
    nodeToThemeMap.set(mainNodesData[3].id, 'g-100')
    nodeToThemeMap.set(mainNodesData[4].id, 'tb-white')
    nodeToThemeMap.set(mainNodesData[5].id, 'tb-g-10')
    nodeToThemeMap.set(mainNodesData[6].id, 'tb-g-100')

    generateTokensDeclarations()
})

const generateTokensDeclarations = () => {
    const nodeIds = Array.from(nodeToThemeMap.keys()).reduce((prv, curr) => {
        if (prv === '') return curr
        return prv + ',' + curr
    }, '')

    const depth = 2

    fetch(getUrl(nodeIds, depth), { headers }).then(
        async (response) => {
            const data = await response.json()

            const result = []

            for (let nodeKey in data.nodes) {
                const tokensGroups = data.nodes[nodeKey].document.children

                for (let tokenGroup of tokensGroups) {
                    const groupName = tokenGroup.name

                    const groupResult = result.find((x) => x.group === groupName) || {
                        group: groupName,
                        tokens: []
                    }

                    for (let child of tokenGroup.children) {
                        if (child.componentProperties) {
                            let hexValue = ''
                            let tokenNameValue = ''
                            for (const key in child.componentProperties) {
                                if (key.startsWith('Hex')) {
                                    hexValue = child.componentProperties[key].value
                                }
                                if (key.startsWith('Token Name')) {
                                    tokenNameValue = child.componentProperties[key].value
                                }
                            }

                            if (hexValue && tokenNameValue) {
                                const mapKey = nodeKey.replace(':', '-')
                                const theme = nodeToThemeMap.get(mapKey)
                                const tokenInfo = groupResult.tokens.find(
                                    (x) => x.name === tokenNameValue
                                )
                                if (tokenInfo) {
                                    tokenInfo.themes.push({
                                        themeName: theme,
                                        value: hexValue
                                    })
                                } else {
                                    groupResult.tokens.push({
                                        name: tokenNameValue,
                                        themes: [{ themeName: theme, value: hexValue }]
                                    })
                                }
                            }
                        }
                    }

                    if (!result.some((x) => x.group === groupName)) {
                        result.push(groupResult)
                    }
                }
            }

            for (let tokensData of result) {
                // Write the output to a .ts file
                fs.writeFile(
                    `../theme-tokens/global-tokens/_${toFileName(tokensData.group)}.scss`,
                    getFileContent(tokensData.tokens),
                    function (err) {
                        if (err) {
                            return console.log(err)
                        }
                        console.log(`The file _${toFileName(tokensData.group)}.scss was saved!`)
                    }
                )
            }

            fs.writeFile(
                `../theme-tokens/global-tokens/index.scss`,
                getIndexFileContent(result),
                function (err) {
                    if (err) {
                        return console.log(err)
                    }
                    console.log(`The file index.scss was saved!`)
                }
            )
        },
        (err) => {
            console.log(`Error while fetching node ${url}`, err)
        }
    )
}

const getFileContent = (tokens) => {
    const getValue = (themeObj) => {
        const match = themeObj.value.match(/\(#([^)]+)\)/) // it extract proper value in cases like #8d8d8d@50% (#8d8d8d80)
        return match ? `#${match[1]}` : themeObj.value
    }

    const defaultThemeTokens = tokens.reduce((prev, curr) => {
        const declaration = `${curr.name.replace('$', '')}: (
        ${getValue(curr.themes[0])},
        ${getValue(curr.themes[1])},
        ${getValue(curr.themes[2])},
        ${getValue(curr.themes[3])}
    )`

        if (prev === '') {
            return declaration
        }

        return `${prev},
    ${declaration}`
    }, '')

    const tbThemeTokens = tokens.reduce((prev, curr) => {
        const declaration = `${curr.name.replace('$', '')}: (
        ${getValue(curr.themes[4])},
        ${getValue(curr.themes[5])},
        ${getValue(curr.themes[6])}
    )`

        if (prev === '') {
            return declaration
        }

        return `${prev},
    ${declaration}`
    }, '')

    return `@use '../../utils/utils' as *;

$default-theme-modes: (
    ${defaultThemeTokens}
);

$tb-theme-modes: (
    ${tbThemeTokens}
);

@include create-global-default-theme-modes($default-theme-modes);
@include create-global-tb-theme-modes($tb-theme-modes);
`
}

const getIndexFileContent = (result) => {
    return result
        .reduce((prev, curr) => {
            return (
                prev +
                `
@use './${toFileName(curr.group)}';`
            )
        }, '')
        .trim()
}

const toFileName = (groupName) => {
    return (groupName + '-tokens')
        .toLowerCase()
        .replace('/', '-')
        .replace(' + ', '-')
        .replaceAll(' ', '-')
}
