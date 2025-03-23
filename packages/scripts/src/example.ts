import { Resource } from "sst";
import { Example } from "@sstauth/core/example";

console.log(`${Example.hello()} Linked to ${Resource.MyBucket.name}.`);
