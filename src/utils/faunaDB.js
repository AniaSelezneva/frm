import faunadb from "faunadb";

export const q = faunadb.query;
export const adminClient = new faunadb.Client({
  secret: process.env.REACT_APP_FAUNA_SECRET,
});
