import { Node } from '../node.js'
import { BunnymenDB } from '../bunnymendb.js'
import { ChatDataset } from './chatDataset.js'

const node = new Node('bunny')

async function main() {
  const key = 'chat'
  const db = new BunnymenDB()
  const chatDataset = new ChatDataset(node, 50)
  db.registerDatasets(key, chatDataset)
  await db.init()
  db.subscribe(key, (messages) => {
    console.log(`${key} updated:`, messages)
  })
  await db.set(key, process.argv[2])
}

main()
