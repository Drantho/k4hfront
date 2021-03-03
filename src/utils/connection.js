import openSocket from 'socket.io-client';
import Peer from 'peerjs';

export default function connection() {

    const myPeer = new Peer(undefined, {
        path: '/peerjs',
        host: '/',
        port: '443'
    })
}