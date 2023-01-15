import { Dataset, Loader, Node } from "bunnymen"


export class ChatDataset extends Dataset<string[]> {
  constructor(node: Node, maxHistory = 50) {
    const loader = Loader.create(
      (messageHistory: string[] | undefined, newMessages: string[]) => {
        return (messageHistory || []).concat(newMessages).slice(-maxHistory)
      }
    )
    super(node, () => [], loader, {
      initializer: () => 'welcome to bunnymen, anon 😈',
    })
  }
}