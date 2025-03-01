const { withAppBuildGradle } = require('@expo/config-plugins')

/**
 * A Config Plugin to disable bundle compression in Android build.gradle.
 * @param {import('@expo/config-plugins').ConfigPlugin} config
 * @returns {import('@expo/config-plugins').ConfigPlugin}
 */
const withDisableBundleCompression = (config) => {
  return withAppBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents

    const hasAndroidResources = buildGradle.includes('androidResources {')
    const hasNoCompress = buildGradle.includes('noCompress')

    if (hasAndroidResources && hasNoCompress) {
      if (
        buildGradle.includes('noCompress += ["bundle"]') ||
        buildGradle.includes("noCompress += 'bundle'") ||
        buildGradle.includes('noCompress += "bundle"')
      ) {
        return config
      }

      const lines = buildGradle.split('\n')
      const modifiedLines = lines.map((line) => {
        if (line.trim().startsWith('noCompress')) {
          if (line.includes('+=')) {
            return line.replace(/\]/, ', "bundle"]')
          } else if (line.includes('=')) {
            return line.replace('=', '+= ["bundle",') + ']'
          }
        }
        return line
      })
      config.modResults.contents = modifiedLines.join('\n')
    } else {
      const androidBlock = buildGradle.indexOf('android {')
      if (androidBlock !== -1) {
        const insertPosition = buildGradle.indexOf('\n', androidBlock) + 1
        const newContent =
          buildGradle.slice(0, insertPosition) +
          '    androidResources {\n' +
          '        noCompress += ["bundle"]\n' +
          '    }\n' +
          buildGradle.slice(insertPosition)

        config.modResults.contents = newContent
      }
    }

    return config
  })
}

module.exports = withDisableBundleCompression
