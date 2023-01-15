import * as IPFS from 'ipfs-core'
import { createLibp2p } from 'libp2p'
import { MulticastDNS } from '@libp2p/mdns'
//import { kadDHT } from '@libp2p/kad-dht'
import { webSockets } from '@libp2p/websockets'
import { webRTCStar } from '@libp2p/webrtc-star'
import { bootstrap } from '@libp2p/bootstrap'
import { mplex } from '@libp2p/mplex'
import { noise } from '@chainsafe/libp2p-noise'
import { gossipsub,GossipSubComponents } from '@chainsafe/libp2p-gossipsub'
import { PubSubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import type { CID } from 'multiformats/cid'
import { PeerId, RSAPeerId } from '@libp2p/interface-peer-id'
import { Message } from '@libp2p/kad-dht/dist/src/message'
import { EventEmitter } from 'events'
import os from 'os'
import path from 'path'
import { nanoid } from 'nanoid'
import {sha3_256} from '@noble/hashes/sha3'
import { PeerIdStr } from '@chainsafe/libp2p-gossipsub/dist/src/types'
import { openStdin } from 'process'

const isBrowser = typeof window !== 'undefined'


export interface INodeEvents {
    subscribed: (property: string) => void
    unsubscribed: (property: string) => void
    peerSubscribed:(property: string) => void
    peerUnsubscribed:(property: string) => void
    selectedLeader: (property: string) => void
    sentMessage: (property: string) => void
    receivedMessage: (property: string) => void
    uploadedData: (property: string) => void
    downloadedData: (property: string) => void
}


export class Node extends EventEmitter {

    readonly _topic: string
    private _node
    private _peerId: PeerIdStr = ''
    private _peers: string[]
    private _currentLeader: string = ''
    private _currentCid: string = ''
    private _currentStep:  number = 0
    private _frequency = -1
    private POLLING_FREQENCY: number = 100
    private _untypedOn = this.on
    private _untypedEmit = this.emit
    public on = <K extends keyof INodeEvents>(event: K, listener: INodeEvents[K]): this => this._untypedOn(event, listener)
    public emit = <K extends keyof INodeEvents>(event: K, ...args: Parameters<INodeEvents[K]>): boolean => this._untypedEmit(event, ...args)

    constructor(topic: string) {
        super()

        const libp2pBundle = (opts: any) => {
            this._peerId = opts.peerId.toString()
            const bootstrapList = opts.config.bootstrap
            return this.configureLibp2p(opts, bootstrapList)
        }

        this._node =  IPFS.create({
            repo:  path.join(os.tmpdir(), `repo-${nanoid()}`),
            libp2p: libp2pBundle
        })

        this._topic = topic
        this._peers = new Array(0)
    }

    async poll(frequency: number) {
        this._frequency = frequency
        setInterval(async () => {
            if(this._peerId != undefined) {
                this.checkForNewPeers()
                if(this._currentStep >= frequency) {
                    this.selectLeader()
                    this._currentStep = 0
                }
                this._currentStep += this.POLLING_FREQENCY
            }
        }, this.POLLING_FREQENCY)
    }

    async subscribe(): Promise<void> {
        const node: IPFS.IPFS = await this._node
        const receivedMessage = (message: any) => this.emit('receivedMessage', String.fromCharCode.apply(null, message.data))
        node.pubsub.subscribe(this._topic,receivedMessage)
        this.emit('subscribed', this._topic)
        this.selectLeader()
    }

    async unsubscribe() {
        const node: IPFS.IPFS = await this._node
        node.pubsub.unsubscribe(this._topic)
        this.emit('unsubscribed', this._topic)
    }

    async sendMessage(message: string){
        const node: IPFS.IPFS = await this._node
        node.pubsub.publish(this._topic, new TextEncoder().encode(message))
        this.emit('sentMessage', message)
        return message
    }

    async upload(data: string){
        const node: IPFS.IPFS = await this._node
        const file = await node.add({
            path: this._topic,
            content: new TextEncoder().encode(data)
          })
        this._currentCid = file.cid.toString()
        this.emit('uploadedData', this._currentCid)
        return this._currentCid
    }

    async download(cid: string){
        const node: IPFS.IPFS = await this._node
        const decoder = new TextDecoder()
        let data = ''
      
        for await (const chunk of node.cat(cid)) {
          data += decoder.decode(chunk, {
            stream: true
          })
        }

        this._currentCid = cid
        this.emit('downloadedData', data)
        return data
    }

    getPeers(){
        return this._peers
    }

    isLeader(){
        return this._currentLeader == this._peerId.toString()
    }

    private selectLeader(){
        var peers = this._peers
        // add local peerId to peer list
        peers.push(this._peerId)
        // create a list of objects { peerId, hash }
        // where we hash each peer with the currentCid
        const peerHashList = peers.map(peer => {
            var preimage = peer+this._currentCid
            return {peerId: peer, hash: String.fromCharCode(...sha3_256(preimage))}
        })
        // sort the list alphanumerically
        const peerHashListSorted = peerHashList.sort((a,b)=>{
            return a.hash.localeCompare(b.hash,undefined, {
                numeric: true,
                sensitivity: 'base'
            })
        })
        // select the first peerId in the list as the new leader
        this._currentLeader = peerHashListSorted[0].peerId
        this.emit('selectedLeader', this._currentLeader)
    }

    private async checkForNewPeers(){

        const node: IPFS.IPFS = await this._node
        var prevPeers: string[] = this._peers;
        this._peers = (await node.pubsub.peers(this._topic)).map(String);

        var peersLeft = prevPeers.filter((prevPeer: string) => !prevPeers.includes(prevPeer));
        peersLeft.forEach(peer => this.emit('peerUnsubscribed',peer.toString()));
    
        var peersJoined = this._peers.filter((peer: string) => !prevPeers.includes(peer));
        peersJoined.forEach(peer => this.emit('peerSubscribed',peer.toString()));

        if(peersJoined.length > 0){
            this._currentStep = this._frequency
        }
      }

    // see https://github.com/libp2p/js-libp2p/blob/master/doc/CONFIGURATION.md
    private configureLibp2p(opts: any, bootstrapList: any) {
        const transports = [webSockets()]
        const peerDiscovery: any = [
          bootstrap({
            list: [
              '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
              '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
              '/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp',
              '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
              '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
            ]
          })
        ]
        if (isBrowser) {
            const wRTCStar = webRTCStar()
            transports.push(wRTCStar.transport)
            peerDiscovery.push(wRTCStar.discovery)
        }
        return createLibp2p({
            addresses: {
              // Add the signaling server address, along with our PeerId to our multiaddrs list
              // libp2p will automatically attempt to dial to the signaling server so that it can
              // receive inbound connections from other peers
              listen: [
                '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
                '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
                '/ip4/0.0.0.0/tcp/0/ws',
              ]
            },
            transports,
            connectionEncryption: [noise()],
            streamMuxers: [mplex()],
            peerDiscovery,
            relay: {
                enabled: true,
                hop: {
                    enabled: true,
                    active: true
                }
            },
            //kaddht: kadDHT(),
            pubsub: gossipsub(
            {
                enabled: true,
                emitSelf: false,
                allowPublishToZeroPeers: true,
            })
          })
    }

}
