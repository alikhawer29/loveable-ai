import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const adminEmail = "admin@testadmin.com";
    const adminPassword = "Infinity@2026";

    // Check if admin already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingAdmin = existingUsers?.users?.find(u => u.email === adminEmail);

    let adminUserId: string;

    if (existingAdmin) {
      adminUserId = existingAdmin.id;
    } else {
      // Create admin user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { full_name: "Tom Albert" },
      });
      if (createError) throw createError;
      adminUserId = newUser.user.id;
    }

    // Ensure admin role exists
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: adminUserId, role: "admin" }, { onConflict: "user_id,role" });

    if (roleError) throw roleError;

    return new Response(JSON.stringify({ success: true, adminUserId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
