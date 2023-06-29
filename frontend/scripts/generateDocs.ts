import fs from 'fs'
import path from 'path'
import { concatMdSync } from 'concat-md'

const DOCS_DIR = path.resolve(__dirname, '..', 'node_modules', '@acaldas', 'document-model-libs', 'dist', 'docs')
console.log(DOCS_DIR);

function generateMdDocs (pathToDir: string, outputFilePath: string) {
  const content = concatMdSync(pathToDir, {
    fileNameAsTitle: true
  })
  fs.mkdirSync(path.dirname(outputFilePath))
  fs.writeFileSync(outputFilePath, content, { encoding: 'utf8' })
}

function main () {
  const outputFilePath = path.resolve(__dirname, '..', 'content', 'documentation', 'index.md')
  generateMdDocs(DOCS_DIR, outputFilePath)
}

main()
