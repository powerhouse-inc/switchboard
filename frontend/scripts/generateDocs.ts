import fs from 'fs'
import path from 'path'
import { concatMdSync } from 'concat-md'

const DOCS_DIR = process.env.DOCS_DIR

function generateMdDocs (pathToDir: string, outputFilePath: string) {
  const content = concatMdSync(pathToDir, {
    fileNameAsTitle: true
  })
  fs.mkdirSync(path.dirname(outputFilePath))
  fs.writeFileSync(outputFilePath, content, { encoding: 'utf8' })
}

function main () {
  if (!DOCS_DIR) {
    throw new Error('Please provide DOCS_DIR env variable which points to documentation directory')
  }
  const pathToDir = path.resolve(DOCS_DIR)
  const outputFilePath = path.resolve(__dirname, '..', 'content', 'documentation', 'index.md')
  generateMdDocs(pathToDir, outputFilePath)
}

main()
