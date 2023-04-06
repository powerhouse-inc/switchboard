import fs from 'fs'
import path from 'path'
import { concatMdSync } from 'concat-md'
import { mkdirpSync } from 'mkdirp'

function generateMdDocs (pathToDir: string, outputFilePath: string) {
  const result = concatMdSync(pathToDir, {
    fileNameAsTitle: true,
    dirNameAsTitle: true
  })
  mkdirpSync(path.dirname(outputFilePath))
  fs.writeFileSync(outputFilePath, result, { encoding: 'utf8' })
}

function main () {
  const pathToDir = path.resolve(__dirname, '..', 'docs')
  const outputFilePath = path.resolve(__dirname, '..', 'content', 'docs', 'index.md')
  generateMdDocs(pathToDir, outputFilePath)
}

main()
