# Echo: Bunnymen Functional Spec

The user defines the following classes per datasource:

**Initializer** responsible for pulling the initial data when the node joins a
topic (optional).

```
interface Initializer{
  // This function contains custom logic for pulling data
  init() -> RawData
}
```

**Fetcher** responsible for pulling the latest data (required).

```
interface Fetcher{
  // This function contains custom logic for pulling latest data
  fetch() -> RawData
}
```

**Loader** responsible for implementing logic on how the data is stored. the
load() function could append, replace, or just keep the last 50 results from the
Fetcher.

```
interface Loader{
  // This function contains custom logic describing how the data is stored locally AND in ipfs
  load()
}
```

Once these classes are implemented, the user must register the dataset to
BunnymenDB.

```
bunnymenDB.registerDataset(key,Initializer, Fetcher, Loader, frequency)
```

Next, the user needs to define how the data from the dataset is processed. This
is defined in the TransformerFn.

```
transformerFn(rawData1, [rawData2], [rawData3], ...)->TransformedData -> {
  // custom logic that processes data from the dataset
}
```

The user can then register transformerFn as follows:

```
bunnymenDB.registerTransformer(key,transformerFn)
```

Finally, the user calls init to start the db

```
bunnymenDB.init()
```

```
BunnymenDB
  - registerDataset(key,...) // adds Datasets to key and node subscribes to key channel via Dataset
  - registerTransformer(key, transformFn) // adds transformFn to key
  - init() // starts node
  - get(key) -> TransformedData
      transformer = getTransformer(key)
      datasets = getDatsets(key)
      rawData1 = dataset[0].get()
      rawData2 = dataset[1].get()
      transformedData = transformFn(rawData1, rawData2)
      return transformedData

  // protected methods
  - getTransformer(key)
  - getDatasets(key)
  // protected members
  - Map<Key,Transformer> keytoTransformer
  - Map<Key,[Dataset]> keyToDatasets
```

```
Dataset
  - register( Initializer,
              Fetcher,
              Loader,
              frequency) // call Node.start(), Initializer.init(), Loader.load()
  - get() -> RawData // from ipfs or local cache
  - isStale() // marked stale if frequency+offset has passed
// protected members
  - Cache
  - Node
  - Initializer
  - Fetcher
  - Loader
  - currentCID
```

```
Node
  - Node(topic)
  - connect()
  - subscribe()
  - unsubscribe()
  - poll(frequency)
  - sendMessage()
  - uploadData()
  - downloadData()
  - selectLeader()
  // Events:
  - unSubscribe
  - subscribed
  - selectedLeader
  - sentMessage
  - receivedMessage
  - uploadedData
  - dowloadedData
  - peerSubscribed
  - peerUnsubscribed
```
