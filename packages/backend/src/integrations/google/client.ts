// ============================================================
// Aary's IDE — Google API Base Client
// ============================================================

export class GoogleApiClient {
  protected accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  protected async get<T>(url: string): Promise<T> {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText);
      throw new Error(`Google API error (${res.status}): ${err}`);
    }
    return res.json() as Promise<T>;
  }

  protected async post<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText);
      throw new Error(`Google API error (${res.status}): ${err}`);
    }
    return res.json() as Promise<T>;
  }
}
