import json
from typing import TypedDict
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, START, END
from .agents import ROLES, RULES, analyze, parse_json
from .llm import complete
from . import proposals

ROUTES = {"order.paid": ["finance", "purchasing"], "order.refunded": ["finance", "sales"],
          "stock.low": ["purchasing"], "weekly.seo": ["seo", "community"],
          "daily.briefing": ["finance", "purchasing", "seo", "sales", "community"], "user.request": []}
class ShopEvent(BaseModel):
    id: str = Field(min_length=1, max_length=100, pattern=r"^[a-zA-Z0-9_.:-]+$")
    type: str
    data: dict = Field(default_factory=dict)

class State(TypedDict, total=False):
    event: dict
    history: list
    selected: list
    reports: list
    report: str

def route(state):
    event = state["event"]
    explicit = event["data"].get("agent")
    selected = ROUTES[event["type"]]
    if event["type"] == "user.request":
        if explicit in ROLES:
            selected = [explicit]
        else:
            response = complete(RULES + ' Tu es la Direction. Sélectionne de 1 à 3 spécialistes. '
                'Réponds uniquement en JSON {"agents":[...]}. Clés autorisées : ' + ', '.join(ROLES),
                json.dumps({"demande": event["data"].get("message"), "historique": state.get("history", [])}, ensure_ascii=False), 400)
            try:
                selected = list(dict.fromkeys(k for k in parse_json(response)["agents"] if k in ROLES))[:3]
            except (ValueError, TypeError, KeyError):
                selected = ["sales"]
            selected = selected or ["sales"]
    return {"selected": selected}

def specialists(state):
    event = state["event"]
    reports = []
    for key in state["selected"]:
        result = analyze(key, json.dumps(event, ensure_ascii=False), state.get("history", []))
        ids = []
        candidates = result.get("proposals", [])
        if isinstance(candidates, list):
            for candidate in candidates[:1]:
                try:
                    item = proposals.ProposalInput.model_validate(candidate)
                    ids.append(proposals.create(item.kind, item.payload, item.rationale, event["id"]))
                except (ValueError, TypeError):
                    result["report"] += "\nProposition non enregistrée : format invalide."
        reports.append({"agent": ROLES[key][0], "report": result["report"], "propositions": ids})
    return {"reports": reports}

def synthesize(state):
    if len(state["reports"]) == 1:
        r = state["reports"][0]
        return {"report": r["agent"] + "\n\n" + r["report"]}
    summary = complete(RULES + " Tu es la Direction. Synthétise les rapports, tranche les priorités, "
                       "réponds à la demande et précise ce qui reste à valider. Ne prétends jamais avoir exécuté une proposition.",
                       json.dumps({"demande": state["event"], "rapports": state["reports"]}, ensure_ascii=False), 1800)
    detail = "\n\n".join(r["agent"] + "\n" + r["report"] for r in state["reports"])
    return {"report": summary + "\n\n— Rapports des spécialistes —\n\n" + detail}

builder = StateGraph(State)
builder.add_node("direction", route)
builder.add_node("specialists", specialists)
builder.add_node("synthesis", synthesize)
builder.add_edge(START, "direction")
builder.add_edge("direction", "specialists")
builder.add_edge("specialists", "synthesis")
builder.add_edge("synthesis", END)
graph = builder.compile()

def handle_event(event, history):
    return graph.invoke({"event": event, "history": history}, {"recursion_limit": 8})["report"]
