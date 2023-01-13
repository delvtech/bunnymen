import * as IPFS from 'ipfs-core'
import { EventEmitter } from 'events'

interface INodeEvents {
    joinedChannel: () => void
    leftChannel: () => void
    peerJoinedChannel:() => void
    peerLeftChannel:() => void
    selectedLeader: () => void
    sentContentId: () => void
    receivedContentId: () => void
    uploadedData: () => void
    downloadedData: () => void
}

export default class Node extends EventEmitter {

    //private _ipfs
    private _room
    private _untypedOn = this.on
    private _untypedEmit = this.emit
    public on = <K extends keyof INodeEvents>(event: K, listener: INodeEvents[K]): this => this._untypedOn(event, listener)
    public emit = <K extends keyof INodeEvents>(event: K, ...args: Parameters<INodeEvents[K]>): boolean => this._untypedEmit(event, ...args)

    constructor() {
        super()
    }

    async connect(channel, frequency) {

        let _ipfs = await IPFS.create({
            repo: 'ipfs/bunnymen',
            config: {
                Addresses: {
                    Swarm: [
                        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
                        '/dns4/ws-star-signal-2.servep2p.com/tcp/443/wss/p2p-websocket-star',
                        '/dns4/ws-star-signal-1.servep2p.com/tcp/443/wss/p2p-websocket-star',
                    ]
                }
            }
        })

        const peers = await _ipfs.swarm.peers()
        console.log(`The node now has ${peers.length} peers.`)

        this.emit('joinedChannel')
    }

    disconnect(channel, frequency) {
        this.emit('leftChannel')
    }

    gossip(contendId){
        this.emit('sentContentId')
    }

    upload(contentId){
        this.emit('uploadedData')
    }

    download(contentId){
        this.emit('downloadedData')
    }

    selectLeader(){
        this.emit('selectedLeader')
    }

}

const node = new Node()
node.on('joinedChannel', () => console.log('works'))
node.connect('foo',10)