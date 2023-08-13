const app = require('express')() 
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const { json } = require('express')
const ytdl = require('ytdl-core')
const ytld = require('ytdl-core')
const bodyparser = require('body-parser') 


// app.use(bodyparser.json())
// app.use(bodyparser.urlencoded({extended:true}))



// app.post('/', async(req, res)=>{

  
       
//     res.json(json)
    
// })


io.on('connection', (socket)=>{
    console.log(`connected ${socket.id}`)
    socket.on('listen', async(url)=>{
         
        console.log(`new reuqest - ${socket.id} - ${url}`)
        const yt= await ytld.getInfo(url) 
    
        //const videoOnly= ytld.chooseFormat(yt.formats, {quality:'248'})
        const videoOnly =  ytld.filterFormats(yt.formats, 'videoandaudio')
        const audioOnly =  ytld.filterFormats(yt.formats, 'audioonly')
    
    
        const json={
            videoDetails:yt.videoDetails, 
            videoOnly:videoOnly, 
            audioOnly:audioOnly,
            relatedVideos: yt.related_videos, 
        
        }

        delete json.videoDetails.embed
        delete json.videoDetails.availableCountries
        delete json.videoDetails.media
        delete json.videoDetails.storyboards
        delete json.videoDetails.chapters 
        
       
        
        socket.emit("listen",json )
       
    })
})


server.listen(3000, ()=>{
    console.log('listening on 3000')
})


app.get('/', async(req, res)=>{
    const url = "https://www.youtube.com/watch?v=V8sgpkH8oCM"
    const yt= await ytld.getInfo(url) 
    
    //const videoOnly= ytld.chooseFormat(yt.formats, {quality:'248'})
    const videoOnly =  ytld.filterFormats(yt.formats, 'videoandaudio')
    const audioOnly =  ytld.filterFormats(yt.formats, 'audioonly')


    var json={
        videoDetails:yt.videoDetails, 
        videoOnly:videoOnly, 
        audioOnly:audioOnly,
        relatedVideos: yt.related_videos, 
    
    }

    delete json.videoDetails.embed
    delete json.videoDetails.availableCountries
    delete json.videoDetails.media
    delete json.videoDetails.storyboards
    delete json.videoDetails.chapters 
    
   
    

    res.json(json)
})


// const app = require('express')()
// const http = require('http')
// // const app = express()
// const server= http.createServer(app)
// const io = require('socket.io')(server)
// var socket=io;

// var res;





// io.on('connection', (s)=>{
//     socket=s
//     console.log(`socket has been connected - ${s.id}`)
    
//             socket.on('cc', (msg)=>{
//                 console.log(msg)
//                 s.broadcast.emit('s.id', msg)
//                 // setTimeout(() => {
//                 //     s.emit(s.id, `2 ${msg}`)
//                 // }, 3000);
//             })
// })



// server.listen(3000, ()=>{
//     console.log('server is running on 3000')
 
    
  
    
// })



// app.get('/', (re, res)=>{
//     this.res= res
//     res.send(`${socket.connected}   ${socket.id}`)
 
// })







