import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# Initialize Supabase client
supabase: Client | None = None


def init_supabase():
    global supabase
    if SUPABASE_URL and SUPABASE_KEY:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✓ Supabase initialized")
    else:
        print("⚠ SUPABASE_URL or SUPABASE_KEY not set - database features disabled")


def get_supabase() -> Client | None:
    return supabase
