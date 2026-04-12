'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import type { CoachNote } from '@/types/database';

interface CoachNotesSectionProps {
  clientId: string;
  initialNotes: CoachNote[];
}

export function CoachNotesSection({ clientId, initialNotes }: CoachNotesSectionProps) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAdd() {
    if (!newNote.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote.trim() }),
      });
      if (res.ok) {
        const { note } = await res.json();
        setNotes(prev => [note, ...prev]);
        setNewNote('');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(noteId: string) {
    if (!editContent.trim()) return;
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, content: editContent.trim() }),
      });
      if (res.ok) {
        setNotes(prev => prev.map(n => n.id === noteId ? { ...n, content: editContent.trim(), updated_at: new Date().toISOString() } : n));
        setEditingId(null);
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  }

  async function handleDelete(noteId: string) {
    if (!confirm('Delete this note?')) return;
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/notes?noteId=${noteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== noteId));
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }

  return (
    <div className="space-y-4">
      {/* Add note */}
      <div className="flex gap-2">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note about this client..."
          rows={2}
          className="flex-1 px-4 py-3 rounded-xl bg-[var(--theme-bg-alt)] border-2 border-transparent focus:outline-none focus:border-[var(--theme-primary)] focus:bg-white transition-all resize-none text-sm text-[var(--theme-text)]"
        />
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={!newNote.trim() || isSubmitting}
          className="self-end"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <p className="text-sm text-[var(--theme-text-muted)] py-4 text-center">No notes yet.</p>
      ) : (
        <div className="space-y-3">
          {notes.map(note => (
            <div key={note.id} className="p-3 rounded-xl bg-[var(--theme-bg-alt)] group">
              {editingId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[var(--theme-border)] focus:outline-none focus:border-[var(--theme-primary)] text-sm text-[var(--theme-text)] resize-none"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(note.id)}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-[var(--theme-text)] whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-[var(--theme-text-muted)]">
                      {new Date(note.updated_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingId(note.id); setEditContent(note.content); }}
                        className="p-1 rounded hover:bg-[var(--theme-border)] transition-colors"
                        aria-label="Edit note"
                      >
                        <Pencil className="h-3.5 w-3.5 text-[var(--theme-text-muted)]" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-1 rounded hover:bg-[var(--theme-border)] transition-colors"
                        aria-label="Delete note"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-[var(--theme-error)]" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
