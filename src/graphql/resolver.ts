
import { TestData } from './Data';

export const resolvers = {
  Query: {
    getAllData() {
      return TestData;
    },
  },
};

