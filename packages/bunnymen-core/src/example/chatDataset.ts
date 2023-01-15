import { Dataset } from '../dataset.js'
import { Loader } from '../loader.js'
import { Node } from '../node.js'

export class ChatDataset extends Dataset<string[], string> {
  constructor(node: Node, maxHistory = 50) {
    const loader = Loader.create(
      (messageHistory: string[] | undefined, newMessage: string) => {
        return (messageHistory || []).concat(newMessage).slice(-maxHistory)
      },
      (
        oldMessageHistory: string[],
        currentMessageHistory: string[] | undefined
      ) => {
        return [...oldMessageHistory, ...(currentMessageHistory || [])]
      }
    )
    super(node, () => [], loader, {
      initializer: () => 'welcome to bunnymen, anon 😈',
    })
  }
}
