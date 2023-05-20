import React from "react";
import { useState, useEffect } from "react";
import axios from 'axios';
import {over} from 'stompjs';
import SockJS from "sockjs-client";

var stompClient = null;
const ImageUploadPage = () => {

    const url = "http://ec2-43-206-252-183.ap-northeast-1.compute.amazonaws.com:8080/";
    //const url = "http://localhost:8080/";
    const [selectedImage, setSelectedImage] = useState(null);
    const [download, setDownload] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() =>{
        connect();
    }, [])

    const connect = () => {
        let Sock = new SockJS(url + 'service');
        stompClient = over(Sock);
        //stompClient.connect({}, Connected, notConnected);
        
    }

    const Connected = () => {
        stompClient.subscribe('/app/message', MessageReceived);
        console.log("subscribed");
    }

    const notConnected = () => {
        alert("connection fail");
    }

    const MessageReceived = (payload) => {
        console.log("received");
        setDownload(url + 'download/' + payload.body);
        window.location.replace(url + 'download/' + payload.body);
        alert("image downloaded");
        setLoading(false);
        stompClient.unsubscribe(payload.body.substring(10));
        console.log("unsubed " + payload.body.substring(10));
        //axios.get(url + 'download/' + payload.body).then((res) => {
        //  console.log(res);
        //}).catch((e) => {
        //  console.log(e);
        //});
        //console.log(totalChat);
    }

    
    function upload(){
        const formData = new FormData();
        formData.append('file', selectedImage);
        axios.post(url + 'api/upload', formData).then((res) => {
            console.log(res);
            setLoading(true);
            var Sock = new SockJS(url + 'service');
            stompClient = over(Sock);
            stompClient.connect({}, function (frame) {
              console.log('Connected: ' + frame);
              setTimeout(function() {
                 stompClient.subscribe("/app/"+res.data, MessageReceived, {id: res.data});
              }, 500);});
              console.log("subscribed " + res.data);
        }).catch((e) =>{
            console.log(e);
        })
    }
  
    return (
      <div>
        <h1>Comp3358 assignment 4</h1>
  
        {selectedImage && (
          <div>
            <img
              alt="not found"
              width={"250px"}
              src={URL.createObjectURL(selectedImage)}
            />
            <br />
            <button onClick={() => setSelectedImage(null)}>Remove</button>
          </div>
        )}
  
        <br />
        <br />

        {
          loading && (<h3>Your image is processing</h3>)
        }
        
        <input
          type="file"
          name="myImage"
          onChange={(event) => {
            console.log(event.target.files[0]);
            setSelectedImage(event.target.files[0]);
          }}
        />

        <button onClick={(e) => upload()}>Resize</button>
      </div>
    );
  };

  export default ImageUploadPage;