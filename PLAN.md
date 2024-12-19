Home Page
    - Authentication
    - Two Video Screens
        - One for user one for other person
        - Text chatting box

NodeJS
Express
Some front end library like react

User opens home page
User authenticates
User goes to two video screen and chat page
Get request from client goes to server
Server has a redis queue
    - When there are more than two users waiting
    - Pop them off queue, add them to single chatroom
    - use some redis dictionary or something
When popped off of redis queue
    - startup the webrtc p2p connection
    - send user information to signalling server
    - start video feed between the users
Server should also handle text messages from users and requesting a new video partner and leaving the webpage
    - Text message from user is a post request to the server
    - Server looks up dictionary with their room and sends it to the other client ip

    - Requesting a new video chat can be a get request
    - Remove users from chat room
    - Add users back to redis queue and repeat the above process

    - When a user leaves the webpage, delete the chatroom
    - Have the other user added to the redis queue


Run http-server to start the html website
Run node src/app.ts to start the server