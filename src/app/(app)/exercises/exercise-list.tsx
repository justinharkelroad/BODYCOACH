'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import type { Exercise } from '@/types/database';

interface ExerciseListProps {
  exercises: Exercise[];
  bodyParts: { value: string; label: string }[];
  difficulties: { value: string; label: string }[];
}

export function ExerciseList({ exercises, bodyParts, difficulties }: ExerciseListProps) {
  const [search, setSearch] = useState('');
  const [bodyPart, setBodyPart] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch = search === '' ||
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.description?.toLowerCase().includes(search.toLowerCase()) ||
        ex.muscles_primary.some(m => m.toLowerCase().includes(search.toLowerCase()));

      const matchesBodyPart = bodyPart === 'all' || ex.body_part === bodyPart;
      const matchesDifficulty = difficulty === 'all' || ex.difficulty === difficulty;

      return matchesSearch && matchesBodyPart && matchesDifficulty;
    });
  }, [exercises, search, bodyPart, difficulty]);

  const difficultyColors = {
    beginner: 'bg-[var(--accent-mint-light)] text-[var(--success)]',
    intermediate: 'bg-[var(--primary-light)] text-[var(--primary-deep)]',
    advanced: 'bg-[var(--accent-coral-light)] text-[var(--accent-coral)]',
  };

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--neutral-gray)]" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-[12px] border border-[rgba(184,169,232,0.3)] bg-white text-[var(--neutral-dark)] placeholder-[var(--neutral-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-lavender)] focus:border-transparent"
          />
        </div>

        {/* Body Part Filter */}
        <select
          value={bodyPart}
          onChange={(e) => setBodyPart(e.target.value)}
          className="px-4 py-3 rounded-[12px] border border-[rgba(184,169,232,0.3)] bg-white text-[var(--neutral-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-lavender)] focus:border-transparent"
        >
          {bodyParts.map((bp) => (
            <option key={bp.value} value={bp.value}>{bp.label}</option>
          ))}
        </select>

        {/* Difficulty Filter */}
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="px-4 py-3 rounded-[12px] border border-[rgba(184,169,232,0.3)] bg-white text-[var(--neutral-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-lavender)] focus:border-transparent"
        >
          {difficulties.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      <p className="text-sm text-[var(--neutral-gray)]">
        Showing {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''}
      </p>

      {/* Exercise Cards */}
      <div className="space-y-3">
        {filteredExercises.map((exercise) => {
          const isExpanded = expandedId === exercise.id;

          return (
            <Card key={exercise.id} className="overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : exercise.id)}
                className="w-full text-left"
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-[var(--neutral-dark)] truncate">
                          {exercise.name}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[exercise.difficulty]}`}>
                          {exercise.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--neutral-gray)] line-clamp-1">
                        {exercise.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs bg-[var(--neutral-gray-light)] text-[var(--neutral-gray)] px-2 py-1 rounded-lg capitalize">
                          {exercise.body_part.replace('_', ' ')}
                        </span>
                        {exercise.muscles_primary.slice(0, 2).map((muscle) => (
                          <span
                            key={muscle}
                            className="text-xs bg-[var(--primary-light)] text-[var(--primary-deep)] px-2 py-1 rounded-lg"
                          >
                            {muscle}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-[var(--neutral-gray)]">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-[rgba(184,169,232,0.1)]">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Instructions */}
                    <div>
                      <h4 className="font-medium text-[var(--neutral-dark)] mb-2">Instructions</h4>
                      <ol className="space-y-2">
                        {exercise.instructions.map((step, i) => (
                          <li key={i} className="text-sm text-[var(--neutral-gray)] flex gap-2">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--primary-light)] text-[var(--primary-deep)] text-xs flex items-center justify-center font-medium">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                      {/* Equipment */}
                      <div>
                        <h4 className="font-medium text-[var(--neutral-dark)] mb-2">Equipment</h4>
                        <div className="flex flex-wrap gap-2">
                          {exercise.equipment.map((eq) => (
                            <span
                              key={eq}
                              className="text-sm bg-[var(--neutral-gray-light)] text-[var(--neutral-dark)] px-3 py-1 rounded-lg capitalize"
                            >
                              {eq.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Muscles */}
                      <div>
                        <h4 className="font-medium text-[var(--neutral-dark)] mb-2">Muscles Worked</h4>
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-[var(--neutral-gray)]">Primary:</span>
                            {exercise.muscles_primary.map((muscle) => (
                              <span
                                key={muscle}
                                className="text-sm bg-[var(--primary-light)] text-[var(--primary-deep)] px-2 py-0.5 rounded-lg"
                              >
                                {muscle}
                              </span>
                            ))}
                          </div>
                          {exercise.muscles_secondary.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              <span className="text-xs text-[var(--neutral-gray)]">Secondary:</span>
                              {exercise.muscles_secondary.map((muscle) => (
                                <span
                                  key={muscle}
                                  className="text-sm bg-[var(--neutral-gray-light)] text-[var(--neutral-gray)] px-2 py-0.5 rounded-lg"
                                >
                                  {muscle}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--neutral-gray)]">No exercises found matching your filters.</p>
          </div>
        )}
      </div>
    </>
  );
}
