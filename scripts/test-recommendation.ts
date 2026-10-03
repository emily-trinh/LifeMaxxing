import { recommendEvent } from '../services/recommendation';
import { testEvents, testPreferences } from './recommendationData';

async function main() {
  try {
    const recommendation = await recommendEvent(testPreferences, testEvents);
    console.log(JSON.stringify(recommendation, null, 2));
  } catch (error) {
    console.error('Event recommendation failed.');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

void main();