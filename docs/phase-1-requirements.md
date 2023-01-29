# Echo: Phase 1 Requirements 

The initial phase of Echo will focus on two things:

1) Configuring the hosting service that serves the decentralized frontend code and p2p data sharing
2) Application Manifest
3) P2P Data Sharing


## Hosting Service

The *Hosting Service* will be packaged as a Docker container that includes a configured IPFS node that ensures the frontend code is always available. The Hosting Service will also run the necessary services required for reliable browser 2 browser communication.


![](https://i.imgur.com/Fg12DSL.png)


We can utilize ENS subdomains to ensure that a normal browser resolves to the CID representing the frontend.

:::info
**Note:** The pinning service should be designed so that restakers can run it in phase 2.
:::

### Things to think about

1) We should register a nice ENS domain so that all (future) Echo enabled dapps can be resolved through an ENS subdomain.

2) Eventually we will need a nice workflow to update the CID that the ENS subdomain points to when the frontend changes.  We might be able to use IPNS, but i'm not sure if that is compatible with ENS.

## Application Manifest

We will need some sort of application manifest that contains all the resources needed to render the frontend.  The manifest doesn't need to be complicated, but we should consider future proofing it so that it is flexible with future usecases.  An example of an *Application Manifest* might contain the following types of CIDs

- Frontend code
- Graphics
- ToS
- Data (contract addresses, token metadata, etc)
- Version history


## P2P Data Sharing

The diagram below provides a high level view of how data is shared between peers. The solid line indicates that the leader selection algorithm picked peer id 4 to fetch the data and share the content hash with the other peers. 

![](https://i.imgur.com/UbszuKR.png)