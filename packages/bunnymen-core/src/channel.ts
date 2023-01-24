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

export interface IChannelEvents {
  peerSubscribed: (property: string) => void
  peerUnsubscribed: (property: string) => void
  selectedLeader: (property: string) => void
  sentMessage: (property: string) => void
  receivedMessage: (property: string) => void
}

export class Channel extends EventEmitter {
  private BASE_TOPIC = '_peer-discovery._p2p._pubsub'
  private _topic: string
  private _ipfs: IPFS.IPFS | undefined
  private _libp2p: Libp2pOptions | IPFS.Libp2pFactoryFn | undefined
  private _peerId: PeerIdStr = ''
  private _peers: string[]
  private _currentLeader: string = ''
  private _currentCid: string = ''
  private _currentStep: number = 0
  private _frequency = -1
  private POLLING_FREQENCY: number = 100
  private _untypedOn = this.on
  private _untypedEmit = this.emit

  public on = <K extends keyof IChannelEvents>(
    event: K,
    listener: IChannelEvents[K],
  ): this => this._untypedOn(event, listener)

  public emit = <K extends keyof IChannelEvents>(
    event: K,
    ...args: Parameters<IChannelEvents[K]>
  ): boolean => this._untypedEmit(event, ...args)

  get peerId() {
    return this._peerId
  }

  get peers() {
    return this._peers
  }

  constructor(
    libp2p: Libp2pOptions | IPFS.Libp2pFactoryFn | undefined,
    ipfs: IPFS.IPFS | undefined,
    topic: string,
  ) {
    super()
    this._libp2p = libp2p
    this._ipfs = ipfs
    this._topic = topic + '.' + this.BASE_TOPIC
    this._peers = new Array(0)
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
    this.selectLeader()
  }

  async unsubscribe() {
    this._ipfs?.pubsub.unsubscribe(this._topic)
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
}
