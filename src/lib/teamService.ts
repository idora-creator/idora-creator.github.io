import { supabase } from './supabase';
import type { Team } from '../types';

interface TeamRow {
  id: string;
  name: string;
  university: string;
  member_count: number;
  skills: string[];
  preferred_categories: string[];
  description: string;
  completed_count: number;
}

function rowToTeam(row: TeamRow): Team {
  return {
    id: row.id,
    name: row.name,
    university: row.university,
    memberCount: row.member_count,
    skills: row.skills || [],
    preferredCategories: (row.preferred_categories || []) as Team['preferredCategories'],
    description: row.description || '',
    completedCount: row.completed_count || 0,
  };
}

export async function fetchAllTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('completed_count', { ascending: false });

  if (error) throw error;
  return (data as TeamRow[] || []).map(rowToTeam);
}

export async function createTeam(team: Team): Promise<void> {
  const { error } = await supabase.from('teams').insert({
    id: team.id,
    name: team.name,
    university: team.university,
    member_count: team.memberCount,
    skills: team.skills,
    preferred_categories: team.preferredCategories,
    description: team.description,
    completed_count: team.completedCount,
  });
  if (error) throw error;
}

export async function addMatchRecord(
  teamId: string,
  villageId: string,
  score: number,
  reasons: string[]
): Promise<void> {
  const { error } = await supabase.from('matches').insert({
    team_id: teamId,
    village_id: villageId,
    score,
    reasons,
  });
  if (error) throw error;
}
