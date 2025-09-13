import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC_IMG1 = '/Users/sasha/IdeaProjects/personal_core_services/website/root/src/app/assets/images';
const SRC_IMG2 = '/Users/sasha/IdeaProjects/personal_core_services/website/root/public/assets/images';
const SRC_MIDI = '/Users/sasha/IdeaProjects/personal_core_services/website/root/public/assets/midi';
const SRC_FONTS = '/Users/sasha/IdeaProjects/personal_core_services/website/root/public/fonts';
const DST = path.resolve(process.cwd(), 'public');

async function safeCp(src: string, dst: string) {
  try {
    await cp(src, dst, { recursive: true });
    console.log(`✓ Copied ${src} → ${dst}`);
  } catch (e) {
    console.warn(`⚠ Failed to copy ${src}: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}

async function main() {
  console.log('🚀 Starting asset migration...');
  
  await mkdir(DST, { recursive: true });
  
  await safeCp(SRC_IMG1, path.join(DST, 'images'));
  await safeCp(SRC_IMG2, path.join(DST, 'images'));
  await safeCp(SRC_MIDI, path.join(DST, 'midi'));
  await safeCp(SRC_FONTS, path.join(DST, 'fonts'));
  
  console.log('✅ Asset migration complete!');
}

main().catch(e => {
  console.error('❌ Migration failed:', e);
  process.exit(1);
});
