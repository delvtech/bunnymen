import * as IPFS from 'ipfs-core'
import { createLibp2p } from 'libp2p'
import { TCP } from '@libp2p/tcp'
import { WebSockets } from '@libp2p/websockets'
import { WebRTCStar } from '@libp2p/webrtc-star'
import { Bootstrap } from '@libp2p/bootstrap'
import { Mplex } from '@libp2p/mplex'
import { Noise } from '@chainsafe/libp2p-noise'
import { GossipSub } from '@chainsafe/libp2p-gossipsub'
import { EventEmitter } from 'events'

interface INodeEvents {
    joinedChannel: () => void
    leftChannel: () => void
    peerJoinedChannel:() => void
    peerLeftChannel:() => void
    selectedLeader: () => void
    sentMessage: () => void
    receivedMessage: () => void
    uploadedData: (contentId: string) => void
    downloadedData: () => void
}

export class Node extends EventEmitter {

    private _ipfs
    private _untypedOn = this.on
    private _untypedEmit = this.emit
    public on = <K extends keyof INodeEvents>(event: K, listener: INodeEvents[K]): this => this._untypedOn(event, listener)
    public emit = <K extends keyof INodeEvents>(event: K, ...args: Parameters<INodeEvents[K]>): boolean => this._untypedEmit(event, ...args)

    constructor() {
        super()

        const libp2pBundle = (opts) => {

            const peerId = opts.peerId
            const bootstrapList = opts.config.Bootstrap
            const webRTCStar = new WebRTCStar()
        
            // see https://github.com/libp2p/js-libp2p/blob/master/doc/CONFIGURATION.md
            return createLibp2p({
                peerId,
                connectionManager: {
                    pollInterval: 5000, // how often we check peer health
                    autoDial: true, // auto dial to peers we find when we dip below min peers
                },
                transports: [
                    new TCP(),
                    new WebSockets(),
                ],
                streamMuxers: [
                    new Mplex()
                ],
                connectionEncryption: [
                    new Noise()
                ],
                peerDiscovery: [
                    webRTCStar.discovery,
                    new Bootstrap({
                        interval: 30e3,
                        list: bootstrapList
                    })
                ],
                // Turn on relay with hop active so we can connect to more peers
                relay: {
                    enabled: true,
                    hop: {
                        enabled: true,
                        active: true
                    }
                },
                pubsub: new GossipSub({ 
                    emitSelf: true,   
                    allowPublishToZeroPeers: true,
                })
            })
        }
        this._ipfs =  IPFS.create({
            libp2p: libp2pBundle
        })
    }


    async connect(channel: string, frequency: Number) {
        const ipfs: IPFS.IPFS = await this._ipfs
        const receiveMsg = (msg) => this.emit('receivedMessage')
        ipfs.pubsub.subscribe(channel,receiveMsg)
        this.emit('joinedChannel')
    }

  disconnect(channel: string, frequency: number) {
    this.emit('leftChannel')
  }

    async sendMessage(channel: string){
        const ipfs: IPFS.IPFS = await this._ipfs
        const msg = new TextEncoder().encode('banana')
        ipfs.pubsub.publish(channel, msg)
        this.emit('sentMessage')
    }

  upload(contentId: string) {
    this.emit('uploadedData', contentId)
  }

  download(contentId: string) {
    this.emit('downloadedData', contentId)
  }

  selectLeader() {
    this.emit('selectedLeader')
  }
}

const node = new Node()
node.on('joinedChannel', () => console.log('connected'))
node.on('sentMessage', () => console.log('sent message'))
node.on('receivedMessage', () => console.log('recieved message'))
node.connect('foo',10)

setInterval(async () => {
    node.sendMessage('foo')
}, 2000)
