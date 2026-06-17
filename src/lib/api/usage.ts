import { supabase } from '../supabase';
import { ToolId, UsageLog } from '../types';

/**
 * Records a single AI tool invocation. Fire-and-forget: failures never block
 * the user-facing flow.
 */
export async function logUsage(tool: ToolId, inputChars: number, outputChars: number): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('usage_logs').insert({
      user_id: user.id,
      tool,
      input_chars: inputChars,
      output_chars: outputChars,
    });
  } catch {
    // intentionally ignored — usage logging must not break the tool
  }
}

export async function getMyUsage(limit = 100): Promise<UsageLog[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('usage_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as UsageLog[];
}
