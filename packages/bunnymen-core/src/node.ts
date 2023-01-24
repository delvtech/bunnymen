import * as IPFS from 'ipfs-core'
import { createLibp2p, Libp2p, Libp2pOptions } from 'libp2p'
import { mdns } from '@libp2p/mdns'
import { kadDHT } from '@libp2p/kad-dht'
import { webSockets } from '@libp2p/websockets'
import { tcp } from '@libp2p/tcp'
import { webRTCStar } from '@libp2p/webrtc-star'
import { bootstrap } from '@libp2p/bootstrap'
import { mplex } from '@libp2p/mplex'
import { noise } from '@chainsafe/libp2p-noise'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import { EventEmitter } from 'events'
import os from 'os'
import path from 'path'
import { nanoid } from 'nanoid'
import { sha3_256 } from '@noble/hashes/sha3'
import { PeerIdStr } from '@chainsafe/libp2p-gossipsub/dist/src/types'

const isBrowser = typeof window !== 'undefined'

export interface INodeEvents {
  subscribed: (property: string) => void
  unsubscribed: (property: string) => void
  peerSubscribed: (property: string) => void
  peerUnsubscribed: (property: string) => void
  selectedLeader: (property: string) => void
  sentMessage: (property: string) => void
  receivedMessage: (property: string) => void
  uploadedData: (property: string) => void
  downloadedData: (property: string) => void
}

export class Node extends EventEmitter {
  private BASE_TOPIC = '_peer-discovery._p2p._pubsub'
  private _topic: string
  private _ipfs: IPFS.IPFS | undefined
  private _libp2p: Libp2pOptions | IPFS.Libp2pFactoryFn | undefined
  private _opts: any
  private _peerId: PeerIdStr = ''
  private _peers: string[]
  private _currentLeader: string = ''
  private _currentCid: string = ''
  private _currentStep: number = 0
  private _frequency = -1
  private POLLING_FREQENCY: number = 100
  private _untypedOn = this.on
  private _untypedEmit = this.emit

  public on = <K extends keyof INodeEvents>(
    event: K,
    listener: INodeEvents[K],
  ): this => this._untypedOn(event, listener)

  public emit = <K extends keyof INodeEvents>(
    event: K,
    ...args: Parameters<INodeEvents[K]>
  ): boolean => this._untypedEmit(event, ...args)

  get peerId() {
    return this._peerId
  }

  get peers() {
    return this._peers
  }

  constructor(topic: string) {
    super()
    this._topic = topic + '.' + this.BASE_TOPIC
    this._peers = new Array(0)
  }

  async start() {
    const libp2p = (opts: any) => {
      this._opts = opts
      this._peerId = opts.peerId.toString()
      return this.configureLibp2p()
    }

    this._ipfs = await IPFS.create({
      repo: path.join(os.tmpdir(), `repo-${nanoid()}`),
      libp2p: libp2p,
    })

    this._libp2p = await libp2p
  }

  async poll(frequency: number) {
    this._frequency = frequency
    setInterval(async () => {
      if (this._peerId != undefined) {
        this.checkForNewPeers()
        if (this._currentStep >= frequency) {
          this.selectLeader()
          this._currentStep = 0
        }
        this._currentStep += this.POLLING_FREQENCY
      }
    }, this.POLLING_FREQENCY)
  }

  async subscribe(): Promise<void> {
    const receivedMessage = (message: any) => {
      const data = String.fromCharCode.apply(null, message.data)
      this.emit('receivedMessage', data)
    }
    this._ipfs?.pubsub.subscribe(this._topic, receivedMessage)
    this.emit('subscribed', this._topic)
    this.selectLeader()
  }

  async unsubscribe() {
    this._ipfs?.pubsub.unsubscribe(this._topic)
    this.emit('unsubscribed', this._topic)
  }

  async sendMessage(message: string) {
    this._ipfs?.pubsub.publish(this._topic, new TextEncoder().encode(message))
    this.emit('sentMessage', message)
    return message
  }

  async upload(data: string) {
    const file = await this._ipfs?.add({
      path: this._topic,
      content: new TextEncoder().encode(data),
    })

    if (file !== undefined) {
      this._currentCid = file.cid.toString()
      this.emit('uploadedData', this._currentCid)
    }
    return this._currentCid
  }

  async download(cid: string) {
    const decoder = new TextDecoder()
    let data = ''
    if (this._ipfs === undefined) {
      console.log('IPFS has not been initialized.')
      return data
    }
    if (cid.length === 46) {
      for await (const chunk of this._ipfs.cat(cid)) {
        data += decoder.decode(chunk, {
          stream: true,
        })
      }
      this._currentCid = cid
      this.emit('downloadedData', data)
    } else {
      console.log('invalid cid')
    }
    return data
  }

