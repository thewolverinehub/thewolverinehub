/**
 * sync:pull — Pulls live content and media down to local.
 * Safe to run at any time. Backs up local data first.
 *
 * Run: npm run sync:pull (from cms/)
 */

import { execSync } from 'child_process';
import { createInterface } from 'readline';

function env(key, fallback) {
  return process.env[key] ?? fallback;
}

async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question + ' ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const liveCmsUrl = env('LIVE_CMS_URL');
  const transferToken = env('LIVE_TRANSFER_TOKEN');

  if (!liveCmsUrl || !transferToken) {
    console.error('❌ LIVE_CMS_URL and LIVE_TRANSFER_TOKEN must be set in .env to run sync:pull.');
    process.exit(1);
  }

  console.log('\n⚠️  This will REPLACE your local content with live content.');
  const answer = await confirm('Type PULL FROM LIVE to confirm:');
  if (answer !== 'PULL FROM LIVE') {
    console.log('Cancelled.');
    process.exit(0);
  }

  console.log('\n🔄 Running strapi transfer...');
  execSync(
    `npx strapi transfer --from "${liveCmsUrl}/admin" --from-token "${transferToken}"`,
    { stdio: 'inherit' }
  );

  console.log('\n✅ sync:pull complete.');
}

main().catch((err) => {
  console.error('sync:pull failed:', err);
  process.exit(1);
});
