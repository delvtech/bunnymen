// @ts-ignore
import { BunnymenDB, Node } from 'bunnymen'
import { ChatDataset } from './chatDataset'
import { htmlSource, scriptTag } from './constants'

const node = new Node('bunny')
// @ts-ignore
window.bunnyNode = node

export async function init() {
  const key = 'chat'
  await node.start()
  const db = new BunnymenDB()
  const chatDataset = new ChatDataset(node, 50)
  db.registerDatasets(key, chatDataset)
  await db.init()
  db.subscribe(key, (messages) => {
    console.log(`${key} updated:`, messages)
  })
  return db
}

init().then((db) => {
  console.log(db)
  // @ts-ignore
  window.bunnymenDB = db
})

const range = document.createRange()

// @ts-ignore
range.selectNode(document.getElementsByTagName('div').item(0))
const documentFragment = range.createContextualFragment(htmlSource)
document.body.appendChild(documentFragment)

setTimeout(() => {
  const range = document.createRange()

  // @ts-ignore
  range.selectNode(document.getElementsByTagName('div').item(0))
  const documentFragment = range.createContextualFragment(scriptTag)
  window.document.body.appendChild(documentFragment)
}, 3000)
