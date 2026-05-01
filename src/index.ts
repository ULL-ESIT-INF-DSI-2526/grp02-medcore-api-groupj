import { connect } from "mongoose";

connect(
  "mongodb+srv://medcore-api:medcoreDSI@medcore-cluster.9nvpmia.mongodb.net/medcore-api",
)
  .then(() => {
    console.log(`Connection to MongoDB server established`);
  })
  .catch(() => {
    console.log(`Unable to connect to MongoDB server`);
  });
