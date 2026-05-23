from typing import List, Optional, Dict, Any
from groq import Groq
from app.core.config import get_settings

settings = get_settings()

SYSTEM_PROMPT = """
És um assistente especialista em manutenção preditiva industrial chamado PredictAI.
As tuas competências incluem análise de dados de sensores (vibração, temperatura, RPM),
diagnóstico de falhas em motores, compressores, bombas e geradores,
e recomendações de manutenção preventiva e correctiva.
Responde sempre em Português de Portugal.
Sê directo e prático. Indica sempre o nível de urgência: NORMAL / ATENÇÃO / URGENTE / CRÍTICO.
Sugere sempre uma próxima acção clara. Mantém respostas concisas (máximo 300 palavras).
"""


class GroqService:
    def __init__(self):
        self.client = Groq(api_key=settings.groq_api_key)
        self.model = settings.groq_model

    def chat_sync(
        self,
        message: str,
        history: List[Dict[str, str]],
        machine_context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        if machine_context:
            context_text = self._build_machine_context(machine_context)
            messages.append({
                "role": "system",
                "content": f"CONTEXTO ACTUAL DA MÁQUINA:\n{context_text}"
            })

        messages.extend(history[-10:])
        messages.append({"role": "user", "content": message})

        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=600,
            temperature=0.3,
        )

        return {
            "response": response.choices[0].message.content,
            "tokens_used": response.usage.total_tokens if response.usage else None,
        }

    def _build_machine_context(self, ctx: Dict[str, Any]) -> str:
        return f"""
Máquina: {ctx.get('name')} ({ctx.get('machine_type')})
Status: {ctx.get('status')} | Health Score: {ctx.get('health_score')}%
Localização: {ctx.get('location', 'N/A')}
Vibração RMS: {ctx.get('vib_rms', 'N/A')} m/s²
Temp. rolamento: {ctx.get('temp_bearing', 'N/A')} °C
RPM: {ctx.get('rpm', 'N/A')}
""".strip()


_groq_service: Optional[GroqService] = None


def get_groq_service() -> GroqService:
    global _groq_service
    if _groq_service is None:
        _groq_service = GroqService()
    return _groq_service