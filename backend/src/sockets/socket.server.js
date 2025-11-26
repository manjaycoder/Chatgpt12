// const { Server } = require("socket.io");
// const cookie = require("cookie");
// const jwt = require("jsonwebtoken");
// const userModel = require("../models/user.model");
// const { generateResponse,generateVector}= require('../services/ai.service')
// const messageModel = require('../models/message.model')
// const{createMemory,queryMemory}=require('../services/vector.service')
// function initSocketServer(httpServer) {
// const io = new Server(httpServer, {});

//   io.use(async (socket, next) => {
//     try {
//       const cookies = cookie.parse(socket.handshake.headers.cookie || "");
//       console.log(cookies);

//       if (!cookies.token) {
//         return next(new Error("authentication no token provided"));
//       }

//       const token = cookies.token;
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       const user = await userModel.findOne({ _id:decoded.id });
//       if (!user) {
//         return next(new Error("authentication user not found"));
//       }

//       socket.user = user; 
//       next();
//     } catch (err) {
//       next(new Error("authentication error invalid token"));
//     }
//   });

//   io.on("connection", (socket) => {
//    socket.on('ai-message', async (messagePayload)=>{
//     console.log(messagePayload)

// /*
//      const message = await messageModel.create({
//       chat:messagePayload.chat,
//       user:socket.user._id,
//       content:messagePayload.content,
//       role:"user",
//     })

   
//     const vectors = await generateVector(messagePayload.content)
//     */


//     const [ message,vectors]=await Promise.all([
      
//  messageModel.create({
//       chat:messagePayload.chat,
//       user:socket.user._id,
//       content:messagePayload.content,
//       role:"user",  }),


//      generateVector(messagePayload.content),


//     ])
    
//      await  createMemory({
//       vectors:vectors,
//       messageId:"message._id",
//       metadata:{
//         chat:messagePayload.chat,
//         user:socket.user._id,
//         text:messagePayload.content
//       }
//     })


    
//     //  const previousMessages = await queryMemory({
//     //   queryVector:vectors,
//     //   limit:3,
//     //   metadata:{}
//     // }) 
//     // console.log('previousMessages',previousMessages)

   
     

//     // const  chatHistory = (await messageModel.find({
//     //   chat: messagePayload.chat
//     // }).sort({createdAt:-1}).limit(20).lean()).reverse() 

   


//     const [previousMessages,chatHistory]= await Promise.all([

//  queryMemory({
//       queryVector:vectors,
//       limit:3,
//       metadata:{ chat: messagePayload.chat }
//         }) ,

//         messageModel.find({
//       chat: messagePayload.chat
//     }).sort({createdAt:-1}).limit(20).lean().then(messages=>messages.reverse())

  
//     ])
    

//      // fix part of code
   
//     const stm = chatHistory.map(item => ({
//       role: item.role,
//       parts: [{ text: item.content }]
//     }))

   
//    stm.push({
//       role: "user",
//       parts: [{ text: messagePayload.content }]
//     })


    
//     const ltm = [
//       {
//         role:'user',
//         parts:[{text:`
//             these are some previous message from the chat ,use them to generate a response 
//             ${previousMessages.map(item=>item.metadata.text).join("\n")}`
//         }]


//       }
//     ]
//     console.log(ltm,stm )

//     const response = await generateResponse([...ltm,...stm])

//     //  const responseMessage=await messageModel.create({
//     //   chat:messagePayload.chat,
//     //   user:socket.user._id,
//     //   content:response,
//     //   role:"model",
//     // })

//     // const responseVectors = await generateVector(response)




//     socket.emit('ai-response-message',{
//       content:response,
//       chat:messagePayload.chat
//     })

//     const [responseMessage,responseVectors]=await Promise.all([
//   messageModel.create({
//       chat:messagePayload.chat,
//        user:socket.user._id,
//       content:response,
//       role:"model",
//      }),
    

