# Webrtc-star Docker Setup

1. Create an AWS Ubuntu instance

2. Download and setup `docker` for your system. See [Digital Ocean's guide](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-22-04) as a good resource

3. Also install `docker-compose`

```bash
$ sudo apt install docker-compose
```

4. Copy the below into a docker-compose.yml file on your machine

```
version: "3.3"
services:

    js-libp2p-webrtc-star:
        image: libp2p/js-libp2p-webrtc-star
        environment:
            - VIRTUAL_HOST=${DOMAIN}
            - LETSENCRYPT_HOST=${DOMAIN}
            - VIRTUAL_PORT=9090
        networks:
            service_network:

    nginx-proxy:
        image: jwilder/nginx-proxy
        ports:
            - 443:443
            - 80:80
        container_name: nginx-proxy
        networks:
            service_network:
        volumes:
            - /var/run/docker.sock:/tmp/docker.sock:ro
            - nginx-certs:/etc/nginx/certs
            - nginx-vhost:/etc/nginx/vhost.d
            - nginx-html:/usr/share/nginx/html
        depends_on:
            - js-libp2p-webrtc-star

    nginx-proxy-letsencrypt:
        image: jrcs/letsencrypt-nginx-proxy-companion
        environment:
            NGINX_PROXY_CONTAINER: "nginx-proxy"
        networks:
            service_network:
        volumes:
            - /var/run/docker.sock:/var/run/docker.sock:ro
            - nginx-certs:/etc/nginx/certs
            - nginx-vhost:/etc/nginx/vhost.d
            - nginx-html:/usr/share/nginx/html

networks:
    service_network:

volumes:
    nginx-certs:
    nginx-vhost:
    nginx-html:
```

Then run `DOMAIN=<yourdomain.com> docker-compose up -d`

5. Ensure your domain is pointed to the public IP address of the aws instance

6. Validate that the signalling-server is working on the host machine

```
curl http://127.0.0.1:9090
```

You should get back raw html containing the signalling server address, e,g `/dns4/<yourdomain.com>/tcp/443/wss/p2p-webrtc-star`
