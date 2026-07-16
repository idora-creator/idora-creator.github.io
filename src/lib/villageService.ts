import { supabase } from './supabase';
import type { Village, VillageNeed } from '../types';

export interface VillageRow {
  id: string;
  name: string;
  province: string;
  city: string;
  county: string;
  lat: number;
  lng: number;
  visit_count: number;
  population: number;
  description: string;
  status?: string;
  created_at?: string;
}

export interface NeedRow {
  id: string;
  village_id: string;
  category: string;
  title: string;
  description: string;
  urgency: string;
  status: string;
  created_at: string;
}

function rowToVillage(row: VillageRow, needs: NeedRow[], matchedTeamIds: string[]): Village {
  return {
    id: row.id,
    name: row.name,
    province: row.province,
    city: row.city,
    county: row.county,
    lat: row.lat,
    lng: row.lng,
    visitCount: row.visit_count,
    population: row.population,
    description: row.description || '',
    needs: needs.map((n) => ({
      id: n.id,
      category: n.category as VillageNeed['category'],
      title: n.title,
      description: n.description || '',
      urgency: n.urgency as VillageNeed['urgency'],
      status: n.status as VillageNeed['status'],
      createdAt: n.created_at,
    })),
    matchedTeamIds,
    status: (row.status as Village['status']) || 'approved',
    createdAt: row.created_at || '2026-01-01',
  };
}

export async function fetchAllVillages(): Promise<Village[]> {
  const { data: villages, error } = await supabase
    .from('villages')
    .select('*')
    .order('visit_count', { ascending: false });

  if (error) throw error;
  if (!villages) return [];

  const { data: needs } = await supabase.from('village_needs').select('*');
  const needsByVillage = new Map<string, NeedRow[]>();
  if (needs) {
    for (const n of needs) {
      const list = needsByVillage.get(n.village_id) || [];
      list.push(n);
      needsByVillage.set(n.village_id, list);
    }
  }

  const { data: matches } = await supabase.from('need_team_matches').select('*');
  const matchesByVillage = new Map<string, string[]>();
  if (matches) {
    for (const m of matches) {
      const list = matchesByVillage.get(m.village_id) || [];
      list.push(m.team_id);
      matchesByVillage.set(m.village_id, list);
    }
  }

  return (villages as VillageRow[]).map((v) =>
    rowToVillage(v, needsByVillage.get(v.id) || [], matchesByVillage.get(v.id) || [])
  );
}

export async function addVillageNeed(villageId: string, need: VillageNeed): Promise<void> {
  const { error } = await supabase.from('village_needs').insert({
    id: need.id,
    village_id: villageId,
    category: need.category,
    title: need.title,
    description: need.description,
    urgency: need.urgency,
    status: need.status,
    created_at: need.createdAt,
  });
  if (error) throw error;
}

export async function updateNeedStatus(
  needId: string,
  status: VillageNeed['status']
): Promise<void> {
  const { error } = await supabase
    .from('village_needs')
    .update({ status })
    .eq('id', needId);
  if (error) throw error;
}
