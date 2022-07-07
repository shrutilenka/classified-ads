import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { deserialize, serialize } from '../node_modules/flatgeobuf/lib/mjs/geojson.js';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const buffer = fs.readFileSync(path.join(__dirname, '../data/geo/states.json'))
const fileContent = JSON.parse(buffer.toString())
const flatgeobuf = serialize(fileContent)
fs.appendFileSync(path.join(__dirname, '../data/geo/states.fgb'), Buffer.from(flatgeobuf));
const pickle = fs.readFileSync(path.join(__dirname, '../data/geo/states.fgb'))
const bytes = new Uint8Array(pickle);
deserialize(bytes)