// Supabase Edge Function: send-sms
// Sends an SMS via Twilio's REST API. Requires an authenticated user.
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface SendSmsBody {
  to?: string;
  message?: string;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Authentication ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ success: false, error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
      return json({ success: false, error: "Server misconfigured" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    // --- Input ---
    const { to, message } = (await req.json()) as SendSmsBody;
    if (!to || !message) {
      return json({ success: false, error: "Missing 'to' or 'message'" }, 400);
    }
    if (typeof to !== "string" || typeof message !== "string") {
      return json({ success: false, error: "Invalid input" }, 400);
    }
    if (!/^\+[1-9]\d{6,15}$/.test(to)) {
      return json({ success: false, error: "Invalid phone number" }, 400);
    }
    if (message.length > 480) {
      return json({ success: false, error: "Message too long" }, 400);
    }

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
    if (!accountSid || !authToken || !fromNumber) {
      return json({ success: false, error: "Twilio credentials not configured" }, 500);
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const body = new URLSearchParams({ To: to, From: fromNumber, Body: message });

    const twilioRes = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const data = await twilioRes.json();
    if (!twilioRes.ok) {
      console.error("Twilio error:", data);
      return json({ success: false, error: data?.message ?? "Twilio request failed" }, twilioRes.status);
    }
    return json({ success: true, sid: data.sid });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("send-sms exception:", msg);
    return json({ success: false, error: msg }, 500);
  }
});
