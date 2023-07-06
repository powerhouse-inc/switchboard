/*
  * This script generates the documentation for the document-model-libs package.
  * The documentation is displayed on the frontend.
  * The initial version of the documentation is residing in the package of the `api/` direcotry.
  * The output of this script is a single file with docs and a dot-file with the doc version.
  * The direcotry where the files will be placed should be placed in the `.dockerignore` file.
  */
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const PACKAGE_NAME = '@acaldas/document-model-libs'

// eslint-disable-next-line import/first
import { concatMdSync } from 'concat-md'

const API_DIR = path.resolve(__dirname, '../../api')
const DOCS_DIR = path.join(API_DIR, path.resolve('/node_modules', PACKAGE_NAME, 'dist/docs'))
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
  // make sure package exists
  try {
    execSync(`cd ${API_DIR} && npm ls ${PACKAGE_NAME}`)
  } catch (e) {
    console.warn(`Package ${PACKAGE_NAME} not found. Skipping docs generation.`)
    return
  }

  // generate docs
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