//   ])


//     await createMemory({ 
//       vectors:responseVectors,
//       messageId:"responseMessage._id",
//       metadata:{
//         chat:messagePayload.chat,
//         user:socket.user._id,
//         text:response
//       }
//     })

//     console.log(response)

//    })
//   });
// }

// module.exports = initSocketServer;










const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { generateResponse, generateVector } = require('../services/ai.service')
const messageModel = require('../models/message.model')
const { createMemory, queryMemory } = require('../services/vector.service')

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173",
      "https://chatgpt12.vercel.app"] ,
        methods: ["GET", "POST"],
  
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true
      
    }
  });

  // Authentication Middleware (No changes needed)
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      if (!cookies.token) {
        return next(new Error("authentication no token provided"));
      }

      const token = cookies.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findOne({ _id: decoded.id });
      
      if (!user) {
        return next(new Error("authentication user not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("authentication error invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on('ai-message', async (messagePayload) => {
      try {
        
        // --- CRITICAL FIX: VALIDATION FOR EMPTY CONTENT ---
        if (!messagePayload || !messagePayload.content || messagePayload.content.trim() === '') {
             console.log("Error: Received empty message payload.");
             return socket.emit('ai-error', { message: "Message content cannot be empty." });
        }
        // -------------------------------------------------
        
        console.log(messagePayload)

        // 1. Save User Message & Generate Vector (Parallel)
        const [message, vectors] = await Promise.all([
          messageModel.create({
            chat: messagePayload.chat,
            user: socket.user._id,
            content: messagePayload.content,
            role: "user",
          }),
          generateVector(messagePayload.content),
        ]);

        // 2. Create Memory for User Message
        await createMemory({
          vectors: vectors,
          messageId: message._id.toString(), 
          metadata: {
            chat: messagePayload.chat,
            user: socket.user._id.toString(),
            text: messagePayload.content
          }
        });

        // 3. Query Memory and Fetch Chat History (Parallel)
        const [previousMessages, chatHistory] = await Promise.all([
          queryMemory({
            queryVector: vectors,
            limit: 3,
            metadata: { chat: messagePayload.chat }
          }),
          messageModel.find({ chat: messagePayload.chat })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()
            .then(messages => messages.reverse())
        ]);
        
        // 4. Construct Prompt (Short-Term Memory + Long-Term Memory)
        const stm = chatHistory.map(item => ({
          role: item.role,
          parts: [{ text: item.content }]
        }));

        stm.push({
          role: "user",
          parts: [{ text: messagePayload.content }]
        });

        const ltm = [
          {
            role: 'user',
            parts: [{
              text: `These are some previous messages from the chat, use them for context to generate a response. Do not explicitly mention this context.
              Context: ${previousMessages.map(item => item.metadata.text).join("\n")}`
            }]
          }
        ];

        // 5. Generate Response
        const response = await generateResponse([...ltm, ...stm]);

        // 6. Emit Response
        socket.emit('ai-response-message', {
          content: response,
          chat: messagePayload.chat
        });

        // 7. Save Response Message & Generate Vector (Parallel)
        const [responseMessage, responseVectors] = await Promise.all([
          messageModel.create({
            chat: messagePayload.chat,
            user: socket.user._id,
            content: response,
            role: "model",
          }),
          generateVector(response)
        ]);

        // 8. Create Memory for AI Response
        await createMemory({
          vectors: responseVectors,
          messageId: responseMessage._id.toString(),
          metadata: {
            chat: messagePayload.chat,
            user: socket.user._id.toString(),
            text: response
          }
        });

        console.log("AI Response Sent:", response);

      } catch (error) {
        console.error("Socket AI Message Error:", error);
        // Send a detailed error back to the client
        socket.emit('ai-error', { message: "Failed to process message or generate response.", details: error.message });
      }
    });
  });
}

module.exports = initSocketServer;






