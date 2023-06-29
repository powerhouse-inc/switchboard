import fs from 'fs'
import path from 'path'
import { concatMdSync } from 'concat-md'
import { execSync } from 'child_process';

const DOCS_DIR = path.resolve(__dirname, '..', 'node_modules', '@acaldas', 'document-model-libs', 'dist', 'docs')

function generateMdDocs (pathToDir: string, outputFilePath: string) {
  const content = concatMdSync(pathToDir, {
    fileNameAsTitle: true
  })
  const dirname = path.dirname(outputFilePath)
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname)
  }
  fs.writeFileSync(outputFilePath, content, { encoding: 'utf8' })
}

function main () {
  const outputFilePath = path.resolve(__dirname, '..', 'content', 'documentation', 'index.md')
  generateMdDocs(DOCS_DIR, outputFilePath)
}

main()
