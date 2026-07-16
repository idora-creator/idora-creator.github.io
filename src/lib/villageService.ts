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

export async function createVillage(village: Village): Promise<void> {
  const { error: vErr } = await supabase.from('villages').insert({
    id: village.id,
    name: village.name,
    province: village.province,
    city: village.city,
    county: village.county,
    lat: village.lat,
    lng: village.lng,
    visit_count: village.visitCount,
    population: village.population,
    description: village.description,
    status: village.status,
    created_at: village.createdAt,
  });
  if (vErr) throw vErr;

  if (village.needs.length > 0) {
    const needsRows = village.needs.map((n) => ({
      id: n.id,
      village_id: village.id,
      category: n.category,
      title: n.title,
      description: n.description,
      urgency: n.urgency,
      status: n.status,
      created_at: n.createdAt,
    }));
    const { error: nErr } = await supabase.from('village_needs').insert(needsRows);
    if (nErr) throw nErr;
  }
}

export async function updateVillage(
  id: string,
  updates: {
    name?: string;
    city?: string;
    county?: string;
    lat?: number;
    lng?: number;
    population?: number;
    description?: string;
    needs?: VillageNeed[];
  }
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.city !== undefined) row.city = updates.city;
  if (updates.county !== undefined) row.county = updates.county;
  if (updates.lat !== undefined) row.lat = updates.lat;
  if (updates.lng !== undefined) row.lng = updates.lng;
  if (updates.population !== undefined) row.population = updates.population;
  if (updates.description !== undefined) row.description = updates.description;

  if (Object.keys(row).length > 0) {
    const { error } = await supabase.from('villages').update(row).eq('id', id);
    if (error) throw error;
  }

  if (updates.needs !== undefined) {
    const { error: delErr } = await supabase
      .from('village_needs')
      .delete()
      .eq('village_id', id);
    if (delErr) throw delErr;

    if (updates.needs.length > 0) {
      const needsRows = updates.needs.map((n) => ({
        id: n.id,
        village_id: id,
        category: n.category,
        title: n.title,
        description: n.description,
        urgency: n.urgency,
        status: n.status,
        created_at: n.createdAt,
      }));
      const { error: insErr } = await supabase.from('village_needs').insert(needsRows);
      if (insErr) throw insErr;
    }
  }
}

export async function deleteVillage(id: string): Promise<void> {
  const { error } = await supabase.from('villages').delete().eq('id', id);
  if (error) throw error;
}

export async function updateVillageStatus(
  id: string,
  status: string
): Promise<void> {
  const { error } = await supabase
    .from('villages')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}