  isLeader() {
    return this._currentLeader == this._peerId.toString()
  }

  private selectLeader() {
    var peers = this._peers
    // add local peerId to peer list
    peers.push(this._peerId)
    // create a list of objects { peerId, hash }
    // where we hash each peer with the currentCid
    const peerHashList = peers.map((peer) => {
      var preimage = peer + this._currentCid
      return { peerId: peer, hash: String.fromCharCode(...sha3_256(preimage)) }
    })
    // sort the list alphanumerically
    const peerHashListSorted = peerHashList.sort((a, b) => {
      return a.hash.localeCompare(b.hash, undefined, {
        numeric: true,
        sensitivity: 'base',
      })
    })
    // select the first peerId in the list as the new leader
    this._currentLeader = peerHashListSorted[0].peerId
    this.emit('selectedLeader', this._currentLeader)
  }

  private async checkForNewPeers() {
    const prevPeers: string[] = this._peers
    if (this._ipfs === undefined) {
      console.log('IPFS has not been initialized.')
      return
    }
    this._peers = (await this._ipfs.pubsub.peers(this._topic)).map(String)

    const peersLeft = prevPeers.filter(
      (prevPeer: string) =>
        prevPeer != this._peerId && !this._peers.includes(prevPeer),
    )
    peersLeft.forEach((peer) => this.emit('peerUnsubscribed', peer.toString()))

    const peersJoined = this._peers.filter(
      (peer: string) => !prevPeers.includes(peer),
    )
    peersJoined.forEach((peer) => this.emit('peerSubscribed', peer.toString()))

    if (peersJoined.length > 0) {
      this._currentStep = this._frequency
    }
  }

  // see https://github.com/libp2p/js-libp2p/blob/master/doc/CONFIGURATION.md
  private configureLibp2p() {
    const transports = [webSockets()]
    const boostraplist = [
      '/dnsaddr/bootstrap.libp2p.io/ws/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
      '/dnsaddr/bootstrap.libp2p.io/ws/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
      '/dnsaddr/bootstrap.libp2p.io/ws/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp',
      '/dnsaddr/bootstrap.libp2p.io/ws/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
      '/dnsaddr/bootstrap.libp2p.io/ws/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
    ]

    const peerDiscovery: any = [
      bootstrap({
        list: boostraplist,
        timeout: 10000, // in ms,
        tagName: 'bootstrap',
        tagValue: 50,
        tagTTL: Infinity, // browser's need a constant connection to bootstrap nodes
      }),

      pubsubPeerDiscovery({
        interval: 5000,
        topics: [this._topic, this.BASE_TOPIC],
        listenOnly: true, // enabling listenOnly to eliminate an issue where it tries to intercept bunnymen messages and decode them
      }),
    ]
    if (isBrowser) {
      const wRTCStar = webRTCStar()
      transports.push(wRTCStar.transport)
      peerDiscovery.push(wRTCStar.discovery)
    } else {
      peerDiscovery.push(
        mdns({
          broadcast: true,
          port: 50002,
          compat: true,
        }),
      )
      transports.push(tcp())
    }
    return createLibp2p({
      peerId: this._opts.peerId,
      addresses: {
        // Add the signaling server address, along with our PeerId to our multiaddrs list
        // libp2p will automatically attempt to dial to the signaling server so that it can
        // receive inbound connections from other peers
        listen: [
          //'/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
          //'/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
          //'/dns4/bunnymen.delvelabs.xyz/tcp/443/wss/p2p-webrtc-star/',
          //'/dns4/bunnymen-nix.delvelabs.xyz/tcp/443/wss/p2p-webrtc-star/',
          '/ip4/0.0.0.0/tcp/0/ws',
          '/ip4/0.0.0.0/tcp/0',
          '/ip4/127.0.0.1/tcp/0/ws',
          '/ip4/127.0.0.1/tcp/0',
          '/ip4/0.0.0.0/tcp/0/wss',
          '/ip4/0.0.0.0/tcp/0',
          '/ip4/127.0.0.1/tcp/13579/ws/p2p-webrtc-star/', // local webrtc-star server
        ],
      },
      connectionManager: {
        pollInterval: 5000,
        autoDial: true, // auto dial to peers we find when we have less peers than `connectionManager.minConnections`,
        minConnections: 20,
      },
      transports,
      connectionEncryption: [noise()],
      streamMuxers: [mplex()],
      peerDiscovery,
      relay: {
        enabled: true,
        hop: {
          enabled: true,
          active: true,
        },
      },
      pubsub: gossipsub({
        enabled: true,
        emitSelf: false,
        allowPublishToZeroPeers: true,
        floodPublish: true,
      }),
    })
  }
}
