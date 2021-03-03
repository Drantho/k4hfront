import { React, useEffect } from 'react';
import { useParams } from "react-router-dom"
// import connection from "../utils/connection";
import Peer from "peerjs";
import { io } from "socket.io-client";

export default function VideoChat() {
    const { room } = useParams();

    const myPeer = new Peer(undefined, {
        path: '/peerjs',
        host: '/',
        port: '443',
        path: "/"
    });

    const socket = io();

    useEffect(() => {
        let myVideoStream;
        const videoGrid = document.getElementById("videoGrid")
        const myVideo = document.createElement('video')
        myVideo.muted = true;
        const peers = {}
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            myVideoStream = stream;
            addVideoStream(myVideo, stream)
            myPeer.on('call', call => {
                console.log("myPeer.on(call) fires")
                call.answer(stream)
                const video = document.createElement('video')
                call.on('stream', userVideoStream => {
                    addVideoStream(video, userVideoStream)
                })
            })

            socket.on('user-connected', userId => {
                console.log("socket.on(user-connected) fires")
                connectToNewUser(userId, stream)
            })

        })

        socket.on('user-disconnected', userId => {
            if (peers[userId]) peers[userId].close()
        })

        myPeer.on('open', id => {
            console.log(`myPeer.on(open) fires`);
            socket.emit('join-room', room)
        })

        function connectToNewUser(userId, stream) {
            const call = myPeer.call(userId, stream)
            const video = document.createElement('video')
            console.log("connectToNewUser(userID, stream) fires")
            call.on('stream', userVideoStream => {
                console.log("call.on(stream) fires")
                addVideoStream(video, userVideoStream)
            })
            call.on('close', () => {
                video.remove()
                console.log("call.on(close) fires")
            })

            peers[userId] = call
        }

        function addVideoStream(video, stream) {
            video.srcObject = stream
            video.addEventListener('loadedmetadata', () => {
                video.play()
            })
            videoGrid.append(video)
        }

        const muteUnmute = () => {
            const enabled = myVideoStream.getAudioTracks()[0].enabled;
            if (enabled) {
                myVideoStream.getAudioTracks()[0].enabled = false;
                setUnmuteButton();
            } else {
                setMuteButton();
                myVideoStream.getAudioTracks()[0].enabled = true;
            }
        }

        const playStop = () => {
            console.log('object')
            let enabled = myVideoStream.getVideoTracks()[0].enabled;
            if (enabled) {
                myVideoStream.getVideoTracks()[0].enabled = false;
                setPlayVideo()
            } else {
                setStopVideo()
                myVideoStream.getVideoTracks()[0].enabled = true;
            }
        }

        const setMuteButton = () => {
            const html = `
<span>Mute</span>
`
            document.querySelector('.main__mute_button').innerHTML = html;
        }

        const setUnmuteButton = () => {
            const html = `
<span>Unmute</span>
`
            document.querySelector('.main__mute_button').innerHTML = html;
        }

        const setStopVideo = () => {
            const html = `
<span>Stop Video</span>
`
            document.querySelector('.main__video_button').innerHTML = html;
        }

        const setPlayVideo = () => {
            const html = `
<span>Play Video</span>
`
            document.querySelector('.main__video_button').innerHTML = html;
        }


    }, [])

    return (
        <div>
            <h1>Video Chat</h1>
            <h2>Room: {room}</h2>
            <div id="videoGrid"/>
            <div className="main__mute_button"></div>
            <div className="main__video_button"></div>
        </div>
    )
}


