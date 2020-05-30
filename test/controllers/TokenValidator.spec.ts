import { MongoClient, Db, Collection } from 'mongodb';
import { TokenValidator } from '../../src/controllers/TokenValidator';
import { User } from '../../src/entities/User';

describe('TokenValidator', () => {
  let connection: MongoClient;
  let db: Db;

  beforeAll(() => MongoClient.connect(process.env.MONGO_URL as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(conn => {
      connection = conn;
      db = connection.db();
    })
  );

  beforeEach(() => db.collection('user').deleteMany({}));

  afterAll(() => connection.close());

  describe('validate', () => {
    test('if true when token exists in db', done => {
      // ARRANGE
      const user: User = { _id: '1', sourceUserId: 'sourceUserId', accessToken: 'accessToken' };
      const validator: TokenValidator = new TokenValidator(db);

      Promise.resolve()
        .then(() => db.collection('user').insertOne(user))
        // ACT
        .then(() => validator.validate(user.accessToken as string))
        // ASSERT
        .then(result => expect(result).toBeTruthy())
        .then(done)
        .catch(done);
    });

    test('if false when token not exists in db', done => {
      // ARRANGE
      const user: User = { _id: '1', sourceUserId: 'sourceUserId', accessToken: 'accessToken' };
      const validator: TokenValidator = new TokenValidator(db);

      Promise.resolve()
        .then(() => db.collection('user').insertOne(user))
        // ACT
        .then(() => validator.validate('otherAccessToken'))
        // ASSERT
        .then(result => expect(result).toBeFalsy())
        .then(done)
        .catch(done);
    })
  });
});
