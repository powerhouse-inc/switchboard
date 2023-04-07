import fs from 'fs'
import path from 'path'
import { concatMdSync } from 'concat-md'
import { mkdirpSync } from 'mkdirp'

function generateMdDocs (pathToDir: string, outputFilePath: string) {
  const content = concatMdSync(pathToDir, {
    fileNameAsTitle: true
  })
  mkdirpSync(path.dirname(outputFilePath))
  fs.writeFileSync(outputFilePath, content, { encoding: 'utf8' })
}

function main () {
  const pathToDir = path.resolve(__dirname, '..', 'docs')
  const outputFilePath = path.resolve(__dirname, '..', 'content', 'documentation', 'index.md')
  generateMdDocs(pathToDir, outputFilePath)
}

main()
