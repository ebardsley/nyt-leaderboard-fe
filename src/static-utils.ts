import fs from 'fs';
import path from 'path';

import {DataByPlayer, dataForPeriod} from 'data';

export function loadData(): DataByPlayer {
  const dataFilename = path.join(process.cwd(), 'src', 'nytxw-combined.json');
  const dataContents = fs.readFileSync(dataFilename, 'utf8');
  const data = JSON.parse(dataContents);
  return dataForPeriod(data);  // This sorts data correctly.
}
