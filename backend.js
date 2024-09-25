const app = require('express')() 
const http = require('http')
const server = http.createServer(app)

const https= require('https')

const io = require('socket.io')(server)
const ytdl = require('@distube/ytdl-core')
const fs = require('fs')
const f= require('axios')
const { randomInt } = require('crypto')

const port = 1000

const apitypes= [ "all", "default","initial",  "download", "related" , 
    "info", "video", "audio", "videos", "audios", "dv", "da" ,"alltypes",   ]

// hello world
const _authKey = "1138"
const urlList=[ "https://www.youtube.com/watch?v=QOMnzE2Ujzc", 
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


// io.on('connection', (socket)=>{
//     console.log(`connected ${socket.id}`)
//     socket.on('listen', async(json)=>{
         
//         console.log(`new reuqest - ${socket.id} - ${url}`)
//         const res = await getRes(json.url, json.type)
//         socket.emit("listen",res)
       
//     })
// })



app.get('/', async (req, res)=>{

    try{


    /////// ------------------ code for api ---------------

    var url = req.query.url
    const type= req.query.type
    const authKey = req.query.authkey 

    const objectToFind= '?si='
    if( url!=null && url.toString().indexOf(objectToFind) > -1){
        url= url.split(objectToFind)[0]
    }

    const body = await getRes(url, type)
   // const r = await validateRequest(url, type, authKey)
    
    if(type=="downloadvideo" || type == "downloadaudio" || type=="da" || type=="dv" ){
        //  const mimeType = type == 'dv'?"mp4":"mp3" 
        //  const id = getRandom(11111, 99999);
        //  const filePath= `./${id}.${mimeType}`
        //  await https.get(body.url, async(r)=>{
        //     r.pipe(fs.createWriteStream(filePath).on('finish', ()=>{
        //         console.log(`${id} - downloaded`)
        //         return  res.download(filePath)
        //     }).on('error', (err)=>{
          
        //     }) )
        //  }).on('error', (err)=>{
        //     return res.send(err)
        //  })
        
        
    
        return res.redirect(body.url)
    }
    return res.status(200).json(body)
    


  

 

    ////// --------------- end of api ---------------- 




    //// ----------- code for root api ----------------- 


// const urls=['https://audiotubeapi.onrender.com',
// 'https://audiotubeapi-2.onrender.com',
// 'https://audiotubeapi.onrender.com',
// 'https://audiotubeapi-2.onrender.com']


//     var url = req.query.url
//     const type= req.query.type
//     const authKey = req.query.authkey

// //updated on 26/10/2023 12:20PM

//     const objectToFind= '?si='
//     if( url!=null && url.toString().indexOf(objectToFind) > -1){
//         url= url.split(objectToFind)[0]
//     }

   
//    const urlonr=urls.at(1)
//     const urlonr= urls.at(getRandom(0,urls.length-1))
//     const body= await f.get(`${urlonr}?url=${url}&type=${type}`)
//     const b= body.data.add = {'asff':''}


//      body.data.requested_url= urlonr
//     res.status(200).json(body.data).end()



    }catch(err){
        res.status(490).send(err.toString())
    }

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
    if(url!=null){
        url= url.replace('live/', "watch?v=")
    }


    switch(type){
        
        // all 
        case apitypes[0]:
        const data = await allResponse(url)
        return data
        break

        // default
        case apitypes[1]:
         const format = await defaultResponse(url)  
         return format

        break

       // default
        case apitypes[2]:
            const dOnly = await downloadOnlyResponse(url)  
            return dOnly
        break


        // case "savemp4":
        // const r = await videoOnlyResponse(url)
        // https.get(r.url, (res) => {

        //    const path = r.url;
        //    const writeStream = fs.createWriteStream(path);
        
        //    res.pipe(writeStream);
        
        //    writeStream.on("finish", () => {
        //       writeStream.close();
        //       console.log("Download Completed!");
        //    })
        // })
       
        // break



        
      // related
      case apitypes[3]:
            const rOnly = await relatedOnlyResponse(url)  
            return rOnly
        break

        // initial
        case apitypes[4]:
            const index= getRandom(0, urlList.length)
            const newURL = urlList.at(index)
            const i = await relatedOnlyResponse(newURL)
            return i
        break
        
       // info
       case apitypes[5]:
            const donly = await detailsOnlyResponse(url)  
            return donly
        break
        
        // video
        case apitypes[6] :
            const vOnly = await videoOnlyResponse(url)  
            return vOnly
        break
        
        // audio
        case apitypes[7]:
            const aOnly = await audioOnlyResponse(url)  
            return aOnly

        break
        
       // videos
       case apitypes[8]:
            const allV = await allVideosResponse(url)  
            return allV
        break 
        
        // audios
        case apitypes[9]:
            const allA = await allAudiosResponse(url)  
            return allA
        break    

         // download video
         case apitypes[10]:
            const vd = await videoOnlyResponse(url)
            return vd
        break 

         // download audio
         case apitypes[11]:
            const ad = await audioOnlyResponse(url)  
            return ad
        break 

         // alltypes
         case apitypes[12]:
          // if(authKey==_authKey){ 
            return  apitypes;
            
         //  }
        break
            }
}



const allResponse=async(url) =>{
 const yt = await getYT(url) 
  return yt 
}


const defaultResponse=async(url)=>{
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
       var videoOnly= ytdl.chooseFormat(videos, {quality:"18",})
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


server.listen(port, ()=>{
    console.log(`listening on ${port}`)
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
