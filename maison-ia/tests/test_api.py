import json
import time
from concurrent.futures import ThreadPoolExecutor
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select, update
from app.main import app
from app.config import get_settings, Settings
from app.security import sign
from app import queue, proposals
from app.db import engine, jobs
from app.tools.http import _check, ExternalAPIError
from app.tools.seo import create_pr

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def auth():
    return {'Authorization': 'Bearer ' + get_settings().admin_token}

def event(id='evt-1'):
    return {'id': id, 'type': 'stock.low', 'data': {'product_id':'20985'}}

def webhook(client, payload):
    raw = json.dumps(payload).encode()
    ts = str(int(time.time()))
    return client.post('/webhooks/shop',content=raw,headers={'X-Timestamp': ts,
        'X-Signature': sign(get_settings().webhook_secret,ts,raw)})

def test_private_routes(client):
    for path in ['/jobs','/proposals','/api/status']:
        assert client.get(path).status_code == 401
    assert client.post('/ask',json={'message':'test'}).status_code==401
    assert client.get('/').status_code==200
    assert "default-src 'self'" in client.get('/').headers['content-security-policy']

def test_missing_llm_is_visible_and_not_enqueued(client):
    r=client.post('/ask',headers=auth(),json={'message':'Bonjour'})
    assert r.status_code==503
    assert queue.list_jobs()==[]

def test_status_never_returns_secrets(client):
    get_settings().openai_api_key='sk-secret-not-for-display'
    r=client.get('/api/status',headers=auth())
    assert 'sk-secret' not in r.text
    assert get_settings().admin_token not in r.text

def test_webhook_auth_duplicate_survives_engine_recreation(client):
    assert client.post('/webhooks/shop',content=b'{}').status_code==401
    assert webhook(client,event()).json()['status']=='queued'
    engine().dispose(); engine.cache_clear()
    assert webhook(client,event()).json()['status']=='duplicate'
    assert len(queue.list_jobs())==1

def test_webhook_limits_and_user_event_rejected(client):
    assert client.post('/webhooks/shop',content=b'x'*64001).status_code==413
    e=event();e['type']='user.request'
    assert webhook(client,e).status_code==422

def test_cap_atomic_across_threads():
    get_settings().max_jobs_per_day=2
    def submit(n):
        try: return queue.enqueue(event(str(n)))
        except queue.QueueFull:return False
    with ThreadPoolExecutor(max_workers=8) as pool:
        assert sum(pool.map(submit, range(8)))==2
    assert len(queue.list_jobs())==2

def test_job_claim_only_once():
    queue.enqueue(event())
    with ThreadPoolExecutor(max_workers=6) as pool:
        claimed=list(pool.map(lambda _:queue.claim(),range(6)))
    assert sum(x is not None for x in claimed)==1

def test_worker_saves_report_and_no_email_by_default():
    queue.enqueue(event())
    with patch('app.queue.ready',return_value=True),patch('app.orchestrator.handle_event',return_value='Stock à vérifier'):
        assert queue.run_one()
    j=queue.list_jobs()[0]
    assert j['status']=='completed' and j['report']=='Stock à vérifier'
    assert j['mail_status']=='disabled'

def test_worker_failure_and_stale_not_silently_retried():
    queue.enqueue(event())
    with patch('app.queue.ready',return_value=True),patch('app.orchestrator.handle_event',side_effect=RuntimeError('secret-value')):
        queue.run_one()
    assert queue.list_jobs()[0]['status']=='failed'
    assert 'secret-value' not in queue.list_jobs()[0]['error']
    with engine().begin() as c:
        c.execute(update(jobs).values(status='running',updated_at=0))
    queue.recover_stale()
    assert queue.list_jobs()[0]['status']=='interrupted'
    assert queue.claim() is None

def test_conversation_history_isolated():
    for n,thread in enumerate(['a','b']):
        queue.enqueue({'id':str(n),'type':'user.request','data':{'thread_id':thread,'message':thread}})
    with engine().begin() as c:c.execute(update(jobs).values(status='completed',report='ok'))
    assert queue.history_for({'type':'user.request','data':{'thread_id':'a'}})==[{'message':'a','report':'ok'}]

def test_manual_approval_does_not_claim_execution(client):
    pid=proposals.create('offer',{'titre':'Paire supplémentaire'},'À étudier','x')
    r=client.post(f'/proposals/{pid}/approve',headers=auth())
    assert r.json()['status']=='approved_manual'
    assert client.post(f'/proposals/{pid}/approve',headers=auth()).status_code==409

def test_publication_disabled_then_uncertain_no_retry():
    pid=proposals.create('instagram_post',{'image_url':'https://lamaisondesdessous.fr/photo.jpg','caption':'Bonjour'},'Image','x')
    with pytest.raises(ValueError):proposals.decide(pid,True)
    get_settings().instagram_publish_enabled=True
    with patch('app.tools.instagram.publish_image',side_effect=TimeoutError) as publish:
        assert proposals.decide(pid,True)['status']=='needs_review'
        with pytest.raises(ValueError):proposals.decide(pid,True)
        assert publish.call_count==1

def test_external_url_restrictions():
    for url in ['http://api.stripe.com/v1','https://localhost/x','https://api.stripe.com.evil.test/']:
        with pytest.raises(ExternalAPIError):_check(url)
    with pytest.raises(ValueError):
        proposals.validate('instagram_post',{'image_url':'https://evil.test/a.jpg','caption':'Bonjour'})

def test_production_refuses_ephemeral_database():
    with pytest.raises(ValueError):Settings(env='production',database_url='sqlite:///./x.db')

def test_seo_stale_text_never_writes():
    payload={'target':'category','key':'/bas-resille','field':'title','before':'ancien','after':'nouveau'}
    with patch('app.tools.seo.request',return_value={'object':{'sha':'abc'}}) as req,patch('app.tools.seo.document',return_value=({}, {'categories':[{'path':'/bas-resille','title':'changé'}]})):
        with pytest.raises(ValueError):create_pr(payload,'123')
        assert req.call_count==1

def test_seo_pr_targets_real_branch_and_only_approved_field():
    payload={'target':'category','key':'/bas-resille','field':'title','before':'ancien','after':'nouveau'}
    calls=[]
    def request(method,path,**kwargs):
        calls.append((method,path,kwargs))
        return {'object':{'sha':'head'},'html_url':'https://github.com/example/pull/1'}
    with patch('app.tools.seo.request',side_effect=request),patch('app.tools.seo.document',return_value=({'sha':'file'}, {'categories':[{'path':'/bas-resille','title':'ancien','description':'intacte'}]})):
        create_pr(payload,'123')
    import base64
    put=next(x for x in calls if x[0]=='PUT')
    doc=json.loads(base64.b64decode(put[2]['json']['content']))
    assert doc['categories'][0]['description']=='intacte'
    assert doc['categories'][0]['title']=='nouveau'
    assert calls[-1][2]['json']['base']=='feat/boutique-bas'
    assert calls[-1][2]['json']['draft'] is True

def test_complete_graph_mocked_without_external_calls():
    from app.orchestrator import handle_event
    with patch('app.orchestrator.analyze',return_value={'report':'Rapport vérifié','proposals':[{'kind':'offer','payload':{'titre':'Idée'},'rationale':'À étudier'}]}):
        result=handle_event({'id':'graph-1','type':'user.request','data':{'message':'Bonjour','agent':'sales'}},[])
    assert 'Thomas' in result and 'Rapport vérifié' in result
    assert len(proposals.list_all())==1
