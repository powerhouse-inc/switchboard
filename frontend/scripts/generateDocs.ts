import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const PACKAGE_NAME = '@acaldas/document-model-libs'
// https://www.gnu.org/software/bash/manual/html_node/Exit-Status.html#:~:text=If%20a%20command%20is%20not,status%20is%20greater%20than%20zero.
const FOUND_BUT_NOT_EXECUTABLE = 126

try {
  execSync(`npm ls ${PACKAGE_NAME}`)
} catch (e) {
  console.warn(`Package ${PACKAGE_NAME} not found. Skipping docs generation.`)
  process.exit(FOUND_BUT_NOT_EXECUTABLE)
}

// eslint-disable-next-line import/first
import { concatMdSync } from 'concat-md'

const DOCS_DIR = path.resolve(__dirname, '../node_modules', PACKAGE_NAME, 'dist/docs')
const DOCS_VERSION = execSync(`npm view ${PACKAGE_NAME} version`).toString()

function generateMdDocs (pathToDir: string, outputFilePath: string) {
  const content = concatMdSync(pathToDir, {
    fileNameAsTitle: true
  })
  const dirname = path.dirname(outputFilePath)
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true })
  }
  fs.writeFileSync(outputFilePath, content, { encoding: 'utf8' })
}

function main () {
  const dirname = path.resolve(__dirname, '..', 'content', 'documentation')
  const outputFilePath = path.resolve(dirname, 'index.md')
  const outputVersionPath = path.resolve(dirname, '.version')
  if (!fs.existsSync(outputVersionPath) || fs.readFileSync(outputVersionPath, { encoding: 'utf8' }).toString() !== DOCS_VERSION) {
    console.info('Generating docs...')
    generateMdDocs(DOCS_DIR, outputFilePath)
    fs.writeFileSync(outputVersionPath, DOCS_VERSION, { encoding: 'utf8' })
  }
}

main()
