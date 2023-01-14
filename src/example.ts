import { BunnymenDB } from './bunnymendb'
import { Dataset } from './dataset'
import { Loader } from './loader'

async function main() {
  const db = new BunnymenDB()
  const topic = 'frank'

  const fooInitializer = () => 5
  const fooFetcher = () => 1

  const fooLoader = Loader.create(
    (currentCount: number, incrementCount: number) =>
      currentCount + incrementCount,
  )

  const fooDataset = Dataset.create(topic, fooFetcher, fooLoader, {
    initializer: fooInitializer,
  })

  db.registerDatasets('foo', fooDataset)

  const data = await db.get('foo')
  console.log(data)

  const data2 = await db.get('foo')
  console.log(data2)
}

main()
