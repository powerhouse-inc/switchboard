import fs from 'fs'
import path from 'path'
import { concatMdSync } from 'concat-md'
import { mkdirpSync } from 'mkdirp'

const TOC_START_COMMENT = '<!-- START doctoc generated TOC please keep comment here to allow auto update -->'
const TOC_END_COMMENT = '<!-- END doctoc generated TOC please keep comment here to allow auto update -->'

function splitMdIntoTocAndContenet (md: string) {
  const from = md.indexOf(TOC_START_COMMENT)
  const to = md.lastIndexOf(TOC_END_COMMENT) + TOC_END_COMMENT.length;
  const toc = md.substring(from, to)
  const content = md.substring(to)
  return { toc, content }
}

function generateMdDocs (pathToDir: string, outputFilePath: string) {
  const result = concatMdSync(pathToDir, {
    fileNameAsTitle: true,
    toc: true
  })
  const { toc, content } = splitMdIntoTocAndContenet(result)
  mkdirpSync(path.dirname(outputFilePath))
  fs.writeFileSync(outputFilePath, content, { encoding: 'utf8' })
  fs.writeFileSync(path.join(path.dirname(outputFilePath), '_toc.md'), toc, { encoding: 'utf8' })
}

function main () {
  const pathToDir = path.resolve(__dirname, '..', 'docs')
  const outputFilePath = path.resolve(__dirname, '..', 'content', 'documentation', 'index.md')
  generateMdDocs(pathToDir, outputFilePath)
}

main()
