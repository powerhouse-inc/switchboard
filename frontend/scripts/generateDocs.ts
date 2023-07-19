/*
  * This script generates documentation for the PACKAGE_NAME
  * package, see frontend/README.md for more info on how to use it
  */
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { concatMdSync } from 'concat-md'

const PACKAGE_NAME = '@acaldas/document-model-libs'
const DOCS_LOCATION = 'dist/docs'
const API_DIR = path.resolve(__dirname, '../../api')
const DOCS_DIR = path.join(API_DIR, '/node_modules', PACKAGE_NAME, DOCS_LOCATION)
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
  if (fs.existsSync(outputVersionPath) && fs.readFileSync(outputVersionPath, { encoding: 'utf8' }).toString() === DOCS_VERSION) {
    console.info('Docs generation skipped: version has not changed')
  }
  console.info(`Generating docs v${DOCS_VERSION}...`)
  generateMdDocs(DOCS_DIR, outputFilePath)
  fs.writeFileSync(outputVersionPath, DOCS_VERSION, { encoding: 'utf8' })
  console.info('...done')
}

main()
