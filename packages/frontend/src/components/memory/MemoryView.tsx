// ============================================================
// Aary's IDE — Persistent Memory View
// Working, User, Project, Task, and Knowledge Memory
// ============================================================

import React, { useEffect, useState } from 'react';
import { Brain, Search, Trash2, Tag, BookOpen, Clock } from 'lucide-react';
import { Card, Input, Button, Badge } from '../ui/index.js';
import { apiRequest } from '../../api/client.js';

export const MemoryView: React.FC = () => {
  const [memories, setMemories] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [newContent, setNewContent] = useState('');

  const loadMemories = async () => {
    try {
      const catParam = category === 'all' ? '' : category;
      const res = await apiRequest(`/memory?q=${encodeURIComponent(query)}${catParam ? `&category=${catParam}` : ''}`);
      setMemories(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMemories();
  }, [category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadMemories();
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    try {
      await apiRequest('/memory', {
        method: 'POST',
        body: JSON.stringify({ content: newContent, category: 'knowledge' }),
      });
      setNewContent('');
      loadMemories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiRequest(`/memory/${id}`, { method: 'DELETE' });
      loadMemories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Persistent Memory</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Independent cross-model memory spanning conversations, devices, and projects.
        </p>
      </div>

      {/* Add Memory Form */}
      <Card title="Add Manual Memory" subtitle="Inject stable instructions or reusable facts">
        <form onSubmit={handleAddMemory} className="flex items-center space-x-2 pt-2">
          <Input
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="e.g. Always use Tailwind CSS and strict TypeScript types..."
          />
          <Button type="submit" size="sm">
            Remember
          </Button>
        </form>
      </Card>

      {/* Search and Category filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex-1 w-full flex items-center space-x-2">
          <Input
            placeholder="Search memory..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit" size="sm" variant="secondary">
            <Search className="w-3.5 h-3.5" />
          </Button>
        </form>

        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto">
          {['all', 'working', 'user', 'project', 'task', 'knowledge'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap ${
                category === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Memories List */}
      <div className="space-y-3">
        {memories.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No memories found.</p>
        ) : (
          memories.map((m) => {
            const entry = m.entry || m;
            return (
              <div
                key={entry.id}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start justify-between space-x-4"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="info">{entry.category?.toUpperCase() || 'KNOWLEDGE'}</Badge>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(entry.createdAt || entry.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {entry.content}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(entry.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                  title="Delete memory"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
