import { Injectable } from '@angular/core';
import { supabase } from '../core/supabase.client';


export type UserTabRow = {
  user_id: string;
  device_id: string;
  tab_id: string;
  user_agent: string;
  is_active: boolean;
  last_seen: string; 
};

@Injectable({
  providedIn: 'root'
})
export class UserTabsApiService {
  upsertTab(row: UserTabRow) {
    return supabase
      .from('user_tabs')
      .upsert(row, { onConflict: 'user_id,device_id,tab_id' });
  }

  listMyTabs(userId: string) {
    return supabase
      .from('user_tabs')
      .select('*')
      .eq('user_id', userId);
  }
}
