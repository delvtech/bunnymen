import { Dataset, Loader, Node } from 'bunnymen'

export interface IMessageData {
  user: string
  content: string
  /**
   * unix timestamp of when the message was sent
   */
  timestamp: number
}

/**
 * A Dataset for storing chat history
 */
export class ChatDataset extends Dataset<IMessageData[], string[]> {
  constructor(node: Node, maxHistory = 50) {
    // A loader that turns an array of strings into an array of `IMessageData`s
    // and appends them to a list with a max size of `maxHistory`
    const loader = Loader.create({
      // map over new messages coming in and turn them into `IMessageData`s
      transformer: (newMessages: string[]) => {
        return newMessages.map((message) => {
          return {
            user: node.peerId,
            content: message,
            timestamp: Date.now(),
          }
        })
      },

      // Merge new messages with existing data and keep the last `maxHistory`
      aggregator: (
        messageHistory: IMessageData[] | undefined,
        newMessages: IMessageData[]
      ) => {
        return (messageHistory || []).concat(newMessages).slice(-maxHistory)
      },
    })

    super(node, () => [], loader, {
      initializer: () => [`🐰 new anon joined: ${node.peerId}`],
    })
  }
}
