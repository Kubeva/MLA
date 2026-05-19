import swaggerAutogen from "swagger-autogen";

const file = {
    info: {
        title: 'API',
        description: 'Auto generated swagger'
    },
    host: 'localhost:4000'
};

const outputFile = './swagger.json';
const endpointFile = ['./server.js'];

swaggerAutogen(outputFile, endpointFile, file);