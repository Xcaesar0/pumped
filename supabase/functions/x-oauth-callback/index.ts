import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const code = url.searchParams.get("code")
    const state = url.searchParams.get("state") // This should contain the user_id
    const codeVerifier = url.searchParams.get("code_verifier") // PKCE code verifier

    if (!code) {
      throw new Error("No authorization code received from X OAuth.")
    }
    if (!state) {
      throw new Error("No state parameter received (missing user ID).")
    }

    // Get environment variables
    const X_CLIENT_ID = Deno.env.get("X_CLIENT_ID")
    const X_CLIENT_SECRET = Deno.env.get("X_CLIENT_SECRET")
    const X_REDIRECT_URI = Deno.env.get("X_REDIRECT_URI")
    const FRONTEND_URL = Deno.env.get("FRONTEND_URL")

    if (!X_CLIENT_ID || !X_CLIENT_SECRET || !X_REDIRECT_URI || !FRONTEND_URL) {
      throw new Error("Missing required environment variables for X OAuth.")
    }

    console.log("Starting X OAuth token exchange for user:", state)

    // 1. Exchange authorization code for access token
    const tokenRequestBody = new URLSearchParams({
      code: code,
      grant_type: "authorization_code",
      client_id: X_CLIENT_ID,
      redirect_uri: X_REDIRECT_URI,
      code_verifier: codeVerifier || "challenge", // Use provided code_verifier or fallback
    })

    const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${btoa(`${X_CLIENT_ID}:${X_CLIENT_SECRET}`)}`,
      },
      body: tokenRequestBody.toString(),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error("Token exchange failed:", errorData)
      throw new Error(`Failed to exchange code for token: ${JSON.stringify(errorData)}`)
    }

    const tokenData = await tokenResponse.json()
    const { access_token, refresh_token, expires_in } = tokenData

    console.log("Successfully obtained access token")

    // 2. Fetch user profile using the access token
    const userProfileResponse = await fetch("https://api.twitter.com/2/users/me", {
      headers: {
        "Authorization": `Bearer ${access_token}`,
      },
    })

    if (!userProfileResponse.ok) {
      const errorData = await userProfileResponse.json()
      console.error("User profile fetch failed:", errorData)
      throw new Error(`Failed to fetch X user profile: ${JSON.stringify(errorData)}`)
    }

    const userProfileData = await userProfileResponse.json()
    const xUser = userProfileData.data
    const xUserId = xUser.id
    const xUsername = xUser.username

    console.log("Successfully fetched X user profile:", xUsername)

    // 3. Store/Update social connection in Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") as string,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string, // Use service role key for server-side operations
    )

    const userId = state // The user_id passed in the state parameter

    // Calculate token expiration time
    const tokenExpiresAt = expires_in 
      ? new Date(Date.now() + expires_in * 1000).toISOString()
      : null

    // Check if a connection already exists for this user and platform
    const { data: existingConnection, error: fetchError } = await supabase
      .from("social_connections")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", "x")
      .maybeSingle()

    if (fetchError) {
      console.error("Error fetching existing connection:", fetchError)
      throw fetchError
    }

    if (existingConnection) {
      console.log("Updating existing X connection for user:", userId)
      // Update existing connection
      const { error: updateError } = await supabase
        .from("social_connections")
        .update({
          platform_user_id: xUserId,
          platform_username: xUsername,
          access_token: access_token,
          refresh_token: refresh_token,
          token_expires_at: tokenExpiresAt,
          is_active: true,
        })
        .eq("id", existingConnection.id)

      if (updateError) {
        console.error("Error updating social connection:", updateError)
        throw updateError
      }
    } else {
      console.log("Creating new X connection for user:", userId)
      // Create new connection
      const { error: insertError } = await supabase
        .from("social_connections")
        .insert({
          user_id: userId,
          platform: "x",
          platform_user_id: xUserId,
          platform_username: xUsername,
          access_token: access_token,
          refresh_token: refresh_token,
          token_expires_at: tokenExpiresAt,
          is_active: true,
        })

      if (insertError) {
        console.error("Error inserting social connection:", insertError)
        throw insertError
      }
    }

    console.log("Successfully stored X connection")

    // 4. Award points for X connection
    try {
      const { error: pointsError } = await supabase.rpc('increment_user_points', {
        user_id_param: userId,
        points_to_add: 100 // Award 100 points for X connection
      })

      if (pointsError) {
        console.warn("Failed to award points for X connection:", pointsError)
        // Don't fail the entire process if points can't be awarded
      } else {
        console.log("Successfully awarded 100 points for X connection")
      }
    } catch (pointsErr) {
      console.warn("Error awarding points:", pointsErr)
    }

    // 5. Update task progress after successful connection
    try {
      const { error: taskError } = await supabase.rpc('update_task_progress', {
        user_id_param: userId
      })

      if (taskError) {
        console.warn("Failed to update task progress:", taskError)
        // Don't fail the entire process if task progress can't be updated
      } else {
        console.log("Successfully updated task progress")
      }
    } catch (taskErr) {
      console.warn("Error updating task progress:", taskErr)
    }

    // 6. Redirect back to frontend on success
    console.log("Redirecting user back to frontend with success")
    return Response.redirect(`${FRONTEND_URL}?x_connect_success=true`, 302)

  } catch (error) {
    console.error("X OAuth callback error:", error)
    
    // Get frontend URL for error redirect
    const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "http://localhost:5173" // Fallback for development
    
    // Redirect back to frontend with error
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return Response.redirect(`${FRONTEND_URL}?x_connect_error=${encodeURIComponent(errorMessage)}`, 302)
  }
})