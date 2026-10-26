import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/** Every sound is synthesized, so no recorded audio may sit in the repository. */
const AUDIO = /\.(mp3|ogg|wav|flac|m4a|aac|opus|webm)$/i;
const SKIP = new Set(['node_modules', '.git', 'dist', '.worktrees']);

function audioFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...audioFiles(path));
    else if (AUDIO.test(entry.name)) found.push(path);
  }
  return found;
}

describe('no audio files', () => {
  it('has no mp3, ogg or wav in the repository', () => {
    expect(audioFiles(process.cwd())).toEqual([]);
  });

  it('would notice an audio file name', () => {
    expect(AUDIO.test('boom.WAV')).toBe(true);
    expect(AUDIO.test('shot.ts')).toBe(false);
  });
});
