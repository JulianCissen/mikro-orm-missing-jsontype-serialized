import { Entity, JsonType, MikroORM, PrimaryKey, Property, serialize } from '@mikro-orm/sqlite';

@Entity()
class User {
  @PrimaryKey()
  id!: number;

  @Property({ type: JsonType })
  data: Record<string, string> = {};

  constructor() {}
}

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    dbName: ':memory:',
    entities: [User],
    debug: ['query', 'query-params'],
    allowGlobalContext: true, // only for testing
  });
  await orm.schema.refreshDatabase();
});

afterAll(async () => {
  await orm.close(true);
});

test('serialized object should be typed properly', async () => {
  const user = orm.em.create(User, {});
  const serialized = serialize(user);
  // Property 'data' does not exist on type 'EntityDTO<Loaded<User, never>, {}>'.
  serialized.data;

  // This does work, but shouldn't be required as data is not a relation.
  const serialized2 = serialize(user, { populate: ['data'] });
  serialized2.data;
});
