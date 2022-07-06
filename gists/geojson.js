import { geojson } from 'flatgeobuf';
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buffer = fs.readFileSync(path.join(__dirname, '../data/geo/states.json'))
const fileContent = JSON.parse(buffer.toString());

const flatgeobuf = geojson.serialize(fileContent)
console.log(`Serialized input GeoJson into FlatGeobuf (${flatgeobuf.length} bytes)`)