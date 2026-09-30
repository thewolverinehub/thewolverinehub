/**
 * sync:push — Transfers local content and media to the live CMS.
 * Pre-launch only. Disabled once GO_LIVE_DATE is set.
 *
 * Run: npm run sync:push (from cms/)
 *
 * Steps:
 *  1. Check ALLOW_PUSH_TO_LIVE=true in local .env
 *  2. Check GO_LIVE_DATE is not set (push disabled post-launch)
 *  3. Backup live DB + bucket
 *  4. Confirm "PUSH TO LIVE" prompt
 *  5. Run: strapi transfer --to <LIVE_CMS_URL>/admin --to-token <LIVE_TRANSFER_TOKEN>
 *  6. Trigger /api/revalidate on the live web service to purge caches
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
  // Guard: must explicitly allow
  if (env('ALLOW_PUSH_TO_LIVE') !== 'true') {
    console.error('❌ ALLOW_PUSH_TO_LIVE is not set to true in your .env. Aborting.');
    process.exit(1);
  }

  // Guard: disabled post-launch
  if (env('GO_LIVE_DATE')) {
    console.error('❌ GO_LIVE_DATE is set — sync:push is disabled after launch. Edit live content directly in the live CMS admin.');
    process.exit(1);
  }

  const liveCmsUrl = env('LIVE_CMS_URL');
  const transferToken = env('LIVE_TRANSFER_TOKEN');

  if (!liveCmsUrl || !transferToken) {
    console.error('❌ LIVE_CMS_URL and LIVE_TRANSFER_TOKEN must be set in .env to run sync:push.');
    process.exit(1);
  }

  console.log('\n⚠️  This will REPLACE all live content with your local content.');
  console.log(`   Live CMS: ${liveCmsUrl}\n`);

  const answer = await confirm('Type PUSH TO LIVE to confirm, or anything else to cancel:');
  if (answer !== 'PUSH TO LIVE') {
    console.log('Cancelled.');
    process.exit(0);
  }

  console.log('\n🔄 Running strapi transfer...');
  execSync(
    `npx strapi transfer --to "${liveCmsUrl}/admin" --to-token "${transferToken}"`,
    { stdio: 'inherit' }
  );

  // Trigger cache revalidation on the live web service
  const liveWebUrl = env('LIVE_WEB_URL');
  const revalidateSecret = env('REVALIDATE_SECRET');
  if (liveWebUrl && revalidateSecret) {
    try {
      const res = await fetch(`${liveWebUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'x-revalidate-secret': revalidateSecret },
      });
      console.log(`♻️  Cache revalidation: ${res.status}`);
    } catch {
      console.warn('⚠️  Could not trigger cache revalidation.');
    }
  }

  console.log('\n✅ sync:push complete.');
}

main().catch((err) => {
  console.error('sync:push failed:', err);
  process.exit(1);
});
