// ============================================================
// Aary's IDE — Git Tool
// ============================================================

import { spawn } from 'child_process';
import { registerTool } from './registry.js';

async function runGit(args: string[], cwd?: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn('git', args, { cwd: cwd || process.cwd(), timeout: 30000 });
    let stdout = '', stderr = '';
    child.stdout.on('data', d => { stdout += d; });
    child.stderr.on('data', d => { stderr += d; });
    child.on('close', code => resolve({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode: code || 0 }));
    child.on('error', reject);
  });
}

registerTool({
  name: 'git_status', category: 'git',
  description: 'Get the current git status of a repository.',
  parameters: { cwd: { type: 'string', description: 'Repository path', required: true } },
  requiredPermissions: ['git.read'], requiresApproval: false, supportedPlatforms: ['windows', 'macos', 'linux'],
}, async (args) => runGit(['status', '--porcelain', '-b'], args.cwd as string));

registerTool({
  name: 'git_init', category: 'git',
  description: 'Initialize a new git repository.',
  parameters: { cwd: { type: 'string', description: 'Directory path', required: true } },
  requiredPermissions: ['git.write'], requiresApproval: false, supportedPlatforms: ['windows', 'macos', 'linux'],
}, async (args) => runGit(['init'], args.cwd as string));

registerTool({
  name: 'git_add', category: 'git',
  description: 'Stage files for commit.',
  parameters: {
    cwd: { type: 'string', description: 'Repository path', required: true },
    files: { type: 'string', description: 'Files to add (use "." for all)', required: true },
  },
  requiredPermissions: ['git.write'], requiresApproval: false, supportedPlatforms: ['windows', 'macos', 'linux'],
}, async (args) => runGit(['add', args.files as string], args.cwd as string));

registerTool({
  name: 'git_commit', category: 'git',
  description: 'Create a git commit.',
  parameters: {
    cwd: { type: 'string', description: 'Repository path', required: true },
    message: { type: 'string', description: 'Commit message', required: true },
  },
  requiredPermissions: ['git.write'], requiresApproval: false, supportedPlatforms: ['windows', 'macos', 'linux'],
}, async (args) => runGit(['commit', '-m', args.message as string], args.cwd as string));

registerTool({
  name: 'git_push', category: 'git',
  description: 'Push commits to remote repository.',
  parameters: {
    cwd: { type: 'string', description: 'Repository path', required: true },
    remote: { type: 'string', description: 'Remote name', required: false, default: 'origin' },
    branch: { type: 'string', description: 'Branch name', required: false },
  },
  requiredPermissions: ['git.write'], requiresApproval: true, supportedPlatforms: ['windows', 'macos', 'linux'],
}, async (args) => {
  const gitArgs = ['push', args.remote as string || 'origin'];
  if (args.branch) gitArgs.push(args.branch as string);
  return runGit(gitArgs, args.cwd as string);
});

registerTool({
  name: 'git_log', category: 'git',
  description: 'Show recent git commits.',
  parameters: {
    cwd: { type: 'string', description: 'Repository path', required: true },
    limit: { type: 'number', description: 'Number of commits', required: false, default: 10 },
  },
  requiredPermissions: ['git.read'], requiresApproval: false, supportedPlatforms: ['windows', 'macos', 'linux'],
}, async (args) => runGit(['log', `--oneline`, `-${args.limit || 10}`], args.cwd as string));

registerTool({
  name: 'git_diff', category: 'git',
  description: 'Show unstaged changes.',
  parameters: { cwd: { type: 'string', description: 'Repository path', required: true } },
  requiredPermissions: ['git.read'], requiresApproval: false, supportedPlatforms: ['windows', 'macos', 'linux'],
}, async (args) => runGit(['diff', '--stat'], args.cwd as string));

registerTool({
  name: 'git_branch', category: 'git',
  description: 'List or create branches.',
  parameters: {
    cwd: { type: 'string', description: 'Repository path', required: true },
    name: { type: 'string', description: 'New branch name (omit to list)', required: false },
  },
  requiredPermissions: ['git.read'], requiresApproval: false, supportedPlatforms: ['windows', 'macos', 'linux'],
}, async (args) => {
  if (args.name) return runGit(['checkout', '-b', args.name as string], args.cwd as string);
  return runGit(['branch', '-a'], args.cwd as string);
});

registerTool({
  name: 'git_clone', category: 'git',
  description: 'Clone a repository.',
  parameters: {
    url: { type: 'string', description: 'Repository URL', required: true },
    path: { type: 'string', description: 'Destination path', required: true },
  },
  requiredPermissions: ['git.write'], requiresApproval: true, supportedPlatforms: ['windows', 'macos', 'linux'],
}, async (args) => runGit(['clone', args.url as string, args.path as string]));
