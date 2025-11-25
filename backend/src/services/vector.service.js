
// const { Pinecone }=require ('@pinecone-database/pinecone')

// const pc = new Pinecone({ apiKey:process.env.PINECONE_API_KEY });

// const chatGptIndex=pc.index('chatgpt')

// async function createMemory({vectors,metadata,messageId}){
//     await chatGptIndex.upsert([{
//         id:messageId,
//         values:vectors,
//         metadata
//     }])
// }
//   async function queryMemory({queryVector,limit=5,metadata}){

//     const data = await chatGptIndex.query({
//         vector:queryVector,
//         topK:limit,
//         filter:metadata?metadata:undefined,
//         includeMetadata:true,
//     })
//     return data.matches


//   }

//   module.exports={
//     createMemory,
//     queryMemory
//   }












const { Pinecone } = require('@pinecone-database/pinecone');

const pc = new Pinecone({ 
    apiKey: process.env.PINECONE_API_KEY,
});

const chatGptIndex = pc.index('chatgpt');

async function createMemory({ vectors, metadata, messageId }) {
    await chatGptIndex.upsert([{
        id: messageId,
        values: vectors,
        metadata
    }]);
}

async function queryMemory({ queryVector, limit = 5, metadata }) {
    const data = await chatGptIndex.query({
        vector: queryVector,
        topK: limit,
        filter: metadata ? metadata : undefined,
        includeMetadata: true,
    });
    return data.matches;
}

module.exports = {
    createMemory,
    queryMemory
};