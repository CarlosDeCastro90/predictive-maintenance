from functools import lru_cache
from supabase import create_client, Client
from app.core.config import get_settings

settings = get_settings()


@lru_cache
def get_supabase() -> Client:
    """Cliente com anon key — respeita Row Level Security."""
    return create_client(settings.supabase_url, settings.supabase_anon_key)


@lru_cache
def get_supabase_admin() -> Client:
    """Cliente com service key — bypassa RLS. Usar só no backend."""
    return create_client(settings.supabase_url, settings.supabase_service_key)