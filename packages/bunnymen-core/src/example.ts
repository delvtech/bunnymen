import { BunnymenDB } from './bunnymendb'
import { Dataset } from './dataset'
import { Loader } from './loader'
import { Node } from './node'

async function main() {
  const db = new BunnymenDB()
  const topic = 'frank'
  const node = new Node(topic)

  const fooLoader = Loader.create(
    (currentCount: number, incrementCount: number) =>
      currentCount + incrementCount,
  )

  const fooFetcher = () => 1
  const fooInitializer = () => 1

  const fooDataset = Dataset.create(node, topic, fooFetcher, fooLoader, {
    initializer: fooInitializer,
  })

  db.registerDatasets('foo', fooDataset)

  const data = await db.get('foo')
  console.log(data)

  const data2 = await db.get('foo')
  console.log(data2)
}

main()
