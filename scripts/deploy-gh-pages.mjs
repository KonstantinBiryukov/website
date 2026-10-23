/**
 * deploy-gh-pages.mjs — publish dist/ to the `gh-pages` branch, which GitHub
 * Pages serves at https://konstantinbiryukov.github.io/website/ .
 *
 *   npm run deploy               build, show a summary, ask, then push
 *   npm run deploy -- --dry-run  do everything except the push
 *   npm run deploy -- --yes      skip the confirmation prompt
 *
 * Differences from the previous scripts/gh-pages-deploy.js:
 *  - It never switches branches in your working copy and never touches
 *    uncommitted files: the branch is prepared in a temporary git worktree.
 *  - It adds a commit ON TOP of the existing gh-pages history and pushes
 *    without --force, so earlier deployments stay recoverable. (The old
 *    script recreated gh-pages as an orphan branch and force-pushed it.)
 *  - It refuses to publish a build that fails verification.
 */
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry-run');
const ASSUME_YES = args.has('--yes');
const BRANCH = 'gh-pages';
const URL = 'https://konstantinbiryukov.github.io/website/';

/** Run git and return trimmed stdout; output streams through on failure. */
const git = (...gitArgs) => execFileSync('git', gitArgs, { encoding: 'utf8' }).trim();

// 1) Build + verify (npm run build runs typecheck, vite build and verify-dist).
console.log('› Building…');
execFileSync('npm', ['run', 'build'], { stdio: 'inherit' });

// 2) Fetch the current gh-pages and check it out in a temporary worktree.
console.log(`› Fetching origin/${BRANCH}…`);
git('fetch', 'origin', BRANCH);
const worktree = mkdtempSync(join(tmpdir(), 'portfolio-gh-pages-'));
git('worktree', 'add', '--detach', worktree, `origin/${BRANCH}`);

try {
  // 3) Replace the worktree's files with dist/ (keep only the .git link).
  for (const entry of readdirSync(worktree)) {
    if (entry !== '.git') rmSync(join(worktree, entry), { recursive: true, force: true });
  }
  cpSync('dist', worktree, { recursive: true });

  const source = git('rev-parse', '--short', 'HEAD');
  const dirty = git('status', '--porcelain') !== '' ? ' (with uncommitted changes)' : '';
  execFileSync('git', ['add', '--all'], { cwd: worktree });
  const changes = execFileSync('git', ['status', '--short'], { cwd: worktree, encoding: 'utf8' }).trim();
  if (changes === '') {
    console.log('✓ gh-pages already matches this build — nothing to deploy.');
  } else {
    const lines = changes.split('\n');
    console.log(`\n${lines.length} file(s) change on ${BRANCH}:`);
    console.log(lines.slice(0, 25).join('\n') + (lines.length > 25 ? `\n… and ${lines.length - 25} more` : ''));
    execFileSync('git', ['commit', '--quiet', '-m', `Deploy ${new Date().toISOString()} from ${source}${dirty}`], { cwd: worktree });

    if (DRY_RUN) {
      console.log('\n✓ Dry run: commit prepared in a temporary worktree, nothing pushed.');
    } else {
      let proceed = ASSUME_YES;
      if (!proceed) {
        const rl = createInterface({ input: process.stdin, output: process.stdout });
        proceed = /^y(es)?$/i.test(await rl.question(`\nPush to origin/${BRANCH} and publish ${URL}? [y/N] `));
        rl.close();
      }
      if (proceed) {
        // Plain push (no --force): fails safely if gh-pages moved meanwhile.
        execFileSync('git', ['push', 'origin', `HEAD:${BRANCH}`], { cwd: worktree, stdio: 'inherit' });
        console.log(`\n✓ Published. GitHub Pages updates ${URL} within a minute or two.`);
      } else {
        console.log('Cancelled — nothing pushed.');
      }
    }
  }
} finally {
  // 4) Always remove the temporary worktree.
  git('worktree', 'remove', '--force', worktree);
}
