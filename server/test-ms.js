const { MongoMemoryServer } = require('mongodb-memory-server');
(async () => {
  console.log("Starting MongoMemoryServer...");
  try {
    const mongod = await MongoMemoryServer.create();
    console.log("Created. URI:", mongod.getUri());
    await mongod.stop();
  } catch (err) {
    console.error("Error:", err);
  }
})();
