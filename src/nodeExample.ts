import { Node } from './node.js'

export async function main() {
    const topic = 'frank'
    const node = new Node(topic)
    
    let numPeers = 0
    let counter = 0
    let cid = ''
    
    node.on('subscribed', (peerId) => console.log('subscribed ' + peerId))
    node.on('unsubscribed', (peerId) => console.log('unsubscribed ' + peerId))
    node.on('peerSubscribed', (peerId) => console.log('peer subscribed ' + peerId))
    node.on('peerUnsubscribed', (peerId) => console.log('peer unsubscribed ' + peerId))
    node.on('sentMessage', (message) => {
        //console.log('sent message: ' + message)
    })
    node.on('receivedMessage', (message) => {
        cid = message
        //console.log('recieved message: ' + message)
        node.download(cid)
    })
    node.on('uploadedData', (cid) => {
        console.log("uploaded data: " + cid)
        setInterval(async () => {
            node.sendMessage(cid)
        }, 2000)
        
    })
    node.on('downloadedData', (data) => {
        if( +data >= counter ){
            counter = +data
            console.log("downloaded data: " + data)
            counter++
            node.upload(counter.toString())
        }
    })
    
    node.subscribe()
    node.poll(100)
    
    node.upload(counter.toString())
    
}

main()
