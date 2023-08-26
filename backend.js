const app = require('express')() 
const http = require('http')
const server = http.createServer(app)

const https= require('https')

const io = require('socket.io')(server)
const ytdl = require('ytdl-core')
const fs = require('fs')

// hello world
const _authKey = "1234"
const urlList=["https://www.youtube.com/watch?v=QOMnzE2Ujzc", 
                "https://www.youtube.com/watch?v=s-00rrCI8ac", 
                 "https://www.youtube.com/watch?v=dWBgNHT4ipE", 
                 "https://www.youtube.com/watch?v=rL6qQ49hBlQ", 
                 "https://www.youtube.com/watch?v=Jk0Xv1adP3s", 
                 "https://www.youtube.com/watch?v=lW9djo-zm7k", 
                 "https://www.youtube.com/watch?v=9OZtJUEXykE", 
                 "https://www.youtube.com/watch?v=IH6Z2Hid338",
                 "https://www.youtube.com/watch?v=Mev3TVUNqbI", 
                 "https://www.youtube.com/watch?v=De-bLfEUeLE"
                              
                ] 


io.on('connection', (socket)=>{
    console.log(`connected ${socket.id}`)
    socket.on('listen', async(json)=>{
         
        console.log(`new reuqest - ${socket.id} - ${url}`)
        const res = await getRes(json.url, json.type)
        socket.emit("listen",res)
       
    })
})



app.get('/', async (req, res)=>{

    const url = req.query.url
    const type= req.query.type
    const authKey = req.query.authkey 
    url = url.replace('live/', "watch?v=")
    const body = await getRes(url, type)
   // const r = await validateRequest(url, type, authKey)
    res.status(200).json(body)
 
})


const validateRequest=async(url, type, authKey)=>{
    var body
    var code=200

    if(type==null) {
        code=400 
        body={
            error:true, 
            message:"bad request", 
            code:code, 

        }
        
    }

    if(authKey==_authKey) {
        body = await getRes(url, type)
    }else{
        code=401
      body={
        error:true, 
        message:"unauthorized access", 
        code:code
      }
    }

    return {
        code:code, 
        body:body
    }
}




const getRes=async(url, type)=>{
    
    switch(type){
        case "all":
        const data = await allResponse(url)
        return data
        break
        
        case "formatted":
         const format = await formattedResponse(url)  
         return format

        break

        case "downloadonly":
            const dOnly = await downloadOnlyResponse(url)  
            return dOnly
        break


        case "savemp4":
        const r = await videoOnlyResponse(url)
        https.get(r.url, (res) => {

           const path = r.url;
           const writeStream = fs.createWriteStream(path);
        
           res.pipe(writeStream);
        
           writeStream.on("finish", () => {
              writeStream.close();
              console.log("Download Completed!");
           })
        })
       
        break
        
        case "relatedonly":
            const rOnly = await relatedOnlyResponse(url)  
            return rOnly
        break

        case "initial":
            const index= getRandom(0, urlList.length)
            const newURL = urlList.at(index)
            const i = await relatedOnlyResponse(newURL)
            return i
        break
        
        case "detailsonly":
            const donly = await detailsOnlyResponse(url)  
            return donly
        break
        
        case "videoonly":
            const vOnly = await videoOnlyResponse(url)  
            return vOnly
        break
        
        case "audioonly":
            const aOnly = await audioOnlyResponse(url)  
            return aOnly

        break
        
        case "allvideos":
            const allV = await allVideosResponse(url)  
            return allV
        break 
        
        case "allaudios":
            const allA = await allAudiosResponse(url)  
            return allA
        break    

        case "showalltypes":
          // if(authKey==_authKey){
           
            return   [ "all", "formatted","initial",  "downloadonly", "relatedonly" , "detailsonly", "videoonly", "audioonly", "allvideos", "allaudios", "showalltypes", 
        ]
            
         //  }
        break
    }
}



const allResponse=async(url) =>{
 const yt = await getYT(url) 
  return yt 
}


