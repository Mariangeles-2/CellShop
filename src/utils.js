import {fileURLToPath} from "url";
import path from "path";

// __dirname en ESModules
const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
