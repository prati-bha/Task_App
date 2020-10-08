const { connect } = require("mongoose");

const connectionString = process.env.MONGODB_URL;
connect(
    connectionString,
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    }
);
