import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
Deno.serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') || '' } } });
  const { data: caller } = await supabase.auth.getUser(req.headers.get('Authorization')?.replace('Bearer ', '') || '');
  const { data: owner } = await supabase.from('admin_users').select('role,active').eq('auth_user_id', caller.user?.id).single();
  if (!owner?.active || owner.role !== 'owner') return Response.json({ error: 'Owner access required' }, { status: 403 });
  const { email, name, password, role = 'admin' } = await req.json();
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  const { data: admin, error: insertError } = await supabase.from('admin_users').insert({ auth_user_id: data.user.id, email, name: name || 'Admin', role }).select('id,email,name,role').single();
  if (insertError) return Response.json({ error: insertError.message }, { status: 400 });
  return Response.json(admin);
});
