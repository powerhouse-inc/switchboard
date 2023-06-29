import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const PACAKGE_NAME = '@acaldas/document-model-libs'

try {
  execSync(`npm ls ${PACAKGE_NAME}`)
} catch (e) {
  throw new Error(`Failed to generate documentation from the dependency (${PACAKGE_NAME}), did you run \`npm install\`?`)
}

import { concatMdSync } from 'concat-md'

const DOCS_DIR = path.resolve(__dirname, '..', 'node_modules', '@acaldas', 'document-model-libs', 'dist', 'docs')
const DOCS_VERSION = execSync(`npm view ${PACAKGE_NAME} version`).toString()

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
  }
  fs.writeFileSync(outputVersionPath, DOCS_VERSION, { encoding: 'utf8' })
}

main()
