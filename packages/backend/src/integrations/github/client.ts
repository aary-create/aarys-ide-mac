// ============================================================
// Aary's IDE — GitHub API Client
// ============================================================

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  htmlUrl: string;
  description: string | null;
  defaultBranch: string;
}

export class GitHubClient {
  private token: string;
  private baseUrl = 'https://api.github.com';

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${this.token}`,
        'User-Agent': 'Aarys-IDE',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`GitHub API error (${res.status}): ${errText}`);
    }

    return res.json() as Promise<T>;
  }

  async getUser(): Promise<{ login: string; id: number; avatar_url: string; email?: string }> {
    return this.request('/user');
  }

  async listRepositories(): Promise<GitHubRepo[]> {
    const raw = await this.request<any[]>('/user/repos?sort=updated&per_page=100');
    return raw.map((r) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      private: r.private,
      htmlUrl: r.html_url,
      description: r.description,
      defaultBranch: r.default_branch,
    }));
  }

  async createRepository(options: {
    name: string;
    description?: string;
    private?: boolean;
    autoInit?: boolean;
  }): Promise<GitHubRepo> {
    const r = await this.request<any>('/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name: options.name,
        description: options.description || '',
        private: options.private ?? false,
        auto_init: options.autoInit ?? false,
      }),
    });

    return {
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      private: r.private,
      htmlUrl: r.html_url,
      description: r.description,
      defaultBranch: r.default_branch,
    };
  }

  async listBranches(owner: string, repo: string): Promise<string[]> {
    const branches = await this.request<any[]>(`/repos/${owner}/${repo}/branches`);
    return branches.map((b) => b.name);
  }

  async listIssues(owner: string, repo: string): Promise<any[]> {
    return this.request(`/repos/${owner}/${repo}/issues?state=all`);
  }

  async listPullRequests(owner: string, repo: string): Promise<any[]> {
    return this.request(`/repos/${owner}/${repo}/pulls?state=all`);
  }
}
