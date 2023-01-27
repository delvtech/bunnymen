import { Node } from 'bunnymen'

// initiate node here
// switch to a simple inline script
async function main() {
  const topic = 'bunnymen'
  const node = new Node()

  //let numPeers = 0
  let counter = 0
  let cid = ''

  node.on('subscribed', (peerId) => console.log('subscribed ' + peerId))
  node.on('unsubscribed', (peerId) => console.log('unsubscribed ' + peerId))
  node.on('peerSubscribed', (peerId) => {
    // only if there is a cid to send
    if (cid.length > 0 && node.isLeader(topic)) {
      // send latest cid when we see that a node has joined the channel
      node.sendMessage(topic, cid)
    } else {
      console.log(
        'no data has been uploaded yet so there is no message to send',
      )
    }
    console.log('peer subscribed ' + peerId)
  })
  node.on('peerUnsubscribed', (peerId) =>
    console.log('peer unsubscribed ' + peerId),
  )
  // node.on('sentMessage', (message) => {
  //     //console.log('sent message: ' + message)
  // })
  node.on('receivedMessage', (message) => {
    cid = message
    //console.log('recieved message: ' + message)
    node.download(topic, cid)
  })
  node.on('uploadedData', (newCid) => {
    console.log('uploaded data: ' + newCid)
    cid = newCid
    node.sendMessage(topic, newCid)
  })
  node.on('downloadedData', (data) => {
    if (+data >= counter) {
      counter = +data
      console.log('downloaded data: ' + data)
      counter++
      node.upload(topic, counter.toString())
    }
  })
  node.on('selectedLeader', (peerId) => {
    console.log('new leader selected: ' + peerId)
  })

  await node.subscribe(topic)
  await node.upload(topic, counter.toString())
}

main()