const formattedResponse=async(url)=>{
    const yt = await getYT(url) 
    const dInfo = await getDownloadInfo(yt) 
    removeUnnecessaryFields(yt)
    const json = normalJsonResponse(yt, dInfo)
    return json

}

const downloadOnlyResponse=async(url)=>{
  const yt = await getYT(url) 
  removeUnnecessaryFields(yt) 
  const dInfo = getDownloadInfo(yt) 
  return dInfo
}


const relatedOnlyResponse=async(url)=>{
    const yt = await getYT(url) 
    return yt.related_videos
}

const detailsOnlyResponse=async(url)=>{
    const yt = await getYT(url) 
    return yt.videoDetails
}

const videoOnlyResponse=async(url) =>{
    const yt = await getYT(url) 
    const dInfo = getDownloadInfo(yt) 
    return dInfo.videoOnly
}
const audioOnlyResponse=async(url) =>{
    const yt = await getYT(url) 
    const dInfo = getDownloadInfo(yt) 
    return dInfo.audioOnly
}

const allVideosResponse=async(url) =>{
    const yt = await getYT(url) 
    const videos = ytdl.filterFormats(yt.formats, 'video')
    return videos
}
const allAudiosResponse=async(url) =>{
    const yt = await getYT(url) 
    const audios= ytdl.filterFormats(yt.formats, 'audio')
    return audios 
}




const removeUnnecessaryFields=(yt)=>{
    delete yt.videoDetails.embed
    delete yt.videoDetails.availableCountries
    delete yt.videoDetails.media
    delete yt.videoDetails.storyboards
    delete yt.videoDetails.chapters 
}


const normalJsonResponse=(yt, dInfo)=>{
    
    const json={
        videoDetails:yt.videoDetails, 
        videoOnly:dInfo.videoOnly, 
        audioOnly:dInfo.audioOnly, 
        relatedVideos:yt.related_videos
    }

    return json
}


const getYT= async(url)=>{
    const yt= await ytdl.getInfo(url)
    return yt;
}

const getDownloadInfo=(yt)=>{
    const videos =  ytdl.filterFormats(yt.formats, 'audioandvideo')
    const audios =  ytdl.filterFormats(yt.formats, 'audioonly')

    const audioOnly = ytdl.chooseFormat(audios, {quality:"140"})
    try{
        var videoOnly= ytdl.chooseFormat(videos, {quality:"22",})
    }catch(e){
        videoOnly= videos[0]
    }


    // if(videoOnly==null){
        
    // }

    return {
        "videoOnly":videoOnly, 
        "audioOnly":audioOnly
    }
}



const getRandom=(min, max)=>{
    return Math.floor(Math.random()*(max-min)+min)
}


server.listen(3000, ()=>{
    console.log('listening on 3000')
})








// switch(type){
//     case "all":
//     const data = await allResponse(url)
//     res.json(data)
//     break
    
//     case "formatted":
//      const format = await formattedResponse(url)  
//      res.json(format)

    
//     break

//     case "downloadonly":
//         const dOnly = await downloadOnlyResponse(url)  
//         res.json(dOnly)
//     break
    
//     case "relatedonly":
//         const rOnly = await relatedOnlyResponse(url)  
//         res.json(rOnly)
//     break
    
//     case "detailsonly":
//         const donly = await detailsOnlyResponse(url)  
//         res.json(donly)
//     break
    
//     case "videoonly":
//         const vOnly = await videoOnlyResponse(url)  
//         res.json(vOnly)
//     break
    
//     case "audioonly":
//         const aOnly = await audioOnlyResponse(url)  
//         res.json(aOnly)

//     break
    
//     case "allvideos":
//         const allV = await allVideosResponse(url)  
//         res.json(allV)
//     break 
    
//     case "allaudios":
//         const allA = await allAudiosResponse(url)  
//         res.json(allA)
//     break    

//     case "showalltypes":
//       // if(authKey==_authKey){
//         res.json(
//            [ "all", "formatted", "downloadonly", "relatedonly" , "detailsonly", "videoonly", "audioonly", "allvideos", "allaudios", "showalltypes"]
//         )
//      //  }
//     break
// }