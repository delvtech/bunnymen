import { EventEmitter } from 'events'
import { IPFS, create } from 'ipfs-core'
import type { CID } from 'multiformats/cid'

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

    private _untypedOn = this.on
    private _untypedEmit = this.emit
    public on = <K extends keyof INodeEvents>(event: K, listener: INodeEvents[K]): this => this._untypedOn(event, listener)
    public emit = <K extends keyof INodeEvents>(event: K, ...args: Parameters<INodeEvents[K]>): boolean => this._untypedEmit(event, ...args)

    constructor() {
        super()
    }

    connect(channel, frequency) {
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